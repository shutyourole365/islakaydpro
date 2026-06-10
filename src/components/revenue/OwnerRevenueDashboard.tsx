import { useState, useMemo } from 'react';
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Calendar, Package, Star, ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Users } from 'lucide-react';

interface OwnerRevenueDashboardProps {
  onBack: () => void;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookings: number;
  avgDaily: number;
}

interface EquipmentEarnings {
  name: string;
  revenue: number;
  bookings: number;
  utilization: number;
  rating: number;
  trend: 'up' | 'down' | 'stable';
}

interface Transaction {
  id: string;
  date: string;
  renter: string;
  equipment: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  type: 'rental' | 'deposit_return' | 'insurance_claim' | 'payout';
}

const monthlyData: MonthlyRevenue[] = [
  { month: 'Sep 2025', revenue: 8450, bookings: 12, avgDaily: 282 },
  { month: 'Oct 2025', revenue: 11200, bookings: 18, avgDaily: 361 },
  { month: 'Nov 2025', revenue: 9800, bookings: 15, avgDaily: 327 },
  { month: 'Dec 2025', revenue: 7200, bookings: 10, avgDaily: 232 },
  { month: 'Jan 2026', revenue: 12500, bookings: 20, avgDaily: 403 },
  { month: 'Feb 2026', revenue: 14800, bookings: 24, avgDaily: 529 },
];

const equipmentEarnings: EquipmentEarnings[] = [
  { name: 'CAT 320 Excavator', revenue: 28500, bookings: 42, utilization: 78, rating: 4.9, trend: 'up' },
  { name: 'John Deere 1025R', revenue: 18200, bookings: 35, utilization: 65, rating: 4.7, trend: 'stable' },
  { name: 'Premium DJ Package', revenue: 15600, bookings: 52, utilization: 82, rating: 4.9, trend: 'up' },
  { name: 'Sony A7IV Camera Kit', revenue: 12400, bookings: 89, utilization: 91, rating: 5.0, trend: 'up' },
  { name: 'DeWalt Power Tool Kit', revenue: 8900, bookings: 67, utilization: 73, rating: 4.8, trend: 'down' },
];

const recentTransactions: Transaction[] = [
  { id: 't1', date: '2026-02-24', renter: 'John D.', equipment: 'CAT 320 Excavator', amount: 2250, status: 'completed', type: 'rental' },
  { id: 't2', date: '2026-02-23', renter: 'Sarah M.', equipment: 'Sony A7IV Camera Kit', amount: 375, status: 'completed', type: 'rental' },
  { id: 't3', date: '2026-02-22', renter: 'Mike R.', equipment: 'Premium DJ Package', amount: 590, status: 'processing', type: 'rental' },
  { id: 't4', date: '2026-02-21', renter: 'Lisa K.', equipment: 'DeWalt Power Tool Kit', amount: 300, status: 'completed', type: 'deposit_return' },
  { id: 't5', date: '2026-02-20', renter: 'Platform', equipment: 'Monthly Payout', amount: 8450, status: 'pending', type: 'payout' },
  { id: 't6', date: '2026-02-19', renter: 'David W.', equipment: 'John Deere 1025R', amount: 1200, status: 'completed', type: 'rental' },
  { id: 't7', date: '2026-02-18', renter: 'Insurance Co.', equipment: 'CAT 320 Excavator', amount: 850, status: 'completed', type: 'insurance_claim' },
];

const statusStyles = {
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const typeLabels: Record<Transaction['type'], string> = {
  rental: 'Rental Income',
  deposit_return: 'Deposit Return',
  insurance_claim: 'Insurance Claim',
  payout: 'Payout',
};

export default function OwnerRevenueDashboard({ onBack }: OwnerRevenueDashboardProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = monthlyData.reduce((sum, m) => sum + m.bookings, 0);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const revenueChange = ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100;
  const bookingsChange = ((currentMonth.bookings - prevMonth.bookings) / prevMonth.bookings) * 100;
  const maxRevenue = Math.max(...monthlyData.map((m) => m.revenue));

  const avgUtilization = useMemo(() => {
    return equipmentEarnings.reduce((sum, e) => sum + e.utilization, 0) / equipmentEarnings.length;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
              <p className="text-gray-500 mt-1">Track your equipment rental earnings and performance</p>
            </div>
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">This Month Revenue</span>
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">${currentMonth.revenue.toLocaleString()}</p>
            <p className={`text-sm mt-1 flex items-center gap-1 ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {revenueChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(revenueChange).toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Bookings</span>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currentMonth.bookings}</p>
            <p className={`text-sm mt-1 flex items-center gap-1 ${bookingsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {bookingsChange >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(bookingsChange).toFixed(1)}% vs last month
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Avg Utilization</span>
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgUtilization.toFixed(0)}%</p>
            <p className="text-sm text-gray-500 mt-1">Across {equipmentEarnings.length} items</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">Total Earnings (6mo)</span>
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">{totalBookings} total bookings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-600" /> Monthly Revenue
                </h3>
              </div>
              <div className="space-y-3">
                {monthlyData.map((m) => (
                  <div key={m.month} className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-20 flex-shrink-0">{m.month.split(' ')[0]}</span>
                    <div className="flex-1 relative">
                      <div className="w-full bg-gray-100 rounded-full h-8">
                        <div
                          className="h-8 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">${(m.revenue / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right">{m.bookings} bookings</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment Performance */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" /> Top Equipment
              </h3>
              <div className="space-y-4">
                {equipmentEarnings.map((eq, i) => (
                  <div key={eq.name} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{eq.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>${eq.revenue.toLocaleString()}</span>
                        <span className="flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {eq.rating}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-medium ${
                        eq.trend === 'up' ? 'text-green-600' : eq.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {eq.trend === 'up' && <TrendingUp className="w-3 h-3 inline" />}
                        {eq.trend === 'down' && <TrendingDown className="w-3 h-3 inline" />}
                        {' '}{eq.utilization}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" /> Recent Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Renter</th>
                  <th className="pb-3 font-medium">Equipment</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{tx.renter}</td>
                    <td className="py-3 text-sm text-gray-600">{tx.equipment}</td>
                    <td className="py-3">
                      <span className="text-xs text-gray-500">{typeLabels[tx.type]}</span>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyles[tx.status].bg} ${statusStyles[tx.status].text}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </td>
                    <td className={`py-3 text-sm font-bold text-right ${
                      tx.type === 'deposit_return' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {tx.type === 'deposit_return' ? '-' : '+'}${tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
