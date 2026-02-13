import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  BellRing,
  Check,
  Clock,
  Info,
  MessageSquare,
  Calendar,
  DollarSign,
  Star,
  Settings,
} from 'lucide-react';
import type { Notification } from '../../types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface RealTimeNotificationsProps {
  className?: string;
}

interface NotificationItem extends Notification {
  isNew?: boolean;
  timeAgo: string;
}

export default function RealTimeNotifications({ className = '' }: RealTimeNotificationsProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'booking' | 'payment' | 'review'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const notificationsData = await getNotifications(user.id);

        // Add time ago and mark new notifications
        const now = new Date();
        const processedNotifications = notificationsData.map((notification: Notification) => ({
          ...notification,
          isNew: !notification.is_read && (now.getTime() - new Date(notification.created_at).getTime()) < 300000, // 5 minutes
          timeAgo: getTimeAgo(new Date(notification.created_at)),
        }));

        setNotifications(processedNotifications);
        setUnreadCount(processedNotifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();

    // Set up real-time subscription (simulated with polling for demo)
    const interval = setInterval(loadNotifications, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
      case 'booking_cancelled':
        return Calendar;
      case 'payment_received':
      case 'payment_failed':
        return DollarSign;
      case 'review_received':
        return Star;
      case 'message_received':
        return MessageSquare;
      case 'system_alert':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
        return 'text-green-600 bg-green-100';
      case 'booking_cancelled':
        return 'text-red-600 bg-red-100';
      case 'payment_received':
        return 'text-blue-600 bg-blue-100';
      case 'payment_failed':
        return 'text-red-600 bg-red-100';
      case 'review_received':
        return 'text-yellow-600 bg-yellow-100';
      case 'message_received':
        return 'text-purple-600 bg-purple-100';
      case 'system_alert':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user!.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.is_read;
      case 'booking':
        return notification.type.includes('booking');
      case 'payment':
        return notification.type.includes('payment');
      case 'review':
        return notification.type.includes('review');
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex gap-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'booking', label: 'Bookings' },
                { key: 'payment', label: 'Payments' },
                { key: 'review', label: 'Reviews' },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as typeof filter)}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">
                  {filter === 'unread' ? 'No unread notifications' :
                   filter === 'all' ? 'No notifications yet' :
                   `No ${filter} notifications`}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const colorClass = getNotificationColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{notification.timeAgo}</span>
                                {notification.isNew && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>

                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {/* Action buttons for specific notification types */}
                          {notification.type === 'booking_confirmed' && (
                            <div className="mt-3 flex gap-2">
                              <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                                View Booking
                              </button>
                              <button className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                                Contact Owner
                              </button>
                            </div>
                          )}

                          {notification.type === 'review_received' && (
                            <div className="mt-3">
                              <button className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                                View Review
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}