import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Calendar,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { checkPayoutStatus, getBalance, redirectToConnectOnboarding, getPayouts, requestPayout } from '../../services/payments';

interface OwnerEarningsDashboardProps {
  onBack: () => void;
}

interface EarningsBooking {
  id: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  service_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  equipment: { title: string; daily_rate: number } | null;
  renter: { full_name: string | null } | null;
}

interface EarningsSummary {
  totalEarned: number;
  pendingPayout: number;
  thisMonth: number;
  lastMonth: number;
  totalBookings: number;
  completedBookings: number;
  avgBookingValue: number;
  monthlyGrowth: number;
}

function computeSummary(bookings: EarningsBooking[]): EarningsSummary {
  const completed = bookings.filter(b => b.status === 'completed' && b.payment_status === 'paid');
  const pending = bookings.filter(b => b.status !== 'cancelled' && b.payment_status === 'pending');

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const ownerAmount = (b: EarningsBooking) => b.total_amount - b.service_fee;

  const totalEarned = completed.reduce((s, b) => s + ownerAmount(b), 0);
  const pendingPayout = pending.reduce((s, b) => s + ownerAmount(b), 0);
  const thisMonth = completed.filter(b => new Date(b.created_at) >= thisMonthStart).reduce((s, b) => s + ownerAmount(b), 0);
  const lastMonth = completed.filter(b => {
    const d = new Date(b.created_at);
    return d >= lastMonthStart && d <= lastMonthEnd;
  }).reduce((s, b) => s + ownerAmount(b), 0);

  const monthlyGrowth = lastMonth === 0 ? 100 : ((thisMonth - lastMonth) / lastMonth) * 100;

  return {
    totalEarned,
    pendingPayout,
    thisMonth,
    lastMonth,
    totalBookings: bookings.filter(b => b.status !== 'cancelled').length,
    completedBookings: completed.length,
    avgBookingValue: completed.length > 0 ? totalEarned / completed.length : 0,
    monthlyGrowth,
  };
}

const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function OwnerEarningsDashboard({ onBack }: OwnerEarningsDashboardProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<EarningsBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'all' | '30d' | '90d' | 'ytd'>('30d');
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [payoutStatus, setPayoutStatus] = useState<{ hasAccount: boolean; isOnboarded: boolean } | null>(null);
  const [stripeBalance, setStripeBalance] = useState<{ available: number; pending: number } | null>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  type PayoutRecord = Awaited<ReturnType<typeof getPayouts>>[number];
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [requestingPayoutId, setRequestingPayoutId] = useState<string | null>(null);

  const loadEarnings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select(`
          id, start_date, end_date, total_amount, service_fee, status, payment_status, created_at,
          equipment:equipment(title, daily_rate),
          renter:profiles!bookings_renter_id_fkey(full_name)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (period !== 'all') {
        const now = new Date();
        let from: Date;
        if (period === '30d') from = new Date(now.getTime() - 30 * 86400000);
        else if (period === '90d') from = new Date(now.getTime() - 90 * 86400000);
        else from = new Date(now.getFullYear(), 0, 1); // YTD
        query = query.gte('created_at', from.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      const rows = (data || []) as unknown as EarningsBooking[];
      setBookings(rows);
      setSummary(computeSummary(rows));
    } catch (err) {
      console.error('Failed to load earnings:', err);
    } finally {
      setLoading(false);
    }
  }, [user, period]);

  useEffect(() => { loadEarnings(); }, [loadEarnings]);

  useEffect(() => {
    if (!user) return;
    checkPayoutStatus().then(status => {
      setPayoutStatus(status);
      if (status.isOnboarded && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
        getBalance().then(b => {
          setStripeBalance({ available: b.available, pending: b.pending });
        }).catch(() => {});
        getPayouts().then(setPayouts).catch(() => {});
      }
    }).catch(() => {});
  }, [user]);

  const handleSetupPayouts = async () => {
    setPayoutLoading(true);
    try {
      await redirectToConnectOnboarding();
    } catch {
      setPayoutLoading(false);
    }
  };

  const handleRequestPayout = async (bookingId: string) => {
    setRequestingPayoutId(bookingId);
    try {
      await requestPayout(bookingId);
      getPayouts().then(setPayouts).catch(() => {});
    } catch {
      // silently ignore
    } finally {
      setRequestingPayoutId(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      ['Date', 'Equipment', 'Renter', 'Gross', 'Service Fee', 'Your Earnings', 'Status'],
      ...bookings.map(b => [
        new Date(b.created_at).toLocaleDateString(),
        b.equipment?.title || 'Unknown',
        b.renter?.full_name || 'Unknown',
        b.total_amount.toFixed(2),
        b.service_fee.toFixed(2),
        (b.total_amount - b.service_fee).toFixed(2),
        b.status,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `islakayd-earnings-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColor: Record<string, string> = {
    completed: 'text-green-600 bg-green-50',
    confirmed: 'text-blue-600 bg-blue-50',
    active: 'text-teal-600 bg-teal-50',
    pending: 'text-amber-600 bg-amber-50',
    cancelled: 'text-gray-500 bg-gray-50',
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>
              <p className="text-gray-500 text-sm">Track your rental income</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
              {(['30d', '90d', 'ytd', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${period === p ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {p === '30d' ? '30D' : p === '90d' ? '90D' : p === 'ytd' ? 'YTD' : 'All'}
                </button>
              ))}
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Payout setup banner */}
        {payoutStatus && !payoutStatus.isOnboarded && import.meta.env.VITE_STRIPE_PUBLIC_KEY && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Set up payouts to receive your earnings</p>
                <p className="text-sm text-amber-700">Connect your bank account via Stripe to get paid.</p>
              </div>
            </div>
            <button
              onClick={handleSetupPayouts}
              disabled={payoutLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-60 flex-shrink-0"
            >
              {payoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Set Up Payouts
            </button>
          </div>
        )}

        {/* Stripe balance display */}
        {stripeBalance && (
          <div className="mb-6 bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center gap-6">
            <CreditCard className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-teal-600 font-medium">Available for payout</p>
                <p className="text-xl font-bold text-teal-900">{fmt(stripeBalance.available)}</p>
              </div>
              <div>
                <p className="text-xs text-teal-600 font-medium">Pending</p>
                <p className="text-xl font-bold text-teal-700">{fmt(stripeBalance.pending)}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : summary ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${summary.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {summary.monthlyGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(summary.monthlyGrowth).toFixed(0)}%
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{fmt(summary.totalEarned)}</p>
                <p className="text-xs text-gray-500 mt-1">Total Earned</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{fmt(summary.pendingPayout)}</p>
                <p className="text-xs text-gray-500 mt-1">Pending Payout</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{fmt(summary.thisMonth)}</p>
                <p className="text-xs text-gray-500 mt-1">This Month</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{summary.completedBookings}</p>
                <p className="text-xs text-gray-500 mt-1">Completed Rentals</p>
              </div>
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{fmt(summary.avgBookingValue)}</p>
                  <p className="text-xs text-gray-500">Avg. Booking Value</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {summary.totalBookings > 0 ? Math.round((summary.completedBookings / summary.totalBookings) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                </div>
              </div>
            </div>

            {/* Transaction list */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
              </div>
              {bookings.length === 0 ? (
                <div className="text-center py-16">
                  <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions in this period.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {bookings.map(b => {
                    const net = b.total_amount - b.service_fee;
                    const sc = statusColor[b.status] || statusColor.pending;
                    return (
                      <div key={b.id} className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{b.equipment?.title || 'Unknown Equipment'}</p>
                          <p className="text-sm text-gray-500">
                            {b.renter?.full_name || 'Renter'} · {new Date(b.start_date).toLocaleDateString()} – {new Date(b.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">{fmt(net)}</p>
                          <p className="text-xs text-gray-400">after {fmt(b.service_fee)} fee</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sc} flex-shrink-0`}>
                          {b.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Payout History */}
            {payouts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Payout History</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {payouts.map(p => (
                    <div key={p.id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{fmt(p.amount / 100)}</p>
                        <p className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                        p.status === 'completed' ? 'bg-green-50 text-green-600' :
                        p.status === 'failed' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Payout for completed bookings */}
            {payoutStatus?.isOnboarded && bookings.filter(b => b.status === 'completed' && b.payment_status === 'paid').length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Request Payout</h3>
                <div className="space-y-2">
                  {bookings.filter(b => b.status === 'completed' && b.payment_status === 'paid').slice(0, 5).map(b => (
                    <div key={b.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{b.equipment?.title || 'Equipment'}</p>
                        <p className="text-sm text-gray-500">{fmt(b.total_amount - b.service_fee)}</p>
                      </div>
                      <button
                        onClick={() => handleRequestPayout(b.id)}
                        disabled={requestingPayoutId === b.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-60 flex-shrink-0"
                      >
                        {requestingPayoutId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        Payout
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
