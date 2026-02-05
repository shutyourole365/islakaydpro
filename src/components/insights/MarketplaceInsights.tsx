import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Users,
  Package,
  Calendar,
  Minus,
  Download,
  RefreshCw,
  Lightbulb,
  Target,
  Zap,
  Eye,
  Star,
  Clock,
  MapPin,
  X,
} from 'lucide-react';
import type { MarketInsight } from '../../types';

interface MarketplaceInsightsProps {
  categoryId?: string;
  equipmentId?: string;
  onClose?: () => void;
}

// Mock data for market insights
const mockInsights: MarketInsight[] = [
  {
    id: '1',
    category_id: 'cat1',
    insight_type: 'demand_trend',
    title: 'Construction Equipment Demand Rising',
    description: 'Demand for excavators and loaders increased 23% this month compared to last year.',
    data: {
      trend_direction: 'up',
      percentage_change: 23,
      time_period: '30 days',
      data_points: [
        { date: '2026-01-01', value: 100 },
        { date: '2026-01-07', value: 112 },
        { date: '2026-01-14', value: 108 },
        { date: '2026-01-21', value: 119 },
        { date: '2026-01-28', value: 123 },
      ],
      recommendations: [
        'Consider listing more excavators',
        'Adjust daily rates upward by 5-10%',
        'Offer weekly rate discounts to capture longer bookings',
      ],
    },
    valid_from: '2026-01-01',
    valid_until: '2026-02-28',
    created_at: '2026-01-28T10:00:00Z',
  },
  {
    id: '2',
    category_id: 'cat2',
    insight_type: 'price_trend',
    title: 'Average Rental Prices Stabilizing',
    description: 'After a period of fluctuation, prices have stabilized around $385/day for mid-size equipment.',
    data: {
      trend_direction: 'stable',
      percentage_change: -2,
      time_period: '30 days',
      data_points: [
        { date: '2026-01-01', value: 392 },
        { date: '2026-01-07', value: 388 },
        { date: '2026-01-14', value: 390 },
        { date: '2026-01-21', value: 385 },
        { date: '2026-01-28', value: 385 },
      ],
      recommendations: [
        'Maintain current pricing strategy',
        'Focus on service quality to differentiate',
        'Consider value-add services like delivery',
      ],
    },
    valid_from: '2026-01-01',
    valid_until: '2026-02-28',
    created_at: '2026-01-28T10:00:00Z',
  },
  {
    id: '3',
    category_id: null,
    insight_type: 'seasonal_pattern',
    title: 'Spring Construction Season Approaching',
    description: 'Historical data shows 40% increase in equipment rentals starting mid-February.',
    data: {
      trend_direction: 'up',
      percentage_change: 40,
      time_period: 'Seasonal',
      data_points: [
        { date: '2025-02', value: 85 },
        { date: '2025-03', value: 115 },
        { date: '2025-04', value: 140 },
        { date: '2025-05', value: 155 },
        { date: '2025-06', value: 160 },
      ],
      recommendations: [
        'Prepare inventory for increased demand',
        'Schedule maintenance now before busy season',
        'Consider hiring additional support staff',
      ],
    },
    valid_from: '2026-01-15',
    valid_until: '2026-03-31',
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: '4',
    category_id: 'cat1',
    insight_type: 'competitor_analysis',
    title: 'New Listings in Your Area',
    description: '12 new excavators listed within 25 miles. Average price: $420/day.',
    data: {
      trend_direction: 'up',
      percentage_change: 15,
      time_period: '7 days',
      data_points: [
        { date: '2026-01-22', value: 45 },
        { date: '2026-01-23', value: 47 },
        { date: '2026-01-24', value: 51 },
        { date: '2026-01-25', value: 54 },
        { date: '2026-01-26', value: 55 },
        { date: '2026-01-27', value: 56 },
        { date: '2026-01-28', value: 57 },
      ],
      recommendations: [
        'Review your pricing against new listings',
        'Highlight unique features in descriptions',
        'Improve listing photos to stand out',
      ],
    },
    valid_from: '2026-01-22',
    valid_until: '2026-02-05',
    created_at: '2026-01-28T10:00:00Z',
  },
];

// Mock pricing suggestions
const mockPricingSuggestions = [
  {
    equipmentId: 'eq1',
    title: 'CAT 320 Excavator',
    currentDaily: 450,
    suggestedDaily: 475,
    marketAverage: 465,
    demandScore: 85,
    confidence: 92,
    reasoning: 'High demand in your area + excellent condition + strong reviews',
  },
  {
    equipmentId: 'eq2',
    title: 'John Deere Backhoe',
    currentDaily: 350,
    suggestedDaily: 340,
    marketAverage: 345,
    demandScore: 62,
    confidence: 78,
    reasoning: 'Slight oversupply in market + moderate seasonality',
  },
];

// Mock market stats
const marketStats = {
  totalListings: 2847,
  activeRentals: 1234,
  avgDailyRate: 385,
  avgUtilization: 68,
  topCategories: [
    { name: 'Excavators', count: 456, growth: 12 },
    { name: 'Loaders', count: 389, growth: 8 },
    { name: 'Concrete', count: 312, growth: 15 },
    { name: 'Scaffolding', count: 287, growth: -3 },
  ],
  hotLocations: [
    { name: 'Los Angeles, CA', demand: 95 },
    { name: 'San Diego, CA', demand: 87 },
    { name: 'Phoenix, AZ', demand: 82 },
    { name: 'Denver, CO', demand: 78 },
  ],
};

export default function MarketplaceInsights({ categoryId, equipmentId, onClose }: MarketplaceInsightsProps) {
  void equipmentId; // Reserved for future use
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedInsightType, setSelectedInsightType] = useState<'all' | 'demand_trend' | 'price_trend' | 'seasonal_pattern' | 'competitor_analysis'>('all');
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'pricing' | 'competitors'>('overview');

  // Filter insights
  const filteredInsights = useMemo(() => {
    return mockInsights.filter((insight) => {
      if (categoryId && insight.category_id && insight.category_id !== categoryId) return false;
      if (selectedInsightType !== 'all' && insight.insight_type !== selectedInsightType) return false;
      return true;
    });
  }, [categoryId, selectedInsightType]);

  // Get trend icon
  const getTrendIcon = (direction: 'up' | 'down' | 'stable', size = 4) => {
    const className = `w-${size} h-${size}`;
    switch (direction) {
      case 'up':
        return <TrendingUp className={`${className} text-green-500`} />;
      case 'down':
        return <TrendingDown className={`${className} text-red-500`} />;
      default:
        return <Minus className={`${className} text-gray-500`} />;
    }
  };

  // Get trend color
  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'text-green-600 bg-green-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Render mini chart
  const renderMiniChart = (dataPoints: Array<{ date: string; value: number }>, trend: 'up' | 'down' | 'stable') => {
    const maxValue = Math.max(...dataPoints.map((d) => d.value));
    const minValue = Math.min(...dataPoints.map((d) => d.value));
    const range = maxValue - minValue || 1;

    const getColor = () => {
      switch (trend) {
        case 'up':
          return 'stroke-green-500';
        case 'down':
          return 'stroke-red-500';
        default:
          return 'stroke-gray-400';
      }
    };

    const points = dataPoints
      .map((d, i) => {
        const x = (i / (dataPoints.length - 1)) * 100;
        const y = 100 - ((d.value - minValue) / range) * 80 - 10;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline fill="none" className={`${getColor()} stroke-2`} points={points} />
      </svg>
    );
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Listings', value: marketStats.totalListings.toLocaleString(), icon: Package, trend: '+12%' },
          { label: 'Active Rentals', value: marketStats.activeRentals.toLocaleString(), icon: Calendar, trend: '+8%' },
          { label: 'Avg Daily Rate', value: `$${marketStats.avgDailyRate}`, icon: DollarSign, trend: '-2%' },
          { label: 'Utilization', value: `${marketStats.avgUtilization}%`, icon: BarChart3, trend: '+5%' },
        ].map((metric, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="w-5 h-5 text-teal-600" />
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded ${
                  metric.trend.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {metric.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            <p className="text-sm text-gray-500">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Top Categories & Locations */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            Top Categories
          </h4>
          <div className="space-y-3">
            {marketStats.topCategories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                    {idx + 1}
                  </span>
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">{cat.count}</span>
                  <span
                    className={`text-xs font-medium ${
                      cat.growth > 0 ? 'text-green-600' : cat.growth < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {cat.growth > 0 ? '+' : ''}{cat.growth}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            High-Demand Locations
          </h4>
          <div className="space-y-3">
            {marketStats.hotLocations.map((loc, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="font-medium">{loc.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${loc.demand}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{loc.demand}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 border border-teal-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Quick Insights
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Best time to list</p>
            <p className="font-semibold text-gray-900">Tuesday-Thursday</p>
            <p className="text-xs text-teal-600">23% more views</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Optimal price point</p>
            <p className="font-semibold text-gray-900">$350-$400/day</p>
            <p className="text-xs text-teal-600">Highest conversion</p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm text-gray-600">Popular rental length</p>
            <p className="font-semibold text-gray-900">3-5 days</p>
            <p className="text-xs text-teal-600">45% of bookings</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Render insights tab
  const renderInsights = () => (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={selectedInsightType}
          onChange={(e) => setSelectedInsightType(e.target.value as typeof selectedInsightType)}
          className="px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Insights</option>
          <option value="demand_trend">Demand Trends</option>
          <option value="price_trend">Price Trends</option>
          <option value="seasonal_pattern">Seasonal Patterns</option>
          <option value="competitor_analysis">Competitor Analysis</option>
        </select>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="border rounded-lg overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getTrendIcon(insight.data.trend_direction, 5)}
                  <div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getTrendColor(
                          insight.data.trend_direction
                        )}`}
                      >
                        {insight.data.trend_direction === 'stable' ? 'Stable' : 
                          `${insight.data.percentage_change > 0 ? '+' : ''}${insight.data.percentage_change}%`}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {insight.data.time_period}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {insight.insight_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-24">
                  {renderMiniChart(insight.data.data_points, insight.data.trend_direction)}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedInsight === insight.id && (
              <div className="border-t bg-gray-50 p-4">
                <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-teal-600" />
                  Recommendations
                </h5>
                <ul className="space-y-2">
                  {insight.data.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Render pricing tab
  const renderPricing = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-900">Smart Pricing Suggestions</h4>
            <p className="text-sm text-amber-800 mt-1">
              Based on market analysis, demand patterns, and your equipment condition
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {mockPricingSuggestions.map((suggestion) => (
          <div key={suggestion.equipmentId} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
              <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                {suggestion.confidence}% confidence
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Current Rate</p>
                <p className="text-xl font-bold text-gray-900">${suggestion.currentDaily}</p>
                <p className="text-xs text-gray-500">/day</p>
              </div>
              <div className="text-center p-3 bg-teal-50 rounded-lg border-2 border-teal-200">
                <p className="text-sm text-teal-700">Suggested Rate</p>
                <p className="text-xl font-bold text-teal-700">${suggestion.suggestedDaily}</p>
                <p className="text-xs text-teal-600">/day</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Market Average</p>
                <p className="text-xl font-bold text-gray-600">${suggestion.marketAverage}</p>
                <p className="text-xs text-gray-500">/day</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Demand Score</span>
                  <span className="text-sm font-medium">{suggestion.demandScore}/100</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${suggestion.demandScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                <strong>Why this suggestion:</strong> {suggestion.reasoning}
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                Dismiss
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
                Apply Suggestion
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render competitors tab
  const renderCompetitors = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Competitor Analysis</h4>
            <p className="text-sm text-blue-800 mt-1">
              See how your listings compare to others in your area
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Metric</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Your Listings</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Market Average</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-700">Top 10%</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[
              { metric: 'Average Daily Rate', yours: '$425', market: '$385', top: '$550' },
              { metric: 'Response Time', yours: '2.5 hrs', market: '4.2 hrs', top: '1.1 hrs' },
              { metric: 'Booking Rate', yours: '68%', market: '54%', top: '82%' },
              { metric: 'Average Rating', yours: '4.7', market: '4.3', top: '4.9' },
              { metric: 'Photos per Listing', yours: '6', market: '4', top: '12' },
            ].map((row, idx) => (
              <tr key={idx}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.metric}</td>
                <td className="px-4 py-3 text-sm text-center text-teal-600 font-medium">{row.yours}</td>
                <td className="px-4 py-3 text-sm text-center text-gray-600">{row.market}</td>
                <td className="px-4 py-3 text-sm text-center text-amber-600 font-medium">{row.top}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Improvement Tips */}
      <div className="bg-white border rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          How to Improve Your Rankings
        </h4>
        <div className="space-y-3">
          {[
            { tip: 'Add more high-quality photos', impact: 'High', effort: 'Low' },
            { tip: 'Respond to inquiries within 1 hour', impact: 'High', effort: 'Medium' },
            { tip: 'Complete your equipment specifications', impact: 'Medium', effort: 'Low' },
            { tip: 'Offer flexible cancellation policies', impact: 'Medium', effort: 'Low' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-800">{item.tip}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {item.impact} Impact
                </span>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.effort === 'Low' ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {item.effort} Effort
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Marketplace Insights</h2>
              <p className="text-teal-100 text-sm">Data-driven insights to optimize your listings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as typeof selectedTimeRange)}
              className="px-3 py-1.5 bg-white/20 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="7d" className="text-gray-900">Last 7 days</option>
              <option value="30d" className="text-gray-900">Last 30 days</option>
              <option value="90d" className="text-gray-900">Last 90 days</option>
              <option value="1y" className="text-gray-900">Last year</option>
            </select>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'insights', label: 'Insights', icon: Lightbulb },
            { id: 'pricing', label: 'Pricing', icon: DollarSign },
            { id: 'competitors', label: 'Competitors', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-teal-700'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'pricing' && renderPricing()}
        {activeTab === 'competitors' && renderCompetitors()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-1 px-3 py-1.5 text-teal-600 hover:bg-teal-50 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
