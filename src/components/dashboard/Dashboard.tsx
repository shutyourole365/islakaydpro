import { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  Eye,
  Users,
  Activity,
  Loader2,
  Search,
  Edit,
  Trash2,
  Check,
  X,
  Send,
  Phone,
  Mail,
  BadgeCheck,
  Lock,
  Smartphone,
  FileText,
  Building,
  RefreshCw,
} from 'lucide-react';
import type { Equipment, Booking, UserAnalytics, Notification, Conversation, Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import {
  getBookings,
  getEquipment,
  getFavorites,
  removeFavorite,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getConversations,
  getMessages,
  sendMessage,
  getUserAnalytics,
  updateProfile,
  updateBookingStatus,
} from '../../services/database';

// Lazy load components for better performance
const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));
const NotificationSettings = lazy(() => import('../settings/NotificationSettings'));

interface DashboardProps {
  onBack: () => void;
  onEquipmentClick: (equipment: Equipment) => void;
  onListEquipment: () => void;
}

type TabType = 'overview' | 'bookings' | 'listings' | 'favorites' | 'messages' | 'notifications' | 'security' | 'settings';
type BookingFilter = 'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export default function Dashboard({
  onBack,
  onEquipmentClick,
  onListEquipment,
}: DashboardProps) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [myListings, setMyListings] = useState<Equipment[]>([]);
  const [favorites, setFavorites] = useState<Equipment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('all');
  const [settingsForm, setSettingsForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [ownerBookings, setOwnerBookings] = useState<Booking[]>([]);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [analyticsData, bookingsData, ownerBookingsData, listingsData, favoritesData, notificationsData, conversationsData] = await Promise.all([
        getUserAnalytics(user.id),
        getBookings({ renterId: user.id }),
        getBookings({ ownerId: user.id }),
        getEquipment({ ownerId: user.id }),
        getFavorites(user.id),
        getNotifications(user.id),
        getConversations(user.id),
      ]);

      setAnalytics(analyticsData);
      setBookings(bookingsData);
      setOwnerBookings(ownerBookingsData);
      setMyListings(listingsData.data);
      setFavorites(favoritesData.map(f => f.equipment!).filter(Boolean));
      setNotifications(notificationsData);
      setConversations(conversationsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    if (profile) {
      setSettingsForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation).then(setMessages);
    }
  }, [selectedConversation]);

  const handleRemoveFavorite = async (equipmentId: string) => {
    if (!user) return;
    await removeFavorite(user.id, equipmentId);
    setFavorites(prev => prev.filter(e => e.id !== equipmentId));
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllNotificationsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;

    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const receiverId = conversation.participants?.find(p => p.user_id !== user.id)?.user_id;
    if (!receiverId) return;

    const message = await sendMessage({
      conversationId: selectedConversation,
      senderId: user.id,
      receiverId,
      content: newMessage.trim(),
    });

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user.id, settingsForm);
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'cancel') => {
    const status = action === 'confirm' ? 'confirmed' : 'cancelled';
    await updateBookingStatus(bookingId, status);
    setOwnerBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const filteredBookings = bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter);
  const pendingOwnerBookings = ownerBookings.filter(b => b.status === 'pending');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, badge: bookings.filter(b => b.status === 'pending').length },
    { id: 'listings', label: 'My Listings', icon: Package, badge: pendingOwnerBookings.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favorites.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Activity, badge: notifications.filter(n => !n.is_read).length },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
      confirmed: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle2 },
      pending: { bg: 'bg-amber-50', text: 'text-amber-700', icon: AlertCircle },
      active: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Activity },
      completed: { bg: 'bg-gray-50', text: 'text-gray-700', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
    };

    const style = styles[status] || styles.pending;
    const Icon = style.icon;

    return (
      <span className={`flex items-center gap-1.5 px-3 py-1 ${style.bg} ${style.text} rounded-full text-sm font-medium`}>
        <Icon className="w-4 h-4" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatRelativeTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your rentals, listings, and account</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{profile?.full_name || 'User'}</p>
                  <p className="text-sm text-gray-500">Member since {new Date(profile?.created_at || '').getFullYear()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{profile?.rating?.toFixed(1) || '0.0'} rating ({profile?.total_reviews || 0} reviews)</span>
                </div>
                {profile?.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Verified Account</span>
                  </div>
                )}
              </div>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                      : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-medium rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Earned"
                    value={`$${(analytics?.total_earned || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                    trend={12}
                  />
                  <StatCard
                    label="Total Spent"
                    value={`$${(analytics?.total_spent || 0).toLocaleString()}`}
                    icon={TrendingUp}
                    color="bg-blue-500"
                  />
                  <StatCard
                    label="Active Listings"
                    value={myListings.length.toString()}
                    icon={Package}
                    color="bg-amber-500"
                  />
                  <StatCard
                    label="Response Rate"
                    value={`${analytics?.response_rate || 0}%`}
                    icon={Activity}
                    color="bg-teal-500"
                  />
                </div>

                {/* Enhanced Analytics Charts - NEW */}
                <Suspense fallback={
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  </div>
                }>
                  <AnalyticsCharts
                    userId={user?.id || ''}
                    analytics={undefined}
                  />
                </Suspense>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Performance Overview</h2>
                      <select className="text-sm border-0 text-gray-500 focus:ring-0">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This year</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Profile Views</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.profile_views || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Total Rentals</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.total_rentals || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Reviews Given</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.reviews_given || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Avg Response</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{analytics?.avg_response_time_hours || 0}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-teal-600 text-sm font-medium hover:text-teal-700"
                      >
                        View All
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No bookings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                          >
                            <img
                              src={booking.equipment?.images[0] || 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{booking.equipment?.title}</p>
                              <p className="text-sm text-gray-500">{formatDate(booking.start_date)}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {pendingOwnerBookings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-1">Pending Booking Requests</h3>
                        <p className="text-amber-700 text-sm mb-4">
                          You have {pendingOwnerBookings.length} booking request{pendingOwnerBookings.length > 1 ? 's' : ''} waiting for your approval.
                        </p>
                        <button
                          onClick={() => setActiveTab('listings')}
                          className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                        >
                          Review Requests
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white">
                  <h2 className="text-xl font-bold mb-2">Start Earning Today</h2>
                  <p className="text-white/80 mb-6">
                    List your equipment and earn extra income when you're not using it.
                  </p>
                  <button
                    onClick={onListEquipment}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    List Equipment
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
                  <div className="flex items-center gap-2">
                    <select
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value as BookingFilter)}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="all">All Bookings</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {filteredBookings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                    <p className="text-gray-600 mb-6">Start renting equipment to see your bookings here.</p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      Browse Equipment
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={booking.equipment?.images[0] || 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'}
                            alt=""
                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">{booking.equipment?.title}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />
                                  {booking.equipment?.location}
                                </p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {booking.total_days} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-gray-900">${booking.total_amount.toFixed(2)}</p>
                              <button
                                onClick={() => booking.equipment && onEquipmentClick(booking.equipment)}
                                className="flex items-center gap-2 px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-xl transition-colors"
                              >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Listings ({myListings.length})</h2>
                  <button
                    onClick={onListEquipment}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add New
                  </button>
                </div>

                {pendingOwnerBookings.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Pending Requests ({pendingOwnerBookings.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {pendingOwnerBookings.map((booking) => (
                        <div key={booking.id} className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={booking.equipment?.images[0] || ''}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{booking.equipment?.title}</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)} ({booking.total_days} days)
                              </p>
                              <p className="text-sm font-medium text-gray-900">${booking.total_amount.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myListings.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start earning money by listing your equipment. It's free to list and you set your own prices.
                    </p>
                    <button
                      onClick={onListEquipment}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Listing
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myListings.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                        <div className="relative">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                              item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {item.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-3">{item.location}</p>
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-semibold text-gray-900">${item.daily_rate}/day</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span>{item.total_bookings} bookings</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEquipmentClick(item)}
                              className="flex-1 px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              View
                            </button>
                            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Saved Equipment ({favorites.length})</h2>

                {favorites.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
                    <p className="text-gray-600 mb-6">Save equipment you're interested in to easily find them later</p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      Browse Equipment
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favorites.map((item) => (
                      <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex">
                        <img src={item.images[0]} alt={item.title} className="w-32 h-32 object-cover" />
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{item.location}</p>
                          <p className="font-semibold text-gray-900 mb-3">${item.daily_rate}/day</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEquipmentClick(item)}
                              className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(item.id)}
                              className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex h-[600px]">
                  <div className="w-80 border-r border-gray-100 flex flex-col">
                    <div className="p-4 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search conversations..."
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {conversations.length === 0 ? (
                        <div className="p-8 text-center">
                          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No conversations yet</p>
                        </div>
                      ) : (
                        conversations.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => setSelectedConversation(conv.id)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              selectedConversation === conv.id ? 'bg-teal-50' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {conv.equipment?.title || 'Conversation'}
                                </p>
                                <p className="text-sm text-gray-500 truncate">
                                  {conv.last_message?.content || 'No messages'}
                                </p>
                              </div>
                              {conv.unread_count && conv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-teal-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col">
                    {selectedConversation ? (
                      <>
                        <div className="p-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900">Conversation</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                                  msg.sender_id === user?.id
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                <p>{msg.content}</p>
                                <p className={`text-xs mt-1 ${
                                  msg.sender_id === user?.id ? 'text-teal-100' : 'text-gray-500'
                                }`}>
                                  {formatRelativeTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Type a message..."
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500"
                            />
                            <button
                              onClick={handleSendMessage}
                              className="p-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Select a conversation to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Notifications ({notifications.filter(n => !n.is_read).length} unread)
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                      className="text-teal-600 text-sm font-medium hover:text-teal-700 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    {notifications.some(n => !n.is_read) && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-teal-600 text-sm font-medium hover:text-teal-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {showNotificationSettings ? (
                  <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>}>
                    <NotificationSettings />
                  </Suspense>
                ) : (
                  <>
                    {notifications.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-600">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 flex items-start gap-4 ${!notification.is_read ? 'bg-teal-50/50' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.type.includes('booking') ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'new_message' ? 'bg-green-100 text-green-600' :
                              notification.type.includes('payment') ? 'bg-amber-100 text-amber-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type.includes('booking') ? <Calendar className="w-5 h-5" /> :
                               notification.type === 'new_message' ? <MessageSquare className="w-5 h-5" /> :
                               notification.type.includes('payment') ? <DollarSign className="w-5 h-5" /> :
                               <Activity className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.created_at)}</p>
                            </div>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkNotificationRead(notification.id)}
                                className="p-1 text-teal-600 hover:bg-teal-100 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Account Verification</h3>
                    <p className="text-sm text-gray-500 mt-1">Verify your account to build trust with other users</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <VerificationItem
                      icon={Mail}
                      title="Email Verification"
                      description="Verify your email address"
                      verified={profile?.email_verified}
                    />
                    <VerificationItem
                      icon={Phone}
                      title="Phone Verification"
                      description="Add and verify your phone number"
                      verified={profile?.phone_verified}
                    />
                    <VerificationItem
                      icon={FileText}
                      title="ID Verification"
                      description="Upload a government-issued ID"
                      verified={profile?.is_verified}
                    />
                    <VerificationItem
                      icon={Building}
                      title="Address Verification"
                      description="Verify your physical address"
                      verified={false}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Security Options</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-500">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors">
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500">
                            {profile?.two_factor_enabled ? 'Enabled' : 'Add extra security to your account'}
                          </p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                        profile?.two_factor_enabled
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-teal-600 hover:bg-teal-50'
                      }`}>
                        {profile?.two_factor_enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Active Sessions</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Current Session</p>
                          <p className="text-sm text-gray-500">This device - Active now</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Current
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                        {settingsForm.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={settingsForm.full_name}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                        <input
                          type="text"
                          value={settingsForm.location}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                      <textarea
                        rows={4}
                        value={settingsForm.bio}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Email notifications for new messages', key: 'email_messages', checked: true },
                      { label: 'Email notifications for booking updates', key: 'email_bookings', checked: true },
                      { label: 'Marketing and promotional emails', key: 'email_marketing', checked: false },
                      { label: 'SMS notifications', key: 'sms_enabled', checked: false },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer"
                      >
                        <span className="text-gray-700">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-red-700 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: {
  label: string;
  value: string;
  icon: typeof DollarSign;
  color: string;
  trend?: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
}

function VerificationItem({ icon: Icon, title, description, verified }: {
  icon: typeof Mail;
  title: string;
  description: string;
  verified?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          verified ? 'bg-green-100' : 'bg-gray-200'
        }`}>
          <Icon className={`w-5 h-5 ${verified ? 'text-green-600' : 'text-gray-600'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{title}</p>
            {verified && <BadgeCheck className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {verified ? (
        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
          Verified
        </span>
      ) : (
        <button className="px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-lg transition-colors">
          Verify
        </button>
      )}
    </div>
  );
}
