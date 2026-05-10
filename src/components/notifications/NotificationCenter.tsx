import { useState, useEffect, useRef } from 'react';
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
  Loader2,
} from 'lucide-react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/database';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Notification } from '../../types';

interface NotificationCenterProps {
  onBack: () => void;
}

interface NotificationItem extends Notification {
  timeAgo: string;
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

const prefItems: { key: keyof PrefRow; label: string; description: string }[] = [
  { key: 'push_booking_requests', label: 'Booking Requests', description: 'New rental requests for your equipment' },
  { key: 'push_booking_updates', label: 'Booking Updates', description: 'Status changes to your bookings' },
  { key: 'push_messages', label: 'Messages', description: 'New messages from renters or owners' },
  { key: 'push_reviews', label: 'Reviews', description: 'New reviews on your equipment or profile' },
  { key: 'push_promotions', label: 'Promotions', description: 'Tips, offers and platform updates' },
];

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export default function NotificationCenter({ onBack }: NotificationCenterProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'bookings' | 'messages'>('all');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<PrefRow>(DEFAULT_PREFS);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const data = await getNotifications(user.id);
      setNotifications(data.map((n: Notification) => ({ ...n, timeAgo: getTimeAgo(n.created_at) })));
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    if (user) {
      channelRef.current = supabase
        .channel(`notification-center:${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => loadNotifications())
        .subscribe();

      supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => { if (data) setPrefs(data as PrefRow); });
    }

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user]);

  const getIcon = (type: Notification['type']) => {
    if (type.startsWith('booking')) return <Calendar className="w-5 h-5" />;
    if (type === 'new_message') return <MessageSquare className="w-5 h-5" />;
    if (type === 'payment_received') return <DollarSign className="w-5 h-5" />;
    if (type === 'new_review') return <Star className="w-5 h-5" />;
    if (type.startsWith('verification')) return <Shield className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  const getIconColor = (type: Notification['type']) => {
    if (type.startsWith('booking')) return 'bg-blue-100 text-blue-600';
    if (type === 'new_message') return 'bg-teal-100 text-teal-600';
    if (type === 'payment_received') return 'bg-green-100 text-green-600';
    if (type === 'new_review') return 'bg-yellow-100 text-yellow-600';
    if (type.startsWith('verification')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await supabase.from('notifications').delete().eq('id', id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
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
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'bookings') return n.type.startsWith('booking');
    if (activeTab === 'messages') return n.type === 'new_message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'bookings', label: 'Bookings' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Go back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-teal-600" />
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 pb-0 flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count != null && tab.count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-teal-500 text-white text-xs rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'unread' ? "You're all caught up!" : 'No notifications yet'}
            </h2>
            <p className="text-gray-500">
              {activeTab === 'unread'
                ? 'No unread notifications.'
                : "We'll notify you about bookings, messages, and payments here."}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 border transition-all ${
                notification.read ? 'border-gray-100' : 'border-teal-200 bg-teal-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm mt-0.5">{notification.message}</p>
                      <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.timeAgo}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <button
                          aria-label="Mark as read"
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        </button>
                      )}
                      <button
                        aria-label="Delete notification"
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Notification Settings */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
          </div>
          <div className="space-y-4">
            {prefItems.map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prefs[key]}
                    onChange={() => togglePref(key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-checked:bg-teal-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
