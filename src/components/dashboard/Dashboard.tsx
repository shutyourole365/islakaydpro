import { useState, useEffect, useCallback, Suspense, lazy, useTransition } from 'react';
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
  Users,
  Power,
  CalendarPlus,
} from 'lucide-react';
import AISettings from '../settings/AISettings';
import AvailabilityManager from '../owner/AvailabilityManager';
import PayoutSetupBanner from './PayoutSetupBanner';
import { downloadBookingICS } from '../../utils/calendar';
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
  markMessagesRead,
  subscribeToMessages,
  getUnreadMessageCount,
  getUserAnalytics,
  updateProfile,
  updateBookingStatus,
  logAuditEvent,
  getReviews,
  updateEquipment,
  deleteEquipment,
} from '../../services/database';
import ReferralProgram from '../referral/ReferralProgram';

// Lazy load components for better performance
const AnalyticsCharts = lazy(() => import('./AnalyticsCharts'));
const NotificationSettings = lazy(() => import('../settings/NotificationSettings'));

interface DashboardProps {
  onBack: () => void;
  onEquipmentClick: (equipment: Equipment) => void;
  onListEquipment: () => void;
  onEditEquipment?: (equipment: Equipment) => void;
  onNavigate?: (page: string) => void;
  onLeaveReview?: (equipment: Equipment, bookingId: string) => void;
}

type TabType = 'overview' | 'bookings' | 'listings' | 'favorites' | 'messages' | 'notifications' | 'security' | 'settings' | 'referral';
type BookingFilter = 'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export default function Dashboard({
  onBack,
  onEquipmentClick,
  onListEquipment,
  onEditEquipment,
  onNavigate,
  onLeaveReview,
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
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [availabilityEquipment, setAvailabilityEquipment] = useState<Equipment | null>(null);
  const [conversationSearch, setConversationSearch] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [togglingListingId, setTogglingListingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  // Use transition for non-urgent updates
  const [, startTransition] = useTransition();

  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [analyticsData, bookingsData, ownerBookingsData, listingsData, favoritesData, notificationsData, conversationsData, myReviews] = await Promise.all([
        getUserAnalytics(user.id),
        getBookings({ renterId: user.id }),
        getBookings({ ownerId: user.id }),
        getEquipment({ ownerId: user.id }),
        getFavorites(user.id),
        getNotifications(user.id),
        getConversations(user.id),
        getReviews({ reviewerId: user.id }),
      ]);

      // Use startTransition for non-urgent state updates
      startTransition(() => {
        setAnalytics(analyticsData);
        setBookings(bookingsData);
        setOwnerBookings(ownerBookingsData);
        setMyListings(listingsData.data);
        setFavorites(favoritesData.map(f => f.equipment!).filter(Boolean));
        setNotifications(notificationsData);
        setConversations(conversationsData);
        setReviewedBookingIds(new Set(myReviews.map(r => r.booking_id).filter(Boolean) as string[]));
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, startTransition]);

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

  // Real-time message subscription with read receipts
  useEffect(() => {
    if (!selectedConversation || !user) return;

    // Load messages and mark as read
    getMessages(selectedConversation).then((msgs) => {
      setMessages(msgs);
      // Mark unread messages as read
      const unreadIds = msgs
        .filter(m => m.sender_id !== user.id && !m.read && !m.is_read)
        .map(m => m.id);
      if (unreadIds.length > 0) {
        markMessagesRead(unreadIds).then(() => {
          // Refresh unread count
          getUnreadMessageCount(user.id).then(setUnreadMessageCount);
          // Update conversation unread badge
          setConversations(prev =>
            prev.map(c => c.id === selectedConversation ? { ...c, unread_count: 0 } : c)
          );
        });
      }
    });

    // Subscribe to new messages
    const subscription = subscribeToMessages(selectedConversation, (newMsg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      // Auto-mark as read if from other user
      if (newMsg.sender_id !== user?.id) {
        markMessagesRead([newMsg.id]).catch(() => {});
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [selectedConversation, user]);

  // Load unread message count on mount
  useEffect(() => {
    if (!user) return;
    getUnreadMessageCount(user.id).then(setUnreadMessageCount);
  }, [user]);

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

    const receiverId = (conversation.participants as Array<{user_id: string}> | undefined)
      ?.find(p => p.user_id !== user.id)?.user_id;
    if (!receiverId) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      const message = await sendMessage({
        conversationId: selectedConversation,
        senderId: user.id,
        receiverId,
        content: text,
      });
      setMessages(prev => [...prev, message]);
      // Update conversation list last message
      setConversations(prev =>
        prev.map(c => c.id === selectedConversation
          ? { ...c, last_message: { content: text } as Message }
          : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
      setNewMessage(text); // restore on error
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user.id, settingsForm);
      await refreshProfile();
      logAuditEvent({ userId: user.id, action: 'profile_updated', metadata: { fields: Object.keys(settingsForm) } }).catch(() => {});
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
    if (user) logAuditEvent({ userId: user.id, action: `booking_${action}`, metadata: { bookingId } }).catch(() => {});
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b));
      setCancellingBookingId(null);
    } catch {
      // silently fail — UI stays open so user can retry
    }
  };

  const handleToggleListing = async (item: Equipment) => {
    setTogglingListingId(item.id);
    try {
      await updateEquipment(item.id, { is_active: !item.is_active });
      setMyListings(prev => prev.map(l => l.id === item.id ? { ...l, is_active: !item.is_active } : l));
    } catch {
      // silently fail
    } finally {
      setTogglingListingId(null);
    }
  };

  const handleDeleteListing = async (id: string) => {
    try {
      await deleteEquipment(id);
      setMyListings(prev => prev.filter(l => l.id !== id));
      setDeletingListingId(null);
    } catch {
      // silently fail
    }
  };

  const filteredBookings = bookings.filter(b => bookingFilter === 'all' || b.status === bookingFilter);
  const pendingOwnerBookings = ownerBookings.filter(b => b.status === 'pending');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar, badge: bookings.filter(b => b.status === 'pending').length },
    { id: 'listings', label: 'My Listings', icon: Package, badge: pendingOwnerBookings.length },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favorites.length },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessageCount },
    { id: 'notifications', label: 'Notifications', icon: Activity, badge: notifications.filter(n => !n.is_read).length },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'referral', label: 'Referrals', icon: Users },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: typeof CheckCircle2 }> = {
      confirmed: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle2 },
      pending: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', icon: AlertCircle },
      active: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', icon: Activity },
      completed: { bg: 'bg-gray-50 dark:bg-gray-700/40', text: 'text-gray-700 dark:text-gray-300', icon: CheckCircle2 },
      cancelled: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: XCircle },
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your rentals, listings, and account</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Reload dashboard data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{profile?.full_name || 'User'}</p>
                  {profile?.created_at && !Number.isNaN(new Date(profile.created_at).getFullYear()) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Member since {new Date(profile.created_at).getFullYear()}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>{profile?.rating?.toFixed(1) || '0.0'} rating ({profile?.total_reviews || 0} reviews)</span>
                </div>
                {profile?.is_verified && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <BadgeCheck className="w-4 h-4" />
                    <span>Verified Account</span>
                  </div>
                )}
              </div>
            </div>

            <nav className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-l-4 border-teal-500'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
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
                {/* Owner payout onboarding nudge */}
                <PayoutSetupBanner hasListings={myListings.length > 0} />

                {/* Quick Actions for new features */}
                {onNavigate && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Earnings', icon: DollarSign, page: 'earnings', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40' },
                      { label: 'Disputes', icon: AlertCircle, page: 'disputes', color: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40' },
                      { label: 'Verify ID', icon: Shield, page: 'id-verification', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40' },
                        { label: 'Recurring', icon: RefreshCw, page: 'recurring-rentals', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40' },
                    ].map(action => (
                      <button key={action.page} onClick={() => onNavigate(action.page)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border border-transparent transition-colors ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                        <span className="text-xs font-semibold">{action.label}</span>
                      </button>
                    ))}
                  </div>
                )}
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                  </div>
                }>
                  <AnalyticsCharts
                    userId={user?.id || ''}
                    analytics={undefined}
                  />
                </Suspense>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Overview</h2>
                      <select aria-label="Select time range" className="text-sm border-0 text-gray-500 dark:text-gray-400 focus:ring-0">
                        <option>Last 30 days</option>
                        <option>Last 90 days</option>
                        <option>This year</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Profile Views</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.profile_views || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Total Rentals</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.total_rentals || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Reviews Given</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.reviews_given || 0}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">Avg Response</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.avg_response_time_hours || 0}h</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:text-teal-700"
                      >
                        View All
                      </button>
                    </div>
                    {bookings.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No bookings yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl"
                          >
                            <img
                              src={booking.equipment?.images[0] || 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'}
                              alt=""
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate">{booking.equipment?.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(booking.start_date)}</p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {pendingOwnerBookings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Pending Booking Requests</h3>
                        <p className="text-amber-700 dark:text-amber-400 text-sm mb-4">
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
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    List Equipment
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h2>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label="Filter bookings"
                      value={bookingFilter}
                      onChange={(e) => setBookingFilter(e.target.value as BookingFilter)}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
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
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No bookings found</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Start renting equipment to see your bookings here.</p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                     >
                      Browse Equipment
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredBookings.map((booking) => (
                      <div key={booking.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={booking.equipment?.images[0] || 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg'}
                            alt={booking.equipment?.title || 'Equipment image'}
                            className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{booking.equipment?.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" aria-hidden="true" />
                                  {booking.equipment?.location}
                                </p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" aria-hidden="true" />
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" aria-hidden="true" />
                                {booking.total_days} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-gray-900 dark:text-white">${booking.total_amount.toFixed(2)}</p>
                              <div className="flex items-center gap-2">
                                {(booking.status === 'completed' || (booking.status === 'confirmed' && new Date(booking.end_date) < new Date())) &&
                                  !reviewedBookingIds.has(booking.id) &&
                                  booking.equipment &&
                                  onLeaveReview && (
                                    <button
                                      onClick={() => booking.equipment && onLeaveReview(booking.equipment, booking.id)}
                                      className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                                    >
                                      <Star className="w-4 h-4" aria-hidden="true" />
                                      Leave a Review
                                    </button>
                                  )}
                                {(booking.status === 'confirmed' || booking.status === 'active') && (
                                  <button
                                    onClick={() => downloadBookingICS(booking)}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                                    title="Add this rental to your calendar"
                                  >
                                    <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                                    Add to calendar
                                  </button>
                                )}
                                {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                  <button
                                    onClick={() => setCancellingBookingId(booking.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => booking.equipment && onEquipmentClick(booking.equipment)}
                                  className="flex items-center gap-2 px-4 py-2 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-xl transition-colors"
                                >
                                  View Details
                                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
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
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Listings ({myListings.length})</h2>
                  <button
                    onClick={onListEquipment}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
                   >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    Add New
                  </button>
                </div>

                {pendingOwnerBookings.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Pending Requests ({pendingOwnerBookings.length})</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {pendingOwnerBookings.map((booking) => (
                        <div key={booking.id} className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={booking.equipment?.images[0] || ''}
                              alt={booking.equipment?.title || 'Equipment image'}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{booking.equipment?.title}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)} ({booking.total_days} days)
                              </p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">${booking.total_amount.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                className="p-2 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors"
                                aria-label="Approve request"
                              >
                                <Check className="w-5 h-5" aria-hidden="true" />
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                                className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors"
                                aria-label="Reject request"
                              >
                                <X className="w-5 h-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {myListings.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
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
                      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className="relative">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() => handleToggleListing(item)}
                              disabled={togglingListingId === item.id}
                              title={item.is_active ? 'Pause listing' : 'Activate listing'}
                              className={`flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-lg transition-colors disabled:opacity-60 ${
                                item.is_active
                                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/60'
                                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                            >
                              {togglingListingId === item.id
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Power className="w-3 h-3" />
                              }
                              {item.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{item.location}</p>
                          <div className="flex items-center justify-between mb-4">
                            <p className="font-semibold text-gray-900 dark:text-white">${item.daily_rate}/day</p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
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
                            <button
                              onClick={() => setAvailabilityEquipment(item)}
                              className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors"
                              aria-label="Manage availability"
                              title="Manage availability"
                            >
                              <Calendar className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onEditEquipment?.(item)}
                              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              aria-label="Edit listing"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setDeletingListingId(item.id)}
                              aria-label="Delete listing"
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Equipment ({favorites.length})</h2>

                {favorites.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                    <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Save equipment you're interested in to easily find them later</p>
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
                      <div key={item.id} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 flex">
                        <img src={item.images[0]} alt={item.title} className="w-32 h-32 object-cover" />
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.location}</p>
                          <p className="font-semibold text-gray-900 dark:text-white mb-3">${item.daily_rate}/day</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEquipmentClick(item)}
                              className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(item.id)}
                              className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

            {activeTab === 'messages' && (() => {
              const filteredConvs = conversations.filter(conv => {
                const q = conversationSearch.toLowerCase();
                if (!q) return true;
                const other = conv.participants?.find(p => p.user_id !== user?.id);
                const name = other?.user?.full_name || '';
                const equipment = conv.equipment?.title || '';
                const lastMsg = conv.last_message?.content || '';
                return name.toLowerCase().includes(q) || equipment.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
              });

              const activeConv = conversations.find(c => c.id === selectedConversation);
              const otherParticipant = activeConv?.participants?.find(p => p.user_id !== user?.id);
              const otherName = otherParticipant?.user?.full_name || 'User';

              return (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="flex h-[600px]">
                    {/* Conversation List */}
                    <div className={`border-r border-gray-100 dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden md:flex md:w-80' : 'w-full md:w-80'}`}>
                      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Messages</h3>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <input
                            type="text"
                            value={conversationSearch}
                            onChange={(e) => setConversationSearch(e.target.value)}
                            placeholder="Search conversations..."
                            aria-label="Search conversations"
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                          />
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto">
                        {filteredConvs.length === 0 ? (
                          <div className="p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {conversations.length === 0 ? 'No conversations yet' : 'No matches'}
                            </p>
                          </div>
                        ) : (
                          filteredConvs.map((conv) => {
                            const other = conv.participants?.find(p => p.user_id !== user?.id);
                            const displayName = other?.user?.full_name || conv.equipment?.title || 'Conversation';
                            const initials = displayName.charAt(0).toUpperCase();
                            const lastMsgPreview = conv.last_message?.content
                              || conv.messages?.[conv.messages.length - 1]?.content
                              || 'No messages yet';
                            const hasUnread = (conv.unread_count || 0) > 0;

                            return (
                              <button
                                key={conv.id}
                                onClick={() => setSelectedConversation(conv.id)}
                                className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700/50 last:border-0 ${
                                  selectedConversation === conv.id ? 'bg-teal-50 dark:bg-teal-900/30 border-l-2 border-l-teal-500' : ''
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-shrink-0">
                                    {other?.user?.avatar_url ? (
                                      <img
                                        src={other.user.avatar_url}
                                        alt={displayName}
                                        className="w-11 h-11 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">{initials}</span>
                                      </div>
                                    )}
                                    {hasUnread && (
                                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-teal-500 rounded-full border-2 border-white dark:border-gray-800" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                      <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900 dark:text-white' : 'font-medium text-gray-800 dark:text-gray-200'}`}>
                                        {displayName}
                                      </p>
                                      {conv.unread_count && conv.unread_count > 0 ? (
                                        <span className="flex-shrink-0 w-5 h-5 bg-teal-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                                          {conv.unread_count}
                                        </span>
                                      ) : null}
                                    </div>
                                    {conv.equipment?.title && (
                                      <p className="text-xs text-teal-600 dark:text-teal-400 truncate mb-0.5">
                                        {conv.equipment.title}
                                      </p>
                                    )}
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{lastMsgPreview}</p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Chat View */}
                    <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                      {selectedConversation ? (
                        <>
                          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                            <button
                              onClick={() => setSelectedConversation(null)}
                              className="md:hidden p-2 -ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              aria-label="Back to conversations"
                            >
                              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300 rotate-180" />
                            </button>
                            {otherParticipant?.user?.avatar_url ? (
                              <img src={otherParticipant.user.avatar_url} alt={otherName} className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{otherName.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{otherName}</h3>
                              {activeConv?.equipment?.title && (
                                <p className="text-xs text-teal-600 dark:text-teal-400">{activeConv.equipment.title}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
                            {messages.length === 0 ? (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet. Say hello!</p>
                              </div>
                            ) : (
                              messages.map((msg) => {
                                const isMe = msg.sender_id === user?.id;
                                return (
                                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                      className={`max-w-[72%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                        isMe
                                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-br-sm'
                                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                                      }`}
                                    >
                                      <p className="text-sm leading-relaxed">{msg.content}</p>
                                      <p className={`text-xs mt-1 flex items-center gap-1 ${
                                        isMe ? 'text-white/70 justify-end' : 'text-gray-400 dark:text-gray-500'
                                      }`}>
                                        {formatRelativeTime(msg.created_at)}
                                        {isMe && (
                                          <span title={msg.is_read || msg.read ? 'Read' : 'Delivered'}>
                                            {msg.is_read || msg.read ? '✓✓' : '✓'}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                placeholder="Type a message..."
                                aria-label="Type a message"
                                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                              />
                              <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Send message"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Select a conversation</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Choose from your conversations to start messaging</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications ({notifications.filter(n => !n.is_read).length} unread)
                  </h2>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNotificationSettings(!showNotificationSettings)}
                      className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:text-teal-700 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    {notifications.some(n => !n.is_read) && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-teal-600 dark:text-teal-400 text-sm font-medium hover:text-teal-700"
                       >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>

                {showNotificationSettings ? (
                  <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-teal-600 dark:text-teal-400" /></div>}>
                    <NotificationSettings />
                  </Suspense>
                ) : (
                  <>
                    {notifications.length === 0 ? (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notifications</h3>
                        <p className="text-gray-600 dark:text-gray-300">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 flex items-start gap-4 ${!notification.is_read ? 'bg-teal-50/50 dark:bg-teal-900/20' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              notification.type.includes('booking') ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' :
                              notification.type === 'new_message' ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' :
                              notification.type.includes('payment') ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' :
                              'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                            }`}>
                              {notification.type.includes('booking') ? <Calendar className="w-5 h-5" /> :
                               notification.type === 'new_message' ? <MessageSquare className="w-5 h-5" /> :
                               notification.type.includes('payment') ? <DollarSign className="w-5 h-5" /> :
                               <Activity className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{notification.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{notification.message}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
                            </div>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkNotificationRead(notification.id)}
                                className="p-1 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded"
                                aria-label="Mark notification as read"
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
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h2>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Account Verification</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verify your account to build trust with other users</p>
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

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Security Options</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Lock className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Password</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 rounded-lg transition-colors">
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {profile?.two_factor_enabled ? 'Enabled' : 'Add extra security to your account'}
                          </p>
                        </div>
                      </div>
                      <button className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                        profile?.two_factor_enabled
                          ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                          : 'text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30'
                      }`}
                     
                      >
                        {profile?.two_factor_enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Active Sessions</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Current Session</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">This device - Active now</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                        Current
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Settings</h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                        {settingsForm.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="settings-full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                        <input
                          id="settings-full-name"
                          type="text"
                          placeholder="Your full name"
                          title="Full name"
                          value={settingsForm.full_name}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, full_name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          aria-label="Full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                        <input
                          id="settings-email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                          title="Email address"
                          aria-label="Email address"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40 text-gray-500 dark:text-gray-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location</label>
                        <input
                          type="text"
                          value={settingsForm.location}
                          onChange={(e) => setSettingsForm(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="City, State"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
                      <textarea
                        rows={4}
                        value={settingsForm.bio}
                        onChange={(e) => setSettingsForm(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-teal-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
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

                <AISettings />

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
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
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl cursor-pointer"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-2xl p-6">
                  <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Danger Zone</h3>
                  <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'referral' && (
              <div className="space-y-6">
                <ReferralProgram
                  userId={user?.id || ''}
                  userName={profile?.full_name || user?.email || ''}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability Manager Modal */}
      {availabilityEquipment && (
        <AvailabilityManager
          equipment={availabilityEquipment}
          onClose={() => setAvailabilityEquipment(null)}
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancellingBookingId(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This action cannot be undone. Please check the cancellation policy before proceeding.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Keep Booking
              </button>
              <button
                onClick={() => handleCancelBooking(cancellingBookingId)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Listing Confirmation Modal */}
      {deletingListingId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingListingId(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center mb-2">Remove Listing?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
              This will deactivate the listing and remove it from search results. Active bookings will not be affected.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingListingId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Keep Listing
              </button>
              <button
                onClick={() => handleDeleteListing(deletingListingId)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
      {/* soft tinted glow that intensifies on hover */}
      <div className={`absolute -top-8 -right-8 w-24 h-24 ${color} rounded-full opacity-[0.07] group-hover:opacity-[0.12] blur-xl transition-opacity duration-300`} />
      <div className={`relative w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="relative flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full ${trend >= 0 ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30' : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
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
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          verified ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          <Icon className={`w-5 h-5 ${verified ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 dark:text-white">{title}</p>
            {verified && <BadgeCheck className="w-4 h-4 text-green-600 dark:text-green-400" />}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {verified ? (
        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-sm font-medium rounded-lg">
          Verified
        </span>
      ) : (
        <button className="px-4 py-2 text-teal-600 dark:text-teal-400 font-medium hover:bg-teal-50 rounded-lg transition-colors">
          Verify
        </button>
      )}
    </div>
  );
}

