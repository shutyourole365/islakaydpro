import { useState, useEffect, useMemo } from 'react';
import {
  Leaf,
  TreePine,
  Recycle,
  Car,
  Zap,
  Award,
  TrendingDown,
  Target,
  BarChart3,
} from 'lucide-react';
// No additional types needed
import { getEquipment, getBookings } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface SustainabilityTrackerProps {
  className?: string;
}

interface CarbonFootprint {
  totalEmissions: number; // kg CO2
  emissionsByEquipment: Array<{
    equipmentId: string;
    equipmentName: string;
    emissions: number;
    bookings: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    emissions: number;
  }>;
  offsetAmount: number;
}

interface EcoMetrics {
  totalEquipment: number;
  ecoFriendlyEquipment: number;
  carbonOffset: number;
  treesPlanted: number;
  wasteRecycled: number;
}

export default function SustainabilityTracker({ className = '' }: SustainabilityTrackerProps) {
  const { user } = useAuth();
  const [carbonData, setCarbonData] = useState<CarbonFootprint | null>(null);
  const [ecoMetrics, setEcoMetrics] = useState<EcoMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    const loadSustainabilityData = async () => {
      if (!user) return;

      try {
        const [equipmentResult, bookingsResult] = await Promise.all([
          getEquipment({ ownerId: user.id }),
          getBookings({ ownerId: user.id }),
        ]);

        const equipment = equipmentResult.data;
        const bookings = bookingsResult;

        // Calculate carbon footprint
        const emissionsByEquipment = equipment.map(eq => {
          const equipmentBookings = bookings.filter(b => b.equipment_id === eq.id);
          const totalRentalDays = equipmentBookings.reduce((sum, booking) => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return sum + days;
          }, 0);

          // Simplified carbon calculation: assume 2.5 kg CO2 per day per equipment
          const emissions = totalRentalDays * 2.5;

          return {
            equipmentId: eq.id,
            equipmentName: eq.name,
            emissions,
            bookings: equipmentBookings.length,
          };
        });

        const totalEmissions = emissionsByEquipment.reduce((sum, item) => sum + item.emissions, 0);

        // Monthly trend (last 6 months)
        const monthlyTrend = [];
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

          const monthEmissions = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.created_at);
              return bookingDate >= monthStart && bookingDate <= monthEnd;
            })
            .reduce((sum, booking) => {
              const days = Math.ceil(
                (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) /
                (1000 * 60 * 60 * 24)
              );
              return sum + (days * 2.5);
            }, 0);

          monthlyTrend.push({
            month: monthName,
            emissions: monthEmissions,
          });
        }

        // Calculate offset amount (assume 10% of emissions are offset)
        const offsetAmount = totalEmissions * 0.1;

        setCarbonData({
          totalEmissions,
          emissionsByEquipment,
          monthlyTrend,
          offsetAmount,
        });

        // Calculate eco metrics
        const ecoFriendlyEquipment = equipment.filter(eq =>
          eq.features.some(feature =>
            feature.toLowerCase().includes('eco') ||
            feature.toLowerCase().includes('green') ||
            feature.toLowerCase().includes('electric') ||
            feature.toLowerCase().includes('hybrid')
          )
        ).length;

        setEcoMetrics({
          totalEquipment: equipment.length,
          ecoFriendlyEquipment,
          carbonOffset: offsetAmount,
          treesPlanted: Math.floor(offsetAmount / 25), // 1 tree offsets ~25kg CO2 per year
          wasteRecycled: Math.floor(totalEmissions * 0.05), // Assume 5% of emissions relate to waste
        });

      } catch (error) {
        console.error('Failed to load sustainability data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSustainabilityData();
  }, [user]);

  const sustainabilityScore = useMemo(() => {
    if (!ecoMetrics || !carbonData) return 0;

    const ecoRatio = ecoMetrics.ecoFriendlyEquipment / ecoMetrics.totalEquipment;
    const offsetRatio = carbonData.offsetAmount / carbonData.totalEmissions;
    const score = (ecoRatio * 40) + (offsetRatio * 40) + 20; // Base score of 20

    return Math.min(100, Math.max(0, Math.round(score)));
  }, [ecoMetrics, carbonData]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!carbonData || !ecoMetrics) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <Leaf className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Unable to load sustainability data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Sustainability Tracker</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Sustainability Score */}
      <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Sustainability Score</h3>
            <p className="text-sm text-gray-600">Based on eco-friendly equipment and carbon offset</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-bold text-lg ${getScoreBg(sustainabilityScore)} ${getScoreColor(sustainabilityScore)}`}>
            {sustainabilityScore}/100
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              sustainabilityScore >= 80 ? 'bg-green-500' :
              sustainabilityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${sustainabilityScore}%` }}
          ></div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Car className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Carbon Footprint</p>
            <p className="text-2xl font-bold text-gray-900">{carbonData.totalEmissions.toFixed(0)} kg</p>
            <p className="text-xs text-gray-500">CO₂ emissions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <TreePine className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Carbon Offset</p>
            <p className="text-2xl font-bold text-gray-900">{carbonData.offsetAmount.toFixed(0)} kg</p>
            <p className="text-xs text-gray-500">CO₂ offset</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Eco Equipment</p>
            <p className="text-2xl font-bold text-gray-900">{ecoMetrics.ecoFriendlyEquipment}</p>
            <p className="text-xs text-gray-500">of {ecoMetrics.totalEquipment} total</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Recycle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">Waste Recycled</p>
            <p className="text-2xl font-bold text-gray-900">{ecoMetrics.wasteRecycled} kg</p>
            <p className="text-xs text-gray-500">estimated</p>
          </div>
        </div>
      </div>

      {/* Emissions Trend */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingDown className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Carbon Emissions Trend</h3>
        </div>
        <div className="h-64 flex items-end justify-between gap-2">
          {carbonData.monthlyTrend.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-red-400 rounded-t"
                style={{
                  height: `${(data.emissions / Math.max(...carbonData.monthlyTrend.map(d => d.emissions))) * 200}px`,
                  minHeight: '4px'
                }}
              ></div>
              <p className="text-xs text-gray-500 mt-2">{data.month}</p>
              <p className="text-xs font-medium text-gray-700">{data.emissions.toFixed(0)}kg</p>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Impact */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Equipment Carbon Impact</h3>
        </div>
        <div className="space-y-4">
          {carbonData.emissionsByEquipment
            .sort((a, b) => b.emissions - a.emissions)
            .slice(0, 5)
            .map((item) => (
            <div key={item.equipmentId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.equipmentName}</p>
                  <p className="text-xs text-gray-500">{item.bookings} booking{item.bookings !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{item.emissions.toFixed(0)} kg CO₂</p>
                <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{
                      width: `${(item.emissions / Math.max(...carbonData.emissionsByEquipment.map(e => e.emissions))) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">Sustainability Goals</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <TreePine className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Plant {ecoMetrics.treesPlanted} Trees</p>
              <p className="text-xs text-green-700">Offset your carbon footprint</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Add Eco Equipment</p>
              <p className="text-xs text-blue-700">Increase your sustainability score</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}