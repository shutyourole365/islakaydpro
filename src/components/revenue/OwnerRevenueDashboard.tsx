import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, DollarSign, TrendingUp, Calendar, Package,
  Star, ArrowUpRight, ArrowDownRight, BarChart3, PieChart,
  Users, Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OwnerRevenueDashboardProps {
  onBack: () => void;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
}

interface EquipmentEarnings {
  id: string;
  name: string;
  revenue: number;
  bookings: number;
  rating: number;
}

interface Transaction {
  id: string;
  date: string;
  renter: string;
  equipment: string;
  amount: number;
  status: string;
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  active: { bg: 'bg-teal-100', text: 'text-teal-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' });
}

export default function OwnerRevenueDashboard({ onBack }: OwnerRevenueDashboardProps) {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [equipmentEarnings, setEquipmentEarnings] = useState<EquipmentEarnings[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        // Determine date range
        const now = new Date();
        const daysBack = period === 'week' ? 7 : period === 'month' ? 30 : period === 'quarter' ? 90 : 365;
        const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

        // Get all owner bookings in range
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, start_date, end_date, total_price, status, equipment_id, renter_id')
          .eq('owner_id', user.id)
          .gte('start_date', since.toISOString())
          .order('start_date', { ascending: true });

        const bk = bookings || [];

        // Build monthly revenue buckets
        const monthMap: Record<string, { revenue: number; bookings: number }> = {};
        bk.forEach(b => {
          if (!['completed', 'confirmed', 'active'].includes(b.status)) return;
          const key = getMonthLabel(b.start_date);
          if (!monthMap[key]) monthMap[key] = { revenue: 0, bookings: 0 };
          monthMap[key].revenue += b.total_price || 0;
          monthMap[key].bookings += 1;
        });
        setMonthlyData(Object.entries(monthMap).map(([month, v]) => ({ month, ...v })));

        // Per-equipment earnings
        const eqMap: Record<string, { revenue: number; bookings: number }> = {};
        bk.forEach(b => {
          if (!['completed', 'confirmed', 'active'].includes(b.status)) return;
          if (!eqMap[b.equipment_id]) eqMap[b.equipment_id] = { revenue: 0, bookings: 0 };
          eqMap[b.equipment_id].revenue += b.total_price || 0;
          eqMap[b.equipment_id].bookings += 1;
        });

        // Get equipment names and ratings
        const eqIds = Object.keys(eqMap);
        if (eqIds.length > 0) {
          const { data: eqData } = await supabase
            .from('equipment')
            .select('id, title, rating')
            .in('id', eqIds);
          const earnings: EquipmentEarnings[] = (eqData || []).map(e => ({
            id: e.id,
            name: e.title,
            revenue: eqMap[e.id]?.revenue || 0,
            bookings: eqMap[e.id]?.bookings || 0,
            rating: e.rating ?? 0,
          })).sort((a, b) => b.revenue - a.revenue);
          setEquipmentEarnings(earnings);
        } else {
          setEquipmentEarnings([]);
        }

        // Recent transactions — last 10 bookings with renter name
        const recentBk = [...bk].sort((a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        ).slice(0, 10);

        const renterIds = [...new Set(recentBk.map(b => b.renter_id).filter(Boolean))];
        const renterMap: Record<string, string> = {};
        if (renterIds.length > 0) {
          const { data: renters } = await supabase
            .from('profiles')
            .select('id, full_name')
            .in('id', renterIds);
          (renters || []).forEach(r => { renterMap[r.id] = r.full_name || 'Renter'; });
        }

        // Get equipment titles for transactions
        const txEqIds = [...new Set(recentBk.map(b => b.equipment_id))];
        const txEqMap: Record<string, string> = {};
        if (txEqIds.length > 0) {
          const { data: txEq } = await supabase
            .from('equipment')
            .select('id, title')
            .in('id', txEqIds);
          (txEq || []).forEach(e => { txEqMap[e.id] = e.title; });
        }

        setTransactions(recentBk.map(b => ({
          id: b.id,
          date: b.start_date.split('T')[0],
          renter: renterMap[b.renter_id] || 'Renter',
          equipment: txEqMap[b.equipment_id] || 'Equipment',
          amount: b.total_price || 0,
          status: b.status,
        })));
      } catch (err) {
        console.error('Revenue dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, period]);

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyData.reduce((s, m) => s + m.bookings, 0);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const revenueChange = prevMonth && prevMonth.revenue > 0
    ? ((( currentMonth?.revenue || 0) - prevMonth.revenue) / prevMonth.revenue) * 100
    : 0;

  const avgRating = useMemo(() => {
    if (!equipmentEarnings.length) return 0;
    return equipmentEarnings.reduce((s, e) => s + e.rating, 0) / equipmentEarnings.length;
  }, [equipmentEarnings]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Go back">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Your real equipment rental earnings and performance</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Period Revenue</span>
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRevenue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                </p>
                {revenueChange !== 0 && (
                  <p className={`text-sm mt-1 flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(revenueChange).toFixed(1)}% vs prev period
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</span>
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalBookings}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">confirmed + active + completed</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Avg Rating</span>
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  across {equipmentEarnings.length} item{equipmentEarnings.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Active Listings</span>
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-teal-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{equipmentEarnings.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">generating revenue</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-teal-600" /> Revenue Over Time
                  </h3>
                  {monthlyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                      <TrendingUp className="w-10 h-10 mb-2 opacity-40" />
                      <p className="text-sm">No revenue data for this period</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {monthlyData.map((m) => (
                        <div key={m.month} className="flex items-center gap-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400 w-16 flex-shrink-0">{m.month}</span>
                          <div className="flex-1 relative">
                            <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg transition-all"
                                style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right w-28 flex-shrink-0">
                            <p className="text-sm font-semibold dark:text-white">
                              ${m.revenue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                            </p>
                            <p className="text-xs text-gray-500">{m.bookings} booking{m.bookings !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top Equipment */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6">
                  <PieChart className="w-5 h-5 text-violet-600" /> Top Equipment
                </h3>
                {equipmentEarnings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                    <Package className="w-10 h-10 mb-2 opacity-40" />
                    <p className="text-sm">No bookings yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {equipmentEarnings.slice(0, 5).map((e) => (
                      <div key={e.id} className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{e.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-500">{e.rating > 0 ? e.rating.toFixed(1) : '—'}</span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-500">{e.bookings} bookings</span>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                          ${e.revenue.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-blue-600" /> Recent Transactions
              </h3>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Calendar className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No transactions in this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Renter</th>
                        <th className="pb-3 font-medium">Equipment</th>
                        <th className="pb-3 font-medium text-right">Amount</th>
                        <th className="pb-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                      {transactions.map((t) => {
                        const style = statusStyles[t.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                        return (
                          <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 text-gray-500 dark:text-gray-400">{t.date}</td>
                            <td className="py-3 font-medium dark:text-white">{t.renter}</td>
                            <td className="py-3 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">{t.equipment}</td>
                            <td className="py-3 font-bold text-gray-900 dark:text-white text-right">
                              ${t.amount.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text} capitalize`}>
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
