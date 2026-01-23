import { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Package,
  Eye,
  Star,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LineChart,
  Download,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  totalRevenue: number;
  revenueChange: number;
  totalBookings: number;
  bookingsChange: number;
  activeListings: number;
  listingsChange: number;
  profileViews: number;
  viewsChange: number;
  averageRating: number;
  totalReviews: number;
  responseRate: number;
  responseTime: number;
  topCategories: { name: string; count: number; revenue: number }[];
  revenueHistory: { date: string; amount: number }[];
  bookingsByStatus: { status: string; count: number; color: string }[];
  recentActivity: { type: string; description: string; time: Date; amount?: number }[];
}

interface AnalyticsDashboardProps {
  onBack?: () => void;
  data?: AnalyticsData;
  period?: '7d' | '30d' | '90d' | '1y';
  onPeriodChange?: (period: '7d' | '30d' | '90d' | '1y') => void;
  onExport?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const defaultData: AnalyticsData = {
  totalRevenue: 24500,
  revenueChange: 12.5,
  totalBookings: 156,
  bookingsChange: 8.3,
  activeListings: 12,
  listingsChange: 2,
  profileViews: 3240,
  viewsChange: 15.2,
  averageRating: 4.8,
  totalReviews: 89,
  responseRate: 98,
  responseTime: 2.5,
  topCategories: [
    { name: 'Construction', count: 45, revenue: 12500 },
    { name: 'Photography', count: 38, revenue: 6800 },
    { name: 'Power Tools', count: 32, revenue: 3200 },
    { name: 'Events', count: 25, revenue: 2000 },
  ],
  revenueHistory: [
    { date: 'Jan 1', amount: 1200 },
    { date: 'Jan 8', amount: 1800 },
    { date: 'Jan 15', amount: 2400 },
    { date: 'Jan 22', amount: 1900 },
    { date: 'Jan 29', amount: 2800 },
    { date: 'Feb 5', amount: 3200 },
    { date: 'Feb 12', amount: 2600 },
  ],
  bookingsByStatus: [
    { status: 'Completed', count: 120, color: 'bg-green-500' },
    { status: 'Active', count: 15, color: 'bg-blue-500' },
    { status: 'Pending', count: 12, color: 'bg-amber-500' },
    { status: 'Cancelled', count: 9, color: 'bg-red-500' },
  ],
  recentActivity: [
    { type: 'booking', description: 'New booking for CAT Excavator', time: new Date(Date.now() - 3600000), amount: 450 },
    { type: 'payment', description: 'Payment received', time: new Date(Date.now() - 7200000), amount: 125 },
    { type: 'review', description: 'New 5-star review received', time: new Date(Date.now() - 86400000) },
    { type: 'listing', description: 'DJ Equipment listing approved', time: new Date(Date.now() - 172800000) },
  ],
};

export default function AnalyticsDashboard({
  onBack,
  data = defaultData,
  period: initialPeriod = '30d',
  onPeriodChange = () => {},
  onExport = () => {},
  onRefresh = () => {},
  loading = false,
}: AnalyticsDashboardProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'bookings' | 'views'>('revenue');
  const [period, setPeriod] = useState(initialPeriod);

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d' | '1y') => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  const periods = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Calculate max value for chart scaling
  const maxRevenue = useMemo(() => {
    return Math.max(...data.revenueHistory.map(d => d.amount), 1);
  }, [data.revenueHistory]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowUpRight className="w-5 h-5 rotate-[225deg]" />
            Back to Dashboard
          </button>
        )}

        <div className="space-y-6">
          {/* Header with Period Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
              <p className="text-gray-500 text-sm">Track your rental performance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                {periods.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePeriodChange(p.id as typeof period)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      period === p.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(data.totalRevenue)}
          change={data.revenueChange}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          label="Total Bookings"
          value={data.totalBookings.toString()}
          change={data.bookingsChange}
          icon={Calendar}
          color="bg-blue-500"
        />
        <MetricCard
          label="Active Listings"
          value={data.activeListings.toString()}
          change={data.listingsChange}
          icon={Package}
          color="bg-purple-500"
        />
        <MetricCard
          label="Profile Views"
          value={formatNumber(data.profileViews)}
          change={data.viewsChange}
          icon={Eye}
          color="bg-amber-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { id: 'revenue', label: 'Revenue', icon: LineChart },
                { id: 'bookings', label: 'Bookings', icon: BarChart3 },
                { id: 'views', label: 'Views', icon: Activity },
              ].map((chart) => (
                <button
                  key={chart.id}
                  onClick={() => setActiveChart(chart.id as typeof activeChart)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeChart === chart.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <chart.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{chart.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="h-64 flex items-end gap-1">
            {data.revenueHistory.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm transition-all hover:from-teal-600 hover:to-teal-500 cursor-pointer relative group"
                  style={{ height: `${(item.amount / maxRevenue) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(item.amount)}
                  </div>
                </div>
                <span className="text-xs text-gray-400 mt-2">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Bookings by Status</h3>
          <div className="space-y-4">
            {data.bookingsByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / Math.max(...data.bookingsByStatus.map(b => b.count))) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Donut Chart Placeholder */}
          <div className="mt-6 flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.bookingsByStatus.reduce((acc, item, index) => {
                  const total = data.bookingsByStatus.reduce((sum, b) => sum + b.count, 0);
                  const percentage = (item.count / total) * 100;
                  const offset = acc.offset;
                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="12"
                      strokeDasharray={`${percentage * 2.51} 251`}
                      strokeDashoffset={-offset * 2.51}
                      className="transition-all duration-500"
                    />
                  );
                  acc.offset += percentage;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{data.totalBookings}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics & Top Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <PerformanceMetric
              icon={Star}
              label="Average Rating"
              value={data.averageRating.toFixed(1)}
              subtext={`from ${data.totalReviews} reviews`}
              color="text-amber-500"
            />
            <PerformanceMetric
              icon={Activity}
              label="Response Rate"
              value={`${data.responseRate}%`}
              subtext="message response"
              color="text-green-500"
            />
            <PerformanceMetric
              icon={Users}
              label="Response Time"
              value={`${data.responseTime}h`}
              subtext="average reply"
              color="text-blue-500"
            />
            <PerformanceMetric
              icon={TrendingUp}
              label="Conversion"
              value="24%"
              subtext="view to book"
              color="text-purple-500"
            />
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Top Performing Categories</h3>
          <div className="space-y-4">
            {data.topCategories.map((category, index) => (
              <div key={category.name} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-amber-500' :
                  index === 1 ? 'bg-gray-400' :
                  index === 2 ? 'bg-orange-400' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-500">{category.count} rentals</span>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {formatCurrency(category.revenue)} revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {data.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'payment' ? 'bg-green-100 text-green-600' :
                activity.type === 'review' ? 'bg-amber-100 text-amber-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {activity.type === 'booking' && <Calendar className="w-5 h-5" />}
                {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                {activity.type === 'review' && <Star className="w-5 h-5" />}
                {activity.type === 'view' && <Eye className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{activity.description}</p>
                <p className="text-sm text-gray-500">{formatTimeAgo(activity.time)}</p>
              </div>
              {activity.amount && (
                <span className="text-green-600 font-semibold">
                  +{formatCurrency(activity.amount)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: number;
  icon: typeof TrendingUp;
  color: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

function PerformanceMetric({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  subtext: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{subtext}</div>
    </div>
  );
}
