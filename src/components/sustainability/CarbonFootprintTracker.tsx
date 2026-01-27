import { useState, useEffect } from 'react';
import {
  Leaf,
  TrendingDown,
  Award,
  Share2,
  Info,
  ChevronRight,
  TreeDeciduous,
  Zap,
  Droplets,
  Wind,
  BarChart3,
  Target,
  Gift,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

interface CarbonFootprintTrackerProps {
  userId: string;
  bookings: BookingCarbonData[];
  onClose?: () => void;
}

interface BookingCarbonData {
  id: string;
  equipmentTitle: string;
  category: string;
  rentalDays: number;
  date: Date;
  carbonSaved: number; // kg CO2
  treesEquivalent: number;
}

interface CarbonStats {
  totalSaved: number;
  treesEquivalent: number;
  waterSaved: number; // liters
  energySaved: number; // kWh
  rankPercentile: number;
  monthlyTrend: { month: string; saved: number }[];
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
}

export default function CarbonFootprintTracker({
  userId,
  bookings,
  onClose,
}: CarbonFootprintTrackerProps) {
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'achievements'>('overview');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    calculateStats();
  }, [bookings]);

  const calculateStats = async () => {
    setLoading(true);

    // Simulate calculation
    await new Promise(resolve => setTimeout(resolve, 1000));

    const totalSaved = bookings.reduce((sum, b) => sum + b.carbonSaved, 0);
    
    const monthlyData: { [key: string]: number } = {};
    bookings.forEach(b => {
      const month = b.date.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + b.carbonSaved;
    });

    const calculatedStats: CarbonStats = {
      totalSaved,
      treesEquivalent: Math.round(totalSaved / 21), // ~21kg CO2 per tree per year
      waterSaved: Math.round(totalSaved * 50), // Estimated water saved through sharing
      energySaved: Math.round(totalSaved * 2.5), // kWh equivalent
      rankPercentile: Math.min(95, Math.round(50 + totalSaved / 10)),
      monthlyTrend: Object.entries(monthlyData).map(([month, saved]) => ({
        month,
        saved,
      })),
      achievements: [
        {
          id: '1',
          title: 'First Rental',
          description: 'Complete your first equipment rental',
          icon: '🌱',
          unlockedAt: new Date(),
          progress: 1,
          target: 1,
        },
        {
          id: '2',
          title: 'Tree Saver',
          description: 'Save the equivalent of 5 trees',
          icon: '🌳',
          unlockedAt: totalSaved >= 105 ? new Date() : undefined,
          progress: Math.min(5, Math.round(totalSaved / 21)),
          target: 5,
        },
        {
          id: '3',
          title: 'Eco Warrior',
          description: 'Save 500kg of CO2',
          icon: '🦸',
          unlockedAt: totalSaved >= 500 ? new Date() : undefined,
          progress: Math.min(500, totalSaved),
          target: 500,
        },
        {
          id: '4',
          title: 'Community Champion',
          description: 'Complete 10 rentals',
          icon: '🏆',
          unlockedAt: bookings.length >= 10 ? new Date() : undefined,
          progress: Math.min(10, bookings.length),
          target: 10,
        },
        {
          id: '5',
          title: 'Carbon Neutral',
          description: 'Save 1 ton of CO2',
          icon: '🌍',
          unlockedAt: totalSaved >= 1000 ? new Date() : undefined,
          progress: Math.min(1000, totalSaved),
          target: 1000,
        },
      ],
    };

    setStats(calculatedStats);
    setLoading(false);
  };

  const handleShare = async () => {
    const message = `I've saved ${stats?.totalSaved.toFixed(1)}kg of CO2 by renting equipment on Islakayd instead of buying new! That's like planting ${stats?.treesEquivalent} trees 🌳 #SharingEconomy #Sustainability`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Carbon Savings',
          text: message,
          url: 'https://islakayd.com',
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(message);
      setShareMessage('Copied to clipboard!');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  const getCarbonEquivalent = (kg: number) => {
    if (kg < 10) return `${kg.toFixed(1)} kg CO₂`;
    if (kg < 1000) return `${kg.toFixed(0)} kg CO₂`;
    return `${(kg / 1000).toFixed(2)} tons CO₂`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Calculating your environmental impact...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Carbon Footprint Tracker</h2>
              <p className="text-sm text-white/80">Your environmental impact</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Main Stats */}
        <div className="bg-white/10 rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold mb-2">
            {getCarbonEquivalent(stats.totalSaved)}
          </div>
          <p className="text-white/80 mb-4">Carbon dioxide saved by renting</p>
          
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-sm">
              <TrendingDown className="w-4 h-4" />
              Top {100 - stats.rankPercentile}% of users
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['overview', 'history', 'achievements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-green-600 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <>
            {/* Impact Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <TreeDeciduous className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{stats.treesEquivalent}</div>
                <div className="text-xs text-green-600">Trees equivalent</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{stats.waterSaved.toLocaleString()}</div>
                <div className="text-xs text-blue-600">Liters saved</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <Zap className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-700">{stats.energySaved}</div>
                <div className="text-xs text-amber-600">kWh saved</div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings</h3>
              <div className="h-40 flex items-end gap-2">
                {stats.monthlyTrend.map((item, index) => {
                  const maxSaved = Math.max(...stats.monthlyTrend.map(m => m.saved));
                  const height = (item.saved / maxSaved) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                      <span className="text-xs text-gray-500">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong className="text-gray-900">How we calculate:</strong> Renting equipment instead of buying new reduces manufacturing emissions, shipping, and disposal waste. Each rental saves an average of 15-50kg CO₂ depending on equipment type.
                  </p>
                </div>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Your Impact
            </button>
            {shareMessage && (
              <p className="text-center text-green-600 text-sm mt-2">{shareMessage}</p>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No rentals yet. Start saving CO₂ today!</p>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{booking.equipmentTitle}</p>
                    <p className="text-sm text-gray-500">
                      {booking.rentalDays} days • {booking.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">-{booking.carbonSaved}kg</p>
                    <p className="text-xs text-gray-500">CO₂ saved</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {stats.achievements.map((achievement) => {
              const isUnlocked = achievement.unlockedAt !== undefined;
              const progress = (achievement.progress / achievement.target) * 100;

              return (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 ${
                    isUnlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${!isUnlocked && 'opacity-50 grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-semibold ${isUnlocked ? 'text-green-800' : 'text-gray-700'}`}>
                          {achievement.title}
                        </h4>
                        {isUnlocked && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isUnlocked ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {achievement.progress}/{achievement.target}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
