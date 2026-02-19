import { useState } from 'react';
import {
  Bell,
  BellRing,
  Settings,
  X,
  AlertTriangle,
  DollarSign,
  Calendar,
  Wrench,
  TrendingDown,
  Clock,
  Filter,
  Search,
  MoreVertical,
  BellOff,
  Smartphone,
  Mail,
  MessageSquare,
  ChevronRight,
  Star,
  Package,
} from 'lucide-react';

interface SmartAlertsSystemProps {
  userId?: string;
  onClose?: () => void;
}

type AlertType = 
  | 'price_drop'
  | 'maintenance_due'
  | 'booking_reminder'
  | 'return_reminder'
  | 'new_review'
  | 'payment_due'
  | 'availability_change'
  | 'weather_warning'
  | 'warranty_expiring'
  | 'promotion';

type AlertPriority = 'high' | 'medium' | 'low';
type AlertStatus = 'unread' | 'read' | 'dismissed';

interface SmartAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  priority: AlertPriority;
  status: AlertStatus;
  equipment_id?: string;
  equipment_name?: string;
  booking_id?: string;
  created_at: string;
  action_url?: string;
  action_label?: string;
  data?: Record<string, unknown>;
}

interface AlertPreference {
  type: AlertType;
  label: string;
  description: string;
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

// Mock alerts
const mockAlerts: SmartAlert[] = [
  {
    id: '1',
    type: 'price_drop',
    title: 'Price Drop Alert!',
    message: 'CAT 320 Excavator is now 15% cheaper. Book now at $382/day!',
    priority: 'high',
    status: 'unread',
    equipment_id: 'eq1',
    equipment_name: 'CAT 320 Excavator',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    action_url: '/equipment/eq1',
    action_label: 'View Equipment',
    data: { oldPrice: 450, newPrice: 382, discount: 15 },
  },
  {
    id: '2',
    type: 'maintenance_due',
    title: 'Maintenance Due Soon',
    message: 'Your Bobcat Skid Steer requires scheduled maintenance in 5 days.',
    priority: 'high',
    status: 'unread',
    equipment_id: 'eq2',
    equipment_name: 'Bobcat Skid Steer',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    action_url: '/dashboard/maintenance',
    action_label: 'Schedule Maintenance',
    data: { daysUntilDue: 5, maintenanceType: 'routine_service' },
  },
  {
    id: '3',
    type: 'booking_reminder',
    title: 'Upcoming Rental Tomorrow',
    message: 'Your rental of JCB Backhoe starts tomorrow at 8:00 AM.',
    priority: 'medium',
    status: 'unread',
    equipment_id: 'eq3',
    equipment_name: 'JCB Backhoe',
    booking_id: 'b1',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    action_url: '/bookings/b1',
    action_label: 'View Booking',
    data: { pickupTime: '8:00 AM', location: '123 Construction Ave' },
  },
  {
    id: '4',
    type: 'return_reminder',
    title: 'Equipment Return in 2 Days',
    message: 'Don\'t forget to return the Concrete Mixer by Friday 5:00 PM.',
    priority: 'medium',
    status: 'read',
    equipment_id: 'eq4',
    equipment_name: 'Concrete Mixer',
    booking_id: 'b2',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    action_url: '/bookings/b2',
    action_label: 'View Details',
    data: { daysRemaining: 2, returnTime: '5:00 PM' },
  },
  {
    id: '5',
    type: 'new_review',
    title: 'New 5-Star Review!',
    message: 'John D. left a 5-star review for your Mini Excavator rental.',
    priority: 'low',
    status: 'read',
    equipment_id: 'eq5',
    equipment_name: 'Mini Excavator',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    action_url: '/equipment/eq5/reviews',
    action_label: 'See Review',
    data: { rating: 5, reviewerName: 'John D.' },
  },
  {
    id: '6',
    type: 'warranty_expiring',
    title: 'Warranty Expiring Soon',
    message: 'Extended warranty for Telehandler expires in 30 days.',
    priority: 'medium',
    status: 'unread',
    equipment_id: 'eq6',
    equipment_name: 'Telehandler',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    action_url: '/dashboard/warranties',
    action_label: 'Renew Warranty',
    data: { daysRemaining: 30, warrantyType: 'extended' },
  },
  {
    id: '7',
    type: 'promotion',
    title: 'Weekend Special: 20% Off!',
    message: 'Rent any equipment this weekend and get 20% off your total.',
    priority: 'low',
    status: 'dismissed',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    action_url: '/deals',
    action_label: 'Shop Deals',
    data: { discount: 20, validUntil: '2026-02-09' },
  },
];

// Alert preferences
const defaultPreferences: AlertPreference[] = [
  {
    type: 'price_drop',
    label: 'Price Drops',
    description: 'When equipment you\'ve viewed drops in price',
    enabled: true,
    channels: { push: true, email: true, sms: false },
  },
  {
    type: 'maintenance_due',
    label: 'Maintenance Reminders',
    description: 'When your equipment needs maintenance',
    enabled: true,
    channels: { push: true, email: true, sms: true },
  },
  {
    type: 'booking_reminder',
    label: 'Booking Reminders',
    description: 'Reminders before rental starts',
    enabled: true,
    channels: { push: true, email: true, sms: true },
  },
  {
    type: 'return_reminder',
    label: 'Return Reminders',
    description: 'Reminders before equipment is due',
    enabled: true,
    channels: { push: true, email: true, sms: false },
  },
  {
    type: 'new_review',
    label: 'New Reviews',
    description: 'When someone reviews your equipment',
    enabled: true,
    channels: { push: true, email: true, sms: false },
  },
  {
    type: 'payment_due',
    label: 'Payment Reminders',
    description: 'When a payment is due',
    enabled: true,
    channels: { push: true, email: true, sms: true },
  },
  {
    type: 'availability_change',
    label: 'Availability Updates',
    description: 'When saved equipment becomes available',
    enabled: true,
    channels: { push: true, email: false, sms: false },
  },
  {
    type: 'warranty_expiring',
    label: 'Warranty Alerts',
    description: 'When warranties are expiring',
    enabled: true,
    channels: { push: true, email: true, sms: false },
  },
  {
    type: 'promotion',
    label: 'Promotions & Deals',
    description: 'Special offers and discounts',
    enabled: false,
    channels: { push: false, email: true, sms: false },
  },
];

export default function SmartAlertsSystem({ userId, onClose }: SmartAlertsSystemProps) {
  void userId; // For future API integration
  const [alerts, setAlerts] = useState<SmartAlert[]>(mockAlerts);
  const [preferences, setPreferences] = useState<AlertPreference[]>(defaultPreferences);
  const [activeView, setActiveView] = useState<'alerts' | 'settings'>('alerts');
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Get icon for alert type
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'price_drop':
        return <TrendingDown className="w-5 h-5" />;
      case 'maintenance_due':
        return <Wrench className="w-5 h-5" />;
      case 'booking_reminder':
        return <Calendar className="w-5 h-5" />;
      case 'return_reminder':
        return <Clock className="w-5 h-5" />;
      case 'new_review':
        return <Star className="w-5 h-5" />;
      case 'payment_due':
        return <DollarSign className="w-5 h-5" />;
      case 'availability_change':
        return <Package className="w-5 h-5" />;
      case 'weather_warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'warranty_expiring':
        return <AlertTriangle className="w-5 h-5" />;
      case 'promotion':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get color for alert type
  const getAlertColor = (type: AlertType, priority: AlertPriority) => {
    if (priority === 'high') return 'bg-red-100 text-red-600';
    switch (type) {
      case 'price_drop':
        return 'bg-green-100 text-green-600';
      case 'maintenance_due':
        return 'bg-orange-100 text-orange-600';
      case 'booking_reminder':
        return 'bg-blue-100 text-blue-600';
      case 'return_reminder':
        return 'bg-purple-100 text-purple-600';
      case 'new_review':
        return 'bg-yellow-100 text-yellow-600';
      case 'promotion':
        return 'bg-teal-100 text-teal-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Format time ago
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const alertDate = new Date(date);
    const diffMs = now.getTime() - alertDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return alertDate.toLocaleDateString();
  };

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (alert.status === 'dismissed') return false;
    if (filterType !== 'all' && alert.type !== filterType) return false;
    if (filterPriority !== 'all' && alert.priority !== filterPriority) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.message.toLowerCase().includes(query) ||
        alert.equipment_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Count unread
  const unreadCount = alerts.filter((a) => a.status === 'unread').length;

  // Mark as read
  const markAsRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'read' as AlertStatus } : a))
    );
  };

  // Mark all as read
  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, status: 'read' as AlertStatus })));
  };

  // Dismiss alert
  const dismissAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'dismissed' as AlertStatus } : a))
    );
  };

  // Toggle preference
  const togglePreference = (type: AlertType) => {
    setPreferences((prev) =>
      prev.map((p) => (p.type === type ? { ...p, enabled: !p.enabled } : p))
    );
  };

  // Toggle channel
  const toggleChannel = (type: AlertType, channel: 'push' | 'email' | 'sms') => {
    setPreferences((prev) =>
      prev.map((p) =>
        p.type === type
          ? { ...p, channels: { ...p.channels, [channel]: !p.channels[channel] } }
          : p
      )
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-white">Smart Alerts</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'alerts' ? 'settings' : 'alerts')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {activeView === 'alerts' ? (
                <Settings className="w-5 h-5 text-white" />
              ) : (
                <BellRing className="w-5 h-5 text-white" />
              )}
            </button>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {activeView === 'alerts' ? (
        <>
          {/* Search & Filters */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                  showFilters ? 'bg-teal-50 border-teal-200' : ''
                }`}
              >
                <Filter className="w-5 h-5 text-gray-600" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            {showFilters && (
              <div className="mt-3 flex flex-wrap gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AlertType | 'all')}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="price_drop">Price Drops</option>
                  <option value="maintenance_due">Maintenance</option>
                  <option value="booking_reminder">Bookings</option>
                  <option value="return_reminder">Returns</option>
                  <option value="new_review">Reviews</option>
                  <option value="warranty_expiring">Warranties</option>
                  <option value="promotion">Promotions</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as AlertPriority | 'all')}
                  className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            )}
          </div>

          {/* Alerts List */}
          <div className="overflow-y-auto max-h-[500px]">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center">
                <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No alerts to show</p>
                <p className="text-sm text-gray-400">We'll notify you when something important happens</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      alert.status === 'unread' ? 'bg-teal-50/30' : ''
                    }`}
                    onClick={() => markAsRead(alert.id)}
                  >
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-lg ${getAlertColor(alert.type, alert.priority)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`font-medium ${alert.status === 'unread' ? 'text-gray-900' : 'text-gray-700'}`}>
                              {alert.title}
                            </h4>
                            {alert.equipment_name && (
                              <p className="text-xs text-teal-600 mt-0.5">{alert.equipment_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTimeAgo(alert.created_at)}
                            </span>
                            {alert.status === 'unread' && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                        <div className="flex items-center justify-between mt-3">
                          {alert.action_url && (
                            <button className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                              {alert.action_label}
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissAlert(alert.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                              title="More options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Settings View */
        <div className="overflow-y-auto max-h-[600px]">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-medium text-gray-900">Notification Preferences</h3>
            <p className="text-sm text-gray-500">Choose how you want to be notified</p>
          </div>

          {/* Channel Legend */}
          <div className="p-4 border-b flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" /> Push
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" /> Email
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" /> SMS
            </span>
          </div>

          <div className="divide-y">
            {preferences.map((pref) => (
              <div key={pref.type} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{pref.label}</h4>
                      <button
                        onClick={() => togglePreference(pref.type)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          pref.enabled ? 'bg-teal-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            pref.enabled ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{pref.description}</p>
                  </div>
                </div>

                {pref.enabled && (
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => toggleChannel(pref.type, 'push')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        pref.channels.push
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      Push
                    </button>
                    <button
                      onClick={() => toggleChannel(pref.type, 'email')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        pref.channels.email
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={() => toggleChannel(pref.type, 'sms')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        pref.channels.sms
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      SMS
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-3">
              <button className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Turn all off
              </button>
              <button className="flex-1 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                Reset to defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{filteredAlerts.length} alerts</span>
          <span>{unreadCount} unread</span>
        </div>
      </div>
    </div>
  );
}
