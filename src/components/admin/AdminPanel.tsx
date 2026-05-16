import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft, Users, Package, DollarSign, Shield, Settings,
  Search, CheckCircle2, XCircle, Eye, Ban, Mail, Activity, RefreshCw,
  AlertTriangle, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminPanelProps {
  onBack: () => void;
}

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  is_verified: boolean;
  created_at: string;
  role: string;
}

interface AdminEquipment {
  id: string;
  title: string;
  owner_id: string;
  status: string;
  daily_rate: number;
  is_verified: boolean;
  created_at: string;
  category: string;
}

interface AdminBooking {
  id: string;
  status: string;
  total_price: number;
  start_date: string;
  end_date: string;
  renter_id: string;
  owner_id: string;
}

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeBookings: number;
  monthlyGrowth: number;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'equipment' | 'bookings' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0, totalListings: 0, totalRevenue: 0,
    pendingVerifications: 0, activeBookings: 0, monthlyGrowth: 0,
  });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [equipment, setEquipment] = useState<AdminEquipment[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const [
        { count: userCount },
        { count: listingCount },
        { count: unverifiedCount },
        { count: activeBookingCount },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('is_verified', false),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['confirmed', 'active']),
        supabase.from('bookings').select('total_price').in('status', ['completed', 'confirmed', 'active']),
      ]);

      const totalRevenue = (revenueData || []).reduce((s, b) => s + (b.total_price || 0), 0);

      // Month-over-month user growth
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { count: newUsersThisMonth } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thisMonth.toISOString());

      setStats({
        totalUsers: userCount || 0,
        totalListings: listingCount || 0,
        totalRevenue,
        pendingVerifications: unverifiedCount || 0,
        activeBookings: activeBookingCount || 0,
        monthlyGrowth: newUsersThisMonth || 0,
      });
    } catch (err) {
      console.error('Admin stats error:', err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, is_verified, created_at, role')
      .order('created_at', { ascending: false })
      .limit(50);
    setUsers(data || []);
  }, []);

  const loadEquipment = useCallback(async () => {
    const { data } = await supabase
      .from('equipment')
      .select('id, title, owner_id, status, daily_rate, is_verified, created_at, category')
      .order('created_at', { ascending: false })
      .limit(50);
    setEquipment(data || []);
  }, []);

  const loadBookings = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('id, status, total_price, start_date, end_date, renter_id, owner_id')
      .order('created_at', { ascending: false })
      .limit(50);
    setBookings(data || []);
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadStats(), loadUsers(), loadEquipment(), loadBookings()]);
      setLoading(false);
    };
    loadAll();
  }, [loadStats, loadUsers, loadEquipment, loadBookings]);

  const handleVerifyEquipment = async (equipmentId: string) => {
    setActionLoading(equipmentId);
    const { error } = await supabase
      .from('equipment')
      .update({ is_verified: true })
      .eq('id', equipmentId);
    if (!error) {
      setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, is_verified: true } : e));
      setStats(prev => ({ ...prev, pendingVerifications: Math.max(0, prev.pendingVerifications - 1) }));
    }
    setActionLoading(null);
  };

  const handleSuspendEquipment = async (equipmentId: string) => {
    setActionLoading(equipmentId);
    const { error } = await supabase
      .from('equipment')
      .update({ status: 'inactive' })
      .eq('id', equipmentId);
    if (!error) {
      setEquipment(prev => prev.map(e => e.id === equipmentId ? { ...e, status: 'inactive' } : e));
    }
    setActionLoading(null);
  };

  const handleVerifyUser = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_verified: true } : u));
    }
    setActionLoading(null);
  };

  const filteredUsers = users.filter(u =>
    !searchQuery ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEquipment = equipment.filter(e =>
    !searchQuery ||
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `+${stats.monthlyGrowth} this month`, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Listings', value: stats.totalListings.toLocaleString(), sub: `${stats.pendingVerifications} pending verification`, icon: Package, color: 'bg-green-100 text-green-600' },
    { label: 'Platform Revenue', value: formatCurrency(stats.totalRevenue), sub: 'All time', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Bookings', value: stats.activeBookings.toLocaleString(), sub: 'Confirmed & in-progress', icon: Activity, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Shield className="w-6 h-6 text-teal-600" />
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">ADMIN</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{user?.email}</span>
              <button
                onClick={() => { loadStats(); loadUsers(); loadEquipment(); loadBookings(); }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Refresh dashboard data"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((s) => (
              <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 overflow-x-auto">
          {(['overview', 'users', 'equipment', 'bookings', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search bar for data tabs */}
        {activeTab !== 'overview' && activeTab !== 'settings' && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Pending Verifications
              </h3>
              {equipment.filter(e => !e.is_verified).slice(0, 5).map(e => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-400">{e.category} · {formatCurrency(e.daily_rate)}/day</p>
                  </div>
                  <button
                    onClick={() => handleVerifyEquipment(e.id)}
                    disabled={actionLoading === e.id}
                    className="px-3 py-1 bg-teal-600 text-white text-xs rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {actionLoading === e.id ? '...' : 'Verify'}
                  </button>
                </div>
              ))}
              {equipment.filter(e => !e.is_verified).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">All listings verified ✓</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-500" />
                Recent Bookings
              </h3>
              {bookings.slice(0, 5).map(b => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(b.total_price)}</p>
                    <p className="text-xs text-gray-400">{b.start_date?.split('T')[0]} → {b.end_date?.split('T')[0]}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    b.status === 'completed' ? 'bg-green-100 text-green-700' :
                    b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    b.status === 'active' ? 'bg-teal-100 text-teal-700' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>{b.status}</span>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No bookings yet</p>
              )}
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{u.role || 'user'}</td>
                    <td className="px-4 py-3 text-gray-500">{u.created_at?.split('T')[0]}</td>
                    <td className="px-4 py-3">
                      {u.is_verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!u.is_verified && (
                          <button
                            onClick={() => handleVerifyUser(u.id)}
                            disabled={actionLoading === u.id}
                            className="p-1.5 text-teal-600 hover:bg-teal-50 rounded transition-colors"
                            aria-label={`Verify user ${u.email}`}
                            title="Verify user"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors" aria-label={`View profile for ${u.email}`} title="View profile">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-blue-400 hover:bg-blue-50 rounded transition-colors" aria-label={`Send email to ${u.email}`} title="Email user">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors" aria-label={`Suspend ${u.email}`} title="Suspend">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <p className="text-center text-gray-400 py-8">No users found</p>
            )}
          </div>
        )}

        {/* EQUIPMENT TAB */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Listing</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Rate</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEquipment.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{e.title}</p>
                      <p className="text-xs text-gray-400">{e.created_at?.split('T')[0]}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{e.category}</td>
                    <td className="px-4 py-3 text-gray-900">{formatCurrency(e.daily_rate)}/day</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
                          e.status === 'active' ? 'bg-green-100 text-green-700' :
                          e.status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                          'bg-amber-100 text-amber-700'
                        }`}>{e.status}</span>
                        {e.is_verified ? (
                          <span className="text-xs text-teal-600 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600">Unverified</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {!e.is_verified && (
                          <button
                            onClick={() => handleVerifyEquipment(e.id)}
                            disabled={actionLoading === e.id}
                            className="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 disabled:opacity-50"
                          >
                            {actionLoading === e.id ? '...' : 'Verify'}
                          </button>
                        )}
                        {e.status === 'active' && (
                          <button
                            onClick={() => handleSuspendEquipment(e.id)}
                            disabled={actionLoading === e.id}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEquipment.length === 0 && (
              <p className="text-center text-gray-400 py-8">No listings found</p>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Booking ID</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Dates</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{b.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-700">{b.start_date?.split('T')[0]} → {b.end_date?.split('T')[0]}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatCurrency(b.total_price)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                        b.status === 'completed' ? 'bg-green-100 text-green-700' :
                        b.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        b.status === 'active' ? 'bg-teal-100 text-teal-700' :
                        b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <p className="text-center text-gray-400 py-8">No bookings found</p>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4" /> Platform Settings
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span>Maintenance Mode</span>
                  <span className="text-green-600 font-medium">Off</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span>New Registrations</span>
                  <span className="text-green-600 font-medium">Enabled</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span>Auto-verify Listings</span>
                  <span className="text-amber-600 font-medium">Disabled</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>Push Notifications</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
