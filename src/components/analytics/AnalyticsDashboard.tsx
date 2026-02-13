import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Users,
  Target,
  Zap,
  Star,
} from 'lucide-react';
import type { Equipment, Booking, UserAnalytics } from '../../types';
import { getUserAnalytics, getBookings, getEquipment } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface AnalyticsDashboardProps {
  className?: string;
}

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: typeof DollarSign;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

export default function AnalyticsDashboard({ className = '' }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user) return;

      try {
        const [analyticsData, bookingsData, equipmentData] = await Promise.all([
          getUserAnalytics(user.id),
          getBookings({ ownerId: user.id }),
          getEquipment({ ownerId: user.id }),
        ]);

        setAnalytics(analyticsData);
        setBookings(bookingsData);
        setEquipment(equipmentData.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [user]);

  const metrics = useMemo((): MetricCard[] => {
    if (!analytics || !bookings) return [];

    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.total_amount, 0);

    const activeBookings = bookings.filter(b =>
      b.status === 'active' || b.status === 'confirmed'
    ).length;

    const utilizationRate = equipment.length > 0
      ? (activeBookings / equipment.length) * 100
      : 0;

    const avgRating = equipment.reduce((sum, eq) => sum + eq.rating, 0) / equipment.length;

    return [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 12.5,
        changeLabel: 'vs last month',
        icon: DollarSign,
        color: 'text-green-600',
      },
      {
        title: 'Active Bookings',
        value: activeBookings,
        change: 8.2,
        changeLabel: 'vs last month',
        icon: Calendar,
        color: 'text-blue-600',
      },
      {
        title: 'Equipment Utilization',
        value: `${utilizationRate.toFixed(1)}%`,
        change: -2.1,
        changeLabel: 'vs last month',
        icon: Activity,
        color: 'text-purple-600',
      },
      {
        title: 'Average Rating',
        value: avgRating.toFixed(1),
        change: 0.3,
        changeLabel: 'vs last month',
        icon: Star,
        color: 'text-amber-600',
      },
    ];
  }, [analytics, bookings, equipment]);

  const revenueData = useMemo((): ChartData[] => {
    const monthlyRevenue: Record<string, number> = {};

    bookings
      .filter(b => b.status === 'completed')
      .forEach(booking => {
        const month = new Date(booking.created_at).toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + booking.total_amount;
      });

    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      name: month,
      value: revenue,
      color: '#14b8a6',
    }));
  }, [bookings]);

  const categoryData = useMemo((): ChartData[] => {
    const categoryCount: Record<string, number> = {};

    bookings.forEach(booking => {
      const category = booking.equipment?.category?.name || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const colors = ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];
    return Object.entries(categoryCount).map(([category, count], index) => ({
      name: category,
      value: count,
      color: colors[index % colors.length],
    }));
  }, [bookings]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Time Range Selector */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? 'bg-teal-100 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range === '7d' ? '7 Days' :
               range === '30d' ? '30 Days' :
               range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-xs text-gray-500">{metric.changeLabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {revenueData.slice(-6).map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-teal-500 rounded-t"
                  style={{
                    height: `${(data.value / Math.max(...revenueData.map(d => d.value))) * 200}px`,
                    minHeight: '4px'
                  }}
                ></div>
                <p className="text-xs text-gray-500 mt-2">{data.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Bookings by Category</h3>
          </div>
          <div className="space-y-4">
            {categoryData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.color }}
                  ></div>
                  <span className="text-sm text-gray-700">{data.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(data.value / Math.max(...categoryData.map(d => d.value))) * 100}%`,
                        backgroundColor: data.color
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{data.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-amber-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Optimization Opportunity</span>
            </div>
            <p className="text-sm text-blue-700">
              Increase prices by 5-10% for high-demand equipment during peak seasons.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Growth Trend</span>
            </div>
            <p className="text-sm text-green-700">
              Construction equipment bookings are up 15% this month.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Customer Insight</span>
            </div>
            <p className="text-sm text-purple-700">
              70% of customers return within 3 months for additional rentals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}