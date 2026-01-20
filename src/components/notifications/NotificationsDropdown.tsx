import { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Star,
  Package,
  Clock,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface NotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    description: 'Your booking for CAT 320 Excavator has been confirmed',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    description: 'Heavy Equipment Rentals LLC sent you a message',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'review',
    title: 'New Review',
    description: 'You received a 5-star review from Mike Johnson',
    time: '2 hours ago',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Complete Your Profile',
    description: 'Add a phone number to get more bookings',
    time: '1 day ago',
    read: true,
  },
];

export default function NotificationsDropdown({
  isOpen,
  onClose,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState(sampleNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-teal-500" />;
      case 'review':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'system':
        return <Package className="w-5 h-5 text-gray-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.read ? 'bg-teal-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {notification.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
        <button className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium">
          View All Notifications
        </button>
      </div>
    </div>
  );
}
