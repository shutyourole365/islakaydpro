import { useState } from 'react';
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
} from 'lucide-react';

interface NotificationCenterProps {
  onBack: () => void;
}

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'payment' | 'review' | 'system' | 'security';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationCenter({ onBack }: NotificationCenterProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'bookings' | 'messages'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'booking',
      title: 'New Booking Request',
      message: 'John Smith wants to rent your CAT 320 Excavator from Jan 25-28, 2026.',
      time: '5 min ago',
      read: false,
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Sarah Johnson: "Is the camera kit available this weekend?"',
      time: '1 hour ago',
      read: false,
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      message: 'You received $450.00 for booking #12345. Funds will be available in 2 days.',
      time: '3 hours ago',
      read: true,
    },
    {
      id: '4',
      type: 'review',
      title: 'New Review',
      message: 'Mike Wilson left a 5-star review on your Power Tool Set.',
      time: '1 day ago',
      read: true,
    },
    {
      id: '5',
      type: 'security',
      title: 'New Sign-in Detected',
      message: 'Your account was accessed from a new device in Los Angeles, CA.',
      time: '2 days ago',
      read: true,
    },
    {
      id: '6',
      type: 'system',
      title: 'Listing Approved',
      message: 'Your new listing "Professional DJ Equipment" is now live.',
      time: '3 days ago',
      read: true,
    },
    {
      id: '7',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your booking for Sony A7IV Camera Kit has been confirmed.',
      time: '4 days ago',
      read: true,
    },
  ]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'payment':
        return <DollarSign className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      case 'system':
        return <Package className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'review':
        return 'bg-amber-100 text-amber-600';
      case 'security':
        return 'bg-red-100 text-red-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'bookings') return n.type === 'booking';
    if (activeTab === 'messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'all', label: 'All', count: notifications.length },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'bookings', label: 'Bookings', count: notifications.filter(n => n.type === 'booking').length },
    { id: 'messages', label: 'Messages', count: notifications.filter(n => n.type === 'message').length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-red-500 text-white text-sm font-medium rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h1>
              <p className="text-gray-600">Stay updated on your rentals and messages</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MailOpen className="w-4 h-4" />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
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
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h2>
              <p className="text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-4 border transition-all ${
                  notification.read
                    ? 'border-gray-100'
                    : 'border-teal-200 bg-teal-50/50'
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
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                          </button>
                        )}
                        <button
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
        </div>

        {/* Notification Settings */}
        <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              Notification Preferences
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Booking updates', description: 'New bookings, confirmations, cancellations' },
              { label: 'Messages', description: 'New messages from renters and owners' },
              { label: 'Payments', description: 'Payment received, refunds, payouts' },
              { label: 'Reviews', description: 'New reviews on your equipment' },
              { label: 'Security alerts', description: 'Sign-in from new devices, password changes' },
              { label: 'Marketing', description: 'Tips, promotions, and platform updates' },
            ].map((pref, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{pref.label}</p>
                  <p className="text-sm text-gray-500">{pref.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={index < 5}
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
