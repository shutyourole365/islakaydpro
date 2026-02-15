import { ArrowLeft, Leaf, TrendingDown, Award, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface CarbonTrackerProps {
  onBack: () => void;
}

export default function CarbonTracker({ onBack }: CarbonTrackerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const carbonData = {
    totalSaved: 2450,
    treesEquivalent: 98,
    co2Avoided: 12500,
    period: 'Last 30 days'
  };

  const equipmentImpact = [
    {
      equipment: 'CAT 320 Excavator',
      rentals: 12,
      carbonSaved: 450,
      treesEquivalent: 18,
      efficiency: 92
    },
    {
      equipment: 'John Deere Tractor',
      rentals: 8,
      carbonSaved: 320,
      treesEquivalent: 13,
      efficiency: 88
    },
    {
      equipment: 'Generator 50kW',
      rentals: 15,
      carbonSaved: 280,
      treesEquivalent: 11,
      efficiency: 95
    },
    {
      equipment: 'Air Compressor',
      rentals: 20,
      carbonSaved: 180,
      treesEquivalent: 7,
      efficiency: 89
    }
  ];

  const monthlyTrends = [
    { month: 'Jan', saved: 2100, trees: 84 },
    { month: 'Feb', saved: 2350, trees: 94 },
    { month: 'Mar', saved: 2450, trees: 98 },
    { month: 'Apr', saved: 2600, trees: 104 },
    { month: 'May', saved: 2750, trees: 110 },
    { month: 'Jun', saved: 2900, trees: 116 }
  ];

  const achievements = [
    {
      title: 'Carbon Champion',
      description: 'Saved 10+ tonnes of CO2 this month',
      icon: <Award className="w-6 h-6" />,
      unlocked: true
    },
    {
      title: 'Tree Planter',
      description: 'Equivalent to planting 100 trees',
      icon: <Leaf className="w-6 h-6" />,
      unlocked: true
    },
    {
      title: 'Efficiency Expert',
      description: '90%+ equipment utilization rate',
      icon: <TrendingDown className="w-6 h-6" />,
      unlocked: false
    },
    {
      title: 'Green Pioneer',
      description: 'First to achieve carbon neutrality',
      icon: <Zap className="w-6 h-6" />,
      unlocked: false
    }
  ];

  const tips = [
    {
      title: 'Choose Efficient Equipment',
      description: 'Opt for newer, fuel-efficient models that reduce emissions by up to 30%.',
      impact: 'High'
    },
    {
      title: 'Minimize Transport',
      description: 'Select equipment available locally to reduce transportation emissions.',
      impact: 'Medium'
    },
    {
      title: 'Share Equipment',
      description: 'Maximize utilization by sharing equipment among multiple users.',
      impact: 'High'
    },
    {
      title: 'Regular Maintenance',
      description: 'Well-maintained equipment operates more efficiently and produces fewer emissions.',
      impact: 'Medium'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Islakayd
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Carbon Footprint Tracker
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-8">
                Track your environmental impact and contribute to a sustainable future
              </p>
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold mb-2">{carbonData.totalSaved.toLocaleString()}</div>
                  <div className="text-green-100">kg CO2 Saved</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">{carbonData.treesEquivalent}</div>
                  <div className="text-green-100">Trees Equivalent</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">{(carbonData.co2Avoided / 1000).toFixed(1)}t</div>
                  <div className="text-green-100">CO2 Avoided</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">A+</div>
                  <div className="text-green-100">Carbon Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Period Selector */}
              <div className="mb-8 flex justify-center">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {['week', 'month', 'quarter', 'year'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedPeriod === period
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Impact */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Equipment Impact</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {equipmentImpact.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{item.equipment}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {item.efficiency}% Efficient
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{item.rentals}</div>
                          <div className="text-sm text-gray-600">Rentals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{item.carbonSaved}</div>
                          <div className="text-sm text-gray-600">kg CO2 Saved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{item.treesEquivalent}</div>
                          <div className="text-sm text-gray-600">Trees</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${item.efficiency}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Trends */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Carbon Savings Trend</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Monthly Progress</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span>12% increase from last month</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-4">
                    {monthlyTrends.map((month, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-green-600 mb-1">{month.saved}</div>
                        <div className="text-sm text-gray-600 mb-2">{month.month}</div>
                        <div className="text-xs text-purple-600">{month.trees} trees</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Environmental Achievements</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-6 rounded-lg border-2 ${
                        achievement.unlocked
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          achievement.unlocked ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                        }`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h3>
                          <p className={`text-sm ${
                            achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.unlocked && (
                          <div className="text-green-600">
                            <Award className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sustainability Tips */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sustainability Tips</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {tips.map((tip, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{tip.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tip.impact === 'High'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {tip.impact} Impact
                        </span>
                      </div>
                      <p className="text-gray-600">{tip.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Make Every Rental Count</h2>
                <p className="text-gray-600 mb-6">
                  Join our mission to reduce carbon emissions through smarter equipment sharing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-green-600 hover:bg-green-700 px-8 py-3">
                    View Full Report
                  </Button>
                  <Button variant="outline" className="px-8 py-3">
                    Share Your Impact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}