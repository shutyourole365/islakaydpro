import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Star,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
} from 'lucide-react';

interface AnalyticsChartsProps {
  userId: string;
  analytics?: {
    revenue: { current: number; previous: number; trend: number };
    bookings: { current: number; previous: number; trend: number };
    views: { current: number; previous: number; trend: number };
    rating: { current: number; previous: number; trend: number };
  };
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

export default function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeMetric, setActiveMetric] = useState<'revenue' | 'bookings' | 'views'>('revenue');

  // Mock data - in production this would come from your analytics service
  const revenueData: ChartData[] = [
    { label: 'Mon', value: 450, color: 'from-teal-400 to-emerald-400' },
    { label: 'Tue', value: 680, color: 'from-teal-400 to-emerald-400' },
    { label: 'Wed', value: 920, color: 'from-teal-400 to-emerald-400' },
    { label: 'Thu', value: 750, color: 'from-teal-400 to-emerald-400' },
    { label: 'Fri', value: 1100, color: 'from-teal-400 to-emerald-400' },
    { label: 'Sat', value: 1450, color: 'from-teal-400 to-emerald-400' },
    { label: 'Sun', value: 890, color: 'from-teal-400 to-emerald-400' },
  ];

  const bookingsData: ChartData[] = [
    { label: 'Mon', value: 3, color: 'from-violet-400 to-purple-400' },
    { label: 'Tue', value: 5, color: 'from-violet-400 to-purple-400' },
    { label: 'Wed', value: 7, color: 'from-violet-400 to-purple-400' },
    { label: 'Thu', value: 4, color: 'from-violet-400 to-purple-400' },
    { label: 'Fri', value: 9, color: 'from-violet-400 to-purple-400' },
    { label: 'Sat', value: 11, color: 'from-violet-400 to-purple-400' },
    { label: 'Sun', value: 6, color: 'from-violet-400 to-purple-400' },
  ];

  const viewsData: ChartData[] = [
    { label: 'Mon', value: 45, color: 'from-blue-400 to-cyan-400' },
    { label: 'Tue', value: 62, color: 'from-blue-400 to-cyan-400' },
    { label: 'Wed', value: 88, color: 'from-blue-400 to-cyan-400' },
    { label: 'Thu', value: 71, color: 'from-blue-400 to-cyan-400' },
    { label: 'Fri', value: 95, color: 'from-blue-400 to-cyan-400' },
    { label: 'Sat', value: 123, color: 'from-blue-400 to-cyan-400' },
    { label: 'Sun', value: 78, color: 'from-blue-400 to-cyan-400' },
  ];

  const currentData = activeMetric === 'revenue' ? revenueData : 
                      activeMetric === 'bookings' ? bookingsData : viewsData;

  const maxValue = Math.max(...currentData.map(d => d.value));

  const stats = analytics || {
    revenue: { current: 6240, previous: 4850, trend: 28.7 },
    bookings: { current: 45, previous: 38, trend: 18.4 },
    views: { current: 562, previous: 412, trend: 36.4 },
    rating: { current: 4.9, previous: 4.7, trend: 4.3 },
  };

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Peak Performance',
      description: 'Weekend bookings are 60% higher than weekdays',
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Price Optimization',
      description: 'Increase daily rate by $25 to match market average',
      color: 'text-amber-600 bg-amber-50',
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Growing Demand',
      description: 'Your excavator has 3x more views this month',
      color: 'text-blue-600 bg-blue-50',
    },
  ];

  const StatCard = ({ 
    icon, 
    label, 
    current, 
    previous, 
    trend, 
    prefix = '',
    suffix = '' 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    current: number; 
    previous: number; 
    trend: number;
    prefix?: string;
    suffix?: string;
  }) => {
    const isPositive = trend > 0;
    
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-teal-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center text-white">
            {icon}
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend).toFixed(1)}%
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {prefix}{current.toLocaleString()}{suffix}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          vs {prefix}{previous.toLocaleString()}{suffix} last period
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Revenue"
          current={stats.revenue.current}
          previous={stats.revenue.previous}
          trend={stats.revenue.trend}
          prefix="$"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5" />}
          label="Bookings"
          current={stats.bookings.current}
          previous={stats.bookings.previous}
          trend={stats.bookings.trend}
        />
        <StatCard
          icon={<Eye className="w-5 h-5" />}
          label="Views"
          current={stats.views.current}
          previous={stats.views.previous}
          trend={stats.views.trend}
        />
        <StatCard
          icon={<Star className="w-5 h-5" />}
          label="Rating"
          current={stats.rating.current}
          previous={stats.rating.previous}
          trend={stats.rating.trend}
        />
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {[
              { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" />, color: 'from-teal-400 to-emerald-400' },
              { id: 'bookings', label: 'Bookings', icon: <Calendar className="w-4 h-4" />, color: 'from-violet-400 to-purple-400' },
              { id: 'views', label: 'Views', icon: <Eye className="w-4 h-4" />, color: 'from-blue-400 to-cyan-400' },
            ].map((metric) => (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeMetric === metric.id
                    ? `bg-gradient-to-r ${metric.color} text-white shadow-lg`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {metric.icon}
                <span className="text-sm font-medium">{metric.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="p-6">
          <div className="flex items-end gap-4 h-64">
            {currentData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative w-full h-full flex flex-col justify-end group">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {activeMetric === 'revenue' ? `$${data.value}` : data.value}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                  </div>
                  
                  {/* Bar */}
                  <div
                    className={`w-full bg-gradient-to-t ${data.color} rounded-t-lg transition-all duration-300 hover:opacity-80`}
                    style={{ height: `${(data.value / maxValue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{data.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        
        <div className="grid gap-3">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 bg-white rounded-xl">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${insight.color}`}>
                {insight.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
