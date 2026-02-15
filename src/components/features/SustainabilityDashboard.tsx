import { ArrowLeft, Leaf, Award, Target, Zap, Droplets, TreePine } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

interface SustainabilityMetrics {
  carbonSaved: number;
  treesEquivalent: number;
  waterSaved: number;
  energySaved: number;
  wasteReduced: number;
  score: number;
}

interface BookingImpact {
  id: string;
  equipmentTitle: string;
  category: string;
  rentalDays: number;
  date: Date;
  carbonSaved: number;
  treesEquivalent: number;
  waterSaved: number;
  energySaved: number;
}

interface SustainabilityDashboardProps {
  onBack: () => void;
  userId?: string;
}

export default function SustainabilityDashboard({ onBack }: SustainabilityDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [showAchievements, setShowAchievements] = useState(false);

  // Mock sustainability data
  const metrics: SustainabilityMetrics = {
    carbonSaved: 2450, // kg CO2
    treesEquivalent: 85,
    waterSaved: 12500, // liters
    energySaved: 890, // kWh
    wasteReduced: 320, // kg
    score: 87
  };

  const bookingHistory: BookingImpact[] = [
    {
      id: '1',
      equipmentTitle: 'CAT 320 Excavator',
      category: 'Construction',
      rentalDays: 5,
      date: new Date('2026-01-15'),
      carbonSaved: 450,
      treesEquivalent: 15,
      waterSaved: 2500,
      energySaved: 180
    },
    {
      id: '2',
      equipmentTitle: 'Sony Camera Kit',
      category: 'Photography',
      rentalDays: 3,
      date: new Date('2026-01-10'),
      carbonSaved: 120,
      treesEquivalent: 4,
      waterSaved: 800,
      energySaved: 45
    },
    {
      id: '3',
      equipmentTitle: 'DeWalt Tool Kit',
      category: 'Power Tools',
      rentalDays: 7,
      date: new Date('2026-01-05'),
      carbonSaved: 280,
      treesEquivalent: 9,
      waterSaved: 1500,
      energySaved: 95
    },
    {
      id: '4',
      equipmentTitle: 'Honda Generator',
      category: 'Power Equipment',
      rentalDays: 4,
      date: new Date('2026-01-01'),
      carbonSaved: 380,
      treesEquivalent: 12,
      waterSaved: 2100,
      energySaved: 220
    }
  ];

  const achievements = [
    {
      id: 'carbon-champion',
      title: 'Carbon Champion',
      description: 'Saved over 2 tons of CO2 emissions',
      icon: <Leaf className="w-8 h-8 text-green-600" />,
      unlocked: true,
      progress: 98
    },
    {
      id: 'tree-planter',
      title: 'Tree Planter',
      description: 'Equivalent to planting 100 trees',
      icon: <TreePine className="w-8 h-8 text-green-600" />,
      unlocked: true,
      progress: 85
    },
    {
      id: 'water-conservationist',
      title: 'Water Conservationist',
      description: 'Saved 10,000+ liters of water',
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      unlocked: true,
      progress: 100
    },
    {
      id: 'energy-efficient',
      title: 'Energy Efficient',
      description: 'Reduced energy consumption by 1,000 kWh',
      icon: <Zap className="w-8 h-8 text-yellow-600" />,
      unlocked: false,
      progress: 89
    },
    {
      id: 'eco-warrior',
      title: 'Eco Warrior',
      description: 'Achieved perfect sustainability score',
      icon: <Award className="w-8 h-8 text-purple-600" />,
      unlocked: false,
      progress: 87
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Sustainability Dashboard</h1>
                <p className="text-green-100">Track your environmental impact and earn eco-rewards</p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex justify-center gap-2">
              {[
                { key: 'week', label: 'This Week' },
                { key: 'month', label: 'This Month' },
                { key: 'year', label: 'This Year' }
              ].map((period) => (
                <button
                  key={period.key}
                  onClick={() => setSelectedPeriod(period.key as 'week' | 'month' | 'year')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPeriod === period.key
                      ? 'bg-white text-green-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Sustainability Score */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 mb-4">
                <div className="text-center text-white">
                  <div className="text-3xl font-bold">{metrics.score}</div>
                  <div className="text-sm">Score</div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Sustainability Score</h2>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(metrics.score)}`}>
                {getScoreLabel(metrics.score)}
              </span>
            </div>

            {/* Key Metrics */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Environmental Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{metrics.carbonSaved.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">kg CO₂ Saved</div>
                </div>

                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TreePine className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{metrics.treesEquivalent}</div>
                  <div className="text-sm text-gray-600">Trees Equivalent</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Droplets className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{(metrics.waterSaved / 1000).toFixed(1)}k</div>
                  <div className="text-sm text-gray-600">Liters Water Saved</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">{metrics.energySaved}</div>
                  <div className="text-sm text-gray-600">kWh Energy Saved</div>
                </div>
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Impact by Equipment Category</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="space-y-4">
                  {[
                    { category: 'Construction', impact: 45, color: 'bg-orange-500' },
                    { category: 'Photography', impact: 25, color: 'bg-blue-500' },
                    { category: 'Power Tools', impact: 20, color: 'bg-green-500' },
                    { category: 'Power Equipment', impact: 10, color: 'bg-yellow-500' }
                  ].map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.impact}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12">{item.impact}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Bookings Impact */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Rental Impact</h2>
              <div className="space-y-4">
                {bookingHistory.map((booking) => (
                  <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.equipmentTitle}</h3>
                        <p className="text-sm text-gray-600">{booking.category} • {booking.rentalDays} days • {booking.date.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{booking.carbonSaved}kg CO₂</div>
                        <div className="text-sm text-gray-500">saved</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm font-medium text-gray-700">Trees</div>
                        <div className="text-lg font-semibold text-green-600">{booking.treesEquivalent}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Water</div>
                        <div className="text-lg font-semibold text-blue-600">{(booking.waterSaved / 1000).toFixed(1)}k L</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-700">Energy</div>
                        <div className="text-lg font-semibold text-yellow-600">{booking.energySaved} kWh</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Eco Achievements</h2>
                <Button
                  onClick={() => setShowAchievements(!showAchievements)}
                  variant="outline"
                  size="sm"
                >
                  {showAchievements ? 'Hide' : 'Show All'}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.slice(0, showAchievements ? achievements.length : 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{achievement.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${achievement.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {achievement.unlocked && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <Award className="w-4 h-4" />
                        Unlocked!
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tips & Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Sustainability Tips</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Choose equipment with high sustainability ratings</li>
                    <li>• Opt for longer rental periods to reduce transportation emissions</li>
                    <li>• Consider electric or hybrid equipment options when available</li>
                    <li>• Participate in our carbon offset program for additional impact</li>
                    <li>• Share equipment with other users to maximize utilization</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}