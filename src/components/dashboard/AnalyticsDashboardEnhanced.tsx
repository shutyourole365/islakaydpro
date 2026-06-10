import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users, Download, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipmentTrends, getRevenueByCategory, getUserSegmentAnalysis, type EquipmentTrend, type RevenueBreakdown, type UserSegment } from '../../services/equipmentAnalytics';

export default function AnalyticsDashboardEnhanced() {
  const { user } = useAuth();
  const [trends, setTrends] = useState<EquipmentTrend[]>([]);
  const [revenue, setRevenue] = useState<RevenueBreakdown[]>([]);
  const [segments, setSegments] = useState<UserSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    loadAnalytics();
  }, [user?.id]);

  const loadAnalytics = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const [trendsData, revenueData, segmentsData] = await Promise.all([
        getEquipmentTrends(user.id),
        getRevenueByCategory(user.id),
        getUserSegmentAnalysis(user.id),
      ]);
      setTrends(trendsData);
      setRevenue(revenueData);
      setSegments(segmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = trends.reduce((sum, t) => sum + t.totalRevenue, 0);
  const totalRentals = trends.reduce((sum, t) => sum + t.totalRentals, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalRevenue.toFixed(0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Rentals</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalRentals}</p>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Equipment</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{trends.length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Rental</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalRentals > 0 ? (totalRevenue / totalRentals).toFixed(2) : '0'}
              </p>
            </div>
            <Users className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Top Equipment */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Performing Equipment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Equipment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Rentals</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Revenue</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Rating</th>
              </tr>
            </thead>
            <tbody>
              {trends.slice(0, 5).map((trend) => (
                <tr key={trend.equipmentId} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{trend.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{trend.totalRentals}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">${trend.totalRevenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                      {trend.averageRating.toFixed(1)} ⭐
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Revenue by Category</h2>
          <div className="space-y-3">
            {revenue.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{cat.category}</span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">${cat.amount.toFixed(0)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Segments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Customer Segments</h2>
          <div className="space-y-4">
            {segments.map((segment) => (
              <div key={segment.segment} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{segment.segment}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{segment.count} users</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Total Spent</p>
                    <p className="font-semibold text-gray-900 dark:text-white">${segment.totalSpent.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Retention</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{segment.retention.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg font-medium transition">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>
    </div>
  );
}
