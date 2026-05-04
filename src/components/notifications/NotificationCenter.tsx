import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Bell,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  Shield,
  Package,
  CheckCircle2,
  Clock,
  Trash2,
  Settings,
  MailOpen,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from '../../services/database';
import type { Notification as DBNotification, NotificationType } from '../../types';

interface NotificationCenterProps {
  onBack: () => void;
}

type DisplayType = 'booking' | 'message' | 'payment' | 'review' | 'system' | 'security';

function toDisplayType(type: NotificationType): DisplayType {
  if (type.startsWith('booking')) return 'booking';
  if (type === 'new_message') return 'message';
  if (type === 'payment_received') return 'payment';
  if (type === 'new_review') return 'review';
  if (type === 'verification_approved' || type === 'verification_rejected') return 'security';
  return 'system';
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString([], { day: 'numeric', month: 'short' });
}

interface PrefRow {
  push_booking_requests: boolean;
  push_booking_updates: boolean;
  push_messages: boolean;
  push_reviews: boolean;
  push_promotions: boolean;
}

const DEFAULT_PREFS: PrefRow = {
  push_booking_requests: true,
  push_booking_updates: true,
  push_messages: true,
  push_reviews: true,
  push_promotions: false,
};

export default function NotificationCenter({ onBack }: NotificationCenterProps) {
  const { user, refreshNotifications } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'bookings' | 'messages'>('all');
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<PrefRow>(DEFAULT_PREFS);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadPrefs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notification_preferences')
      .select('push_booking_requests,push_booking_updates,push_messages,push_reviews,push_promotions')
      .eq('user_id', user.id)
      .single();
    if (data) setPrefs(data as PrefRow);
  }, [user]);

  useEffect(() => {
    load();
    loadPrefs();
  }, [load, loadPrefs]);

  useEffect(() => {
    if (!user) return;
    const channel = subscribeToNotifications(user.id, (n) => {
      setNotifications(prev => [n, ...prev]);
    });
    return () => { channel.unsubscribe(); };
  }, [user]);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    try {
      await markNotificationRead(id);
      refreshNotifications();
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await markAllNotificationsRead(user.id);
      refreshNotifications();
    } catch (e) {
      console.error('Failed to mark all read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await supabase.from('notifications').delete().eq('id', id);
    } catch (e) {
      console.error('Failed to delete notification:', e);
    }
  };

  const clearAll = async () => {
    if (!user || !confirm('Are you sure you want to clear all notifications?')) return;
    setNotifications([]);
    try {
      await supabase.from('notifications').delete().eq('user_id', user.id);
      refreshNotifications();
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    }
  };

  const togglePref = async (key: keyof PrefRow) => {
    if (!user) return;
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await supabase
      .from('notification_preferences')
      .upsert({ user_id: user.id, ...updated, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.is_read;
    if (activeTab === 'bookings') return n.type.startsWith('booking');
    if (activeTab === 'messages') return n.type === 'new_message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: NotificationType) => {
    switch (toDisplayType(type)) {
      case 'booking': return <Calendar className="w-5 h-5" />;
      case 'message': return <MessageSquare className="w-5 h-5" />;
      case 'payment': return <DollarSign className="w-5 h-5" />;
      case 'review': return <Star className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'system': return <Package className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (toDisplayType(type)) {
      case 'booking': return 'bg-blue-100 text-blue-600';
      case 'message': return 'bg-purple-100 text-purple-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'review': return 'bg-amber-100 text-amber-600';
      case 'security': return 'bg-red-100 text-red-600';
      case 'system': return 'bg-gray-100 text-gray-600';
    }
  };

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'bookings', label: 'Bookings', count: notifications.filter(n => n.type.startsWith('booking')).length },
    { id: 'messages', label: 'Messages', count: notifications.filter(n => n.type === 'new_message').length },
  ];

  const prefItems: { key: keyof PrefRow; label: string; description: string }[] = [
    { key: 'push_booking_requests', label: 'Booking updates', description: 'New bookings, confirmations, cancellations' },
    { key: 'push_messages', label: 'Messages', description: 'New messages from renters and owners' },
    { key: 'push_reviews', label: 'Reviews', description: 'New reviews on your equipment' },
    { key: 'push_promotions', label: 'Marketing', description: 'Tips, promotions, and platform updates' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-red-500 text-white text-sm font-medium rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Stay updated on your rentals and messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <MailOpen className="w-4 h-4" />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-100 dark:border-gray-700 flex justify-center">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-100 dark:border-gray-700 text-center">
              <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h2>
              <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all ${
                  notification.is_read
                    ? 'border-gray-100 dark:border-gray-700'
                    : 'border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={`font-semibold ${notification.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5">{notification.message}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.is_read && (
                          <button
                            aria-label="Mark as read"
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </button>
                        )}
                        <button
                          aria-label="Delete notification"
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Preferences */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              Notification Preferences
            </h2>
          </div>
          <div className="space-y-4">
            {prefItems.map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={() => togglePref(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-checked:bg-teal-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
