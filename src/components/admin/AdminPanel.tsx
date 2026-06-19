import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Users, Package, DollarSign, Flag, Shield, Settings,
  Search, Filter, CheckCircle2, XCircle, Eye, Ban, Mail, Activity,
  Clock, RefreshCw, AlertTriangle, TrendingUp, Calendar,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminPanelProps {
  onBack: () => void;
}

interface AdminStats {
  totalUsers: number;
  activeListings: number;
  monthlyRevenue: number;
  pendingReports: number;
  pendingVerifications: number;
  awaitingApproval: number;
  newUsersThisMonth: number;
  bookingsThisMonth: number;
}

interface AdminUser {
  id: string;
  full_name: string | null;
  email: string | null;
  is_verified: boolean | null;
  status: string | null;
  created_date: string;
  listing_count?: number;
  booking_count?: number;
}

interface AdminEquipment {
  id: string;
  title: string;
  owner_id: string;
  status: string | null;
  is_verified: boolean | null;
  daily_rate: number | null;
  created_date: string;
  owner_name?: string;
}

interface AdminBooking {
  id: string;
  equipment_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number | null;
  created_date: string;
  equipment_title?: string;
  renter_name?: string;
}

interface RecentActivity {
  id: string;
  action: string;
  detail: string;
  time: string;
  type: 'user' | 'equipment' | 'booking' | 'report';
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'equipment' | 'bookings' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0, activeListings: 0, monthlyRevenue: 0, pendingReports: 0,
    pendingVerifications: 0, awaitingApproval: 0, newUsersThisMonth: 0, bookingsThisMonth: 0,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [equipment, setEquipment] = useState<AdminEquipment[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        { count: totalUsers },
        { count: activeListings },
        { count: pendingVerifications },
        { count: bookingsThisMonth },
        { count: newUsersThisMonth },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_date', firstOfMonth),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_date', firstOfMonth),
        supabase.from('bookings').select('total_price').eq('status', 'completed').gte('created_date', firstOfMonth),
      ]);

      const monthlyRevenue = (revenueData || []).reduce((sum, b) => sum + (b.total_price ?? 0), 0);

      setStats({
        totalUsers: totalUsers ?? 0,
        activeListings: activeListings ?? 0,
        monthlyRevenue,
        pendingReports: 0,
        pendingVerifications: pendingVerifications ?? 0,
        awaitingApproval: 0,
        newUsersThisMonth: newUsersThisMonth ?? 0,
        bookingsThisMonth: bookingsThisMonth ?? 0,
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const query = searchQuery
        ? supabase.from('profiles').select('*').or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`).limit(50)
        : supabase.from('profiles').select('*').order('created_date', { ascending: false }).limit(50);

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data ?? []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [searchQuery]);

  const fetchEquipment = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, title, owner_id, status, is_verified, daily_rate, created_date')
        .order('created_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      setEquipment(data ?? []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, equipment_id, renter_id, start_date, end_date, status, total_price, created_date')
        .order('created_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      setBookings(data ?? []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const [{ data: recentUsers }, { data: recentEquipment }, { data: recentBookings }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, email, created_date').order('created_date', { ascending: false }).limit(3),
        supabase.from('equipment').select('id, title, created_date').order('created_date', { ascending: false }).limit(3),
        supabase.from('bookings').select('id, status, created_date').order('created_date', { ascending: false }).limit(3),
      ]);

      const activities: RecentActivity[] = [
        ...(recentUsers ?? []).map((u) => ({
          id: `user-${u.id}`,
          action: 'New user registered',
          detail: u.email ?? u.full_name ?? 'Unknown',
          time: formatRelativeTime(u.created_date),
          type: 'user' as const,
        })),
        ...(recentEquipment ?? []).map((e) => ({
          id: `equip-${e.id}`,
          action: 'Equipment listed',
          detail: e.title,
          time: formatRelativeTime(e.created_date),
          type: 'equipment' as const,
        })),
        ...(recentBookings ?? []).map((b) => ({
          id: `booking-${b.id}`,
          action: `Booking ${b.status}`,
          detail: `Booking #${b.id.slice(0, 8)}`,
          time: formatRelativeTime(b.created_date),
          type: 'booking' as const,
        })),
      ].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 8);

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error fetching activity:', err);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchEquipment(), fetchBookings(), fetchRecentActivity()]);
    setLoading(false);
  }, [fetchStats, fetchUsers, fetchEquipment, fetchBookings, fetchRecentActivity]);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [searchQuery, activeTab, fetchUsers]);

  const formatRelativeTime = (dateStr: string): string => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);

  const handleVerifyUser = async (userId: string, verify: boolean) => {
    setActionLoading(userId);
    try {
      await supabase.from('profiles').update({ is_verified: verify }).eq('id', userId);
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_verified: verify } : u));
      await fetchStats();
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyEquipment = async (equipId: string, verify: boolean) => {
    setActionLoading(equipId);
    try {
      await supabase.from('equipment').update({ is_verified: verify }).eq('id', equipId);
      setEquipment((prev) => prev.map((e) => e.id === equipId ? { ...e, is_verified: verify } : e));
    } catch (err) {
      console.error('Error updating equipment:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user': return Users;
      case 'equipment': return Package;
      case 'booking': return Calendar;
      case 'report': return Flag;
      default: return Activity;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const platformStats = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `+${stats.newUsersThisMonth} this month`, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Listings', value: stats.activeListings.toLocaleString(), sub: `${stats.pendingVerifications} unverified`, icon: Package, color: 'bg-green-100 text-green-600' },
    { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), sub: 'Completed bookings', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
    { label: 'Bookings This Month', value: stats.bookingsThisMonth.toLocaleString(), sub: 'All statuses', icon: TrendingUp, color: 'bg-teal-100 text-teal-600' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} aria-label="Go back" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Admin Panel <Shield className="w-6 h-6 text-teal-500" />
              </h1>
              <p className="text-gray-600">Live platform data</p>
            </div>
          </div>
          <button onClick={loadAll} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformStats.map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button onClick={() => setActiveTab('users')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verify Users</h3>
                  <p className="text-sm text-gray-500">{stats.pendingVerifications} pending</p>
                </div>
              </button>
              <button onClick={() => setActiveTab('equipment')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Review Listings</h3>
                  <p className="text-sm text-gray-500">{stats.activeListings} active</p>
                </div>
              </button>
              <button onClick={() => setActiveTab('bookings')} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">View Bookings</h3>
                  <p className="text-sm text-gray-500">{stats.bookingsThisMonth} this month</p>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity found.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                          <Icon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500 truncate">{activity.detail}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" /> {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-500">
                      <th className="px-6 py-4 font-medium">User</th>
                      <th className="px-6 py-4 font-medium">Verified</th>
                      <th className="px-6 py-4 font-medium">Joined</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
                    ) : users.map((user) => (
                      <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{user.full_name ?? 'No name'}</p>
                          <p className="text-sm text-gray-500">{user.email ?? '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          {user.is_verified
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(user.created_date).toLocaleDateString('en-AU')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            {user.is_verified ? (
                              <button
                                onClick={() => handleVerifyUser(user.id, false)}
                                disabled={actionLoading === user.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <Ban className="w-3 h-3" /> Unverify
                              </button>
                            ) : (
                              <button
                                onClick={() => handleVerifyUser(user.id, true)}
                                disabled={actionLoading === user.id}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                <Shield className="w-3 h-3" /> Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-500">
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Verified</th>
                      <th className="px-6 py-4 font-medium">Rate/day</th>
                      <th className="px-6 py-4 font-medium">Listed</th>
                      <th className="px-6 py-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No equipment found.</td></tr>
                    ) : equipment.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            item.status === 'available' ? 'bg-green-100 text-green-700' :
                            item.status === 'rented' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>{item.status ?? 'unknown'}</span>
                        </td>
                        <td className="px-6 py-4">
                          {item.is_verified
                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                            : <XCircle className="w-5 h-5 text-gray-300" />}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.daily_rate != null ? formatCurrency(item.daily_rate) : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(item.created_date).toLocaleDateString('en-AU')}
                        </td>
                        <td className="px-6 py-4">
                          {item.is_verified ? (
                            <button
                              onClick={() => handleVerifyEquipment(item.id, false)}
                              disabled={actionLoading === item.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                            >
                              <XCircle className="w-3 h-3" /> Unverify
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVerifyEquipment(item.id, true)}
                              disabled={actionLoading === item.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
                            >
                              <Shield className="w-3 h-3" /> Verify
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-500">
                      <th className="px-6 py-4 font-medium">Booking ID</th>
                      <th className="px-6 py-4 font-medium">Dates</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Total</th>
                      <th className="px-6 py-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No bookings found.</td></tr>
                    ) : bookings.map((booking) => (
                      <tr key={booking.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-gray-600">#{booking.id.slice(0, 8)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(booking.start_date).toLocaleDateString('en-AU')} – {new Date(booking.end_date).toLocaleDateString('en-AU')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>{booking.status}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {booking.total_price != null ? formatCurrency(booking.total_price) : '—'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(booking.created_date).toLocaleDateString('en-AU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Platform Settings</h2>
                  <p className="text-sm text-gray-500">Manage via Supabase dashboard for security</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Database', value: 'Supabase (ap-southeast-2 Sydney)', status: 'live' },
                  { label: 'Payments', value: 'Stripe (AUD)', status: 'live' },
                  { label: 'Push Notifications', value: 'VAPID / Service Worker', status: 'live' },
                  { label: 'Storage', value: 'Supabase Storage', status: 'live' },
                  { label: 'Domain', value: 'islakayd.com → islakaydpro.netlify.app', status: 'pending' },
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.value}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      setting.status === 'live' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{setting.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
