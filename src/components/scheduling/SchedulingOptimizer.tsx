import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Zap,
  Target,
  Settings,
} from 'lucide-react';
import type { Equipment, Booking } from '../../types';
import { getEquipment, getBookings } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface SchedulingOptimizerProps {
  equipment?: Equipment[];
  bookings?: Booking[];
  className?: string;
}

interface ScheduleOptimization {
  equipmentId: string;
  equipmentName: string;
  currentUtilization: number;
  optimalUtilization: number;
  revenuePotential: number;
  maintenanceImpact: number;
  demandScore: number;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  availability: number; // percentage
  demand: number; // scale 0-10
  price: number;
}

export default function SchedulingOptimizer({
  equipment: propEquipment,
  bookings: propBookings,
  className = ''
}: SchedulingOptimizerProps) {
  const { user } = useAuth();
  const [optimizations, setOptimizations] = useState<ScheduleOptimization[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'calendar'>('overview');
  const [autoOptimize, setAutoOptimize] = useState(false);

  const calculateUtilization = useCallback((eqBookings: Booking[]): number => {
    const now = new Date();
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    const startDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);

    const bookedDays = eqBookings
      .filter(b => new Date(b.start_date) >= startDate && b.status === 'confirmed')
      .reduce((total, booking) => {
        const start = new Date(booking.start_date);
        const end = new Date(booking.end_date);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return total + days;
      }, 0);

    return Math.min(100, (bookedDays / timeframeDays) * 100);
  }, [selectedTimeframe]);

  const calculateDemand = useCallback((eq: Equipment, eqBookings: Booking[]): number => {
    // Simple demand calculation based on booking frequency and ratings
    const recentBookings = eqBookings.filter(b => {
      const bookingDate = new Date(b.created_at);
      const daysAgo = (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 30;
    });

    const bookingFrequency = recentBookings.length / 30; // bookings per day
    const rating = eq.owner?.rating || 4.0;

    // Demand score from 0-10
    return Math.min(10, (bookingFrequency * 2) + (rating - 3));
  }, []);

  const calculateRevenuePotential = useCallback((eq: Equipment, utilization: number, demand: number): number => {
    const baseRate = eq.daily_rate || 50;
    const optimalUtilization = 85;
    const utilizationGap = Math.max(0, optimalUtilization - utilization);
    const demandMultiplier = demand / 10;

    // Potential additional revenue from increased utilization
    const timeframeDays = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    const potentialBookedDays = (utilizationGap / 100) * timeframeDays * demandMultiplier;

    return Math.round(potentialBookedDays * baseRate);
  }, [selectedTimeframe]);

  const calculateMaintenanceImpact = useCallback((eq: Equipment): number => {
    // Simplified maintenance impact calculation
    // In a real app, this would consider actual maintenance schedules
    // For now, use total_bookings as a proxy for usage
    const usage = eq.total_bookings || 0;

    // Higher impact for heavily used equipment
    return Math.min(100, (usage / 10) + 20); // Base impact of 20, increases with usage
  }, []);

  const generateRecommendations = useCallback((_eq: Equipment, utilization: number, demand: number, maintenance: number): string[] => {
    const recommendations: string[] = [];

    if (utilization < 60) {
      recommendations.push('Increase marketing efforts for this equipment');
      recommendations.push('Consider price optimization to boost bookings');
    }

    if (demand > 7) {
      recommendations.push('High demand - consider adding similar equipment');
      recommendations.push('Implement dynamic pricing for peak periods');
    }

    if (maintenance > 70) {
      recommendations.push('Schedule maintenance to prevent downtime');
      recommendations.push('Consider equipment replacement planning');
    }

    if (utilization > 90) {
      recommendations.push('Equipment is over-utilized - monitor for wear');
      recommendations.push('Consider fleet expansion');
    }

    if (recommendations.length === 0) {
      recommendations.push('Equipment performance is optimal');
    }

    return recommendations;
  }, []);

  const getPriority = useCallback((utilization: number, demand: number, maintenance: number): 'high' | 'medium' | 'low' => {
    if (maintenance > 80 || utilization < 30 || demand > 8) return 'high';
    if (maintenance > 60 || utilization < 50 || demand > 6) return 'medium';
    return 'low';
  }, []);

  const generateOptimizations = useCallback((equipmentList: Equipment[], bookingsList: Booking[]): ScheduleOptimization[] => {
    return equipmentList.map(eq => {
      const eqBookings = bookingsList.filter(b => b.equipment_id === eq.id);
      const utilization = calculateUtilization(eqBookings);
      const demand = calculateDemand(eq, eqBookings);
      const revenue = calculateRevenuePotential(eq, utilization, demand);
      const maintenance = calculateMaintenanceImpact(eq);

      const recommendations = generateRecommendations(eq, utilization, demand, maintenance);

      return {
        equipmentId: eq.id,
        equipmentName: eq.title,
        currentUtilization: utilization,
        optimalUtilization: Math.min(85, utilization + 15), // Target 85% utilization
        revenuePotential: revenue,
        maintenanceImpact: maintenance,
        demandScore: demand,
        recommendations,
        priority: getPriority(utilization, demand, maintenance),
      };
    }).sort((a, b) => {
      // Sort by priority and revenue potential
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority];
      const bPriority = priorityOrder[b.priority];

      if (aPriority !== bPriority) return bPriority - aPriority;
      return b.revenuePotential - a.revenuePotential;
    });
  }, [calculateUtilization, calculateDemand, calculateRevenuePotential, calculateMaintenanceImpact, generateRecommendations, getPriority]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [equipmentData, bookingsData] = await Promise.all([
          propEquipment || getEquipment({ ownerId: user.id }),
          propBookings || getBookings({ ownerId: user.id })
        ]);

        // Generate optimizations
        const equipmentList = Array.isArray(equipmentData) ? equipmentData : (equipmentData as { data?: Equipment[] })?.data || [];
        const bookingsList = Array.isArray(bookingsData) ? bookingsData : (bookingsData as { data?: Booking[] })?.data || [];
        const opts = generateOptimizations(equipmentList, bookingsList);
        setOptimizations(opts);
      } catch (error) {
        console.error('Failed to load scheduling data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, propEquipment, propBookings, generateOptimizations]);

  const timeSlots = useMemo(() => {
    const slots: TimeSlot[] = [];
    const now = new Date();
    const days = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;

    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);

      // Generate hourly slots for the day
      for (let hour = 8; hour < 18; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        // Calculate availability and demand for this slot
        const availability = Math.random() * 100; // Mock data
        const demand = Math.random() * 10; // Mock data
        const basePrice = 50;
        const price = basePrice * (1 + (demand / 10) * 0.5); // Dynamic pricing

        slots.push({
          startTime,
          endTime,
          availability,
          demand,
          price,
        });
      }
    }

    return slots;
  }, [selectedTimeframe]);

  const stats = useMemo(() => {
    const totalRevenue = optimizations.reduce((sum, opt) => sum + opt.revenuePotential, 0);
    const avgUtilization = optimizations.reduce((sum, opt) => sum + opt.currentUtilization, 0) / optimizations.length;
    const highPriorityCount = optimizations.filter(opt => opt.priority === 'high').length;
    const optimalEquipment = optimizations.filter(opt => opt.currentUtilization >= 80).length;

    return {
      totalRevenue,
      avgUtilization: Math.round(avgUtilization),
      highPriorityCount,
      optimalEquipment,
    };
  }, [optimizations]);

  const handleAutoOptimize = () => {
    setAutoOptimize(!autoOptimize);
    // In a real app, this would trigger automatic price adjustments and scheduling
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Smart Scheduler</h2>
            <p className="text-gray-600">AI-powered scheduling optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as typeof selectedTimeframe)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>

            <button
              onClick={handleAutoOptimize}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                autoOptimize
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              {autoOptimize ? 'Auto-Optimizing' : 'Auto Optimize'}
            </button>

            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Revenue Potential</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">${stats.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Avg Utilization</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.avgUtilization}%</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">High Priority</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">{stats.highPriorityCount}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Optimal Equipment</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">{stats.optimalEquipment}</div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
        <div className="flex items-center gap-2">
          {(['overview', 'detailed', 'calendar'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Optimization Cards */}
          <div className="space-y-4">
            {optimizations.slice(0, 5).map((opt) => (
              <div key={opt.equipmentId} className="bg-white rounded-xl p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{opt.equipmentName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opt.priority === 'high' ? 'bg-red-100 text-red-700' :
                        opt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {opt.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      +${opt.revenuePotential}
                    </div>
                    <div className="text-sm text-gray-600">potential</div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Utilization</span>
                    <span className="font-medium">{Math.round(opt.currentUtilization)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${opt.currentUtilization}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Demand Score</span>
                    <span className="font-medium">{opt.demandScore.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${(opt.demandScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Recommendations:</h4>
                  {opt.recommendations.slice(0, 2).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slot Optimization */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimal Time Slots</h3>
            <div className="space-y-3">
              {timeSlots.slice(0, 10).map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {slot.startTime.toLocaleDateString()} {slot.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-xs text-gray-600">
                      Availability: {Math.round(slot.availability)}% | Demand: {slot.demand.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      ${Math.round(slot.price)}
                    </div>
                    <div className="text-xs text-gray-600">optimal price</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed View */}
      {viewMode === 'detailed' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Equipment</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Demand</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Revenue Potential</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {optimizations.map((opt) => (
                  <tr key={opt.equipmentId} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{opt.equipmentName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${opt.currentUtilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{Math.round(opt.currentUtilization)}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium">{opt.demandScore.toFixed(1)}/10</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-green-600">
                        +${opt.revenuePotential}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        opt.priority === 'high' ? 'bg-red-100 text-red-700' :
                        opt.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {opt.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Optimize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4" />
            <p>Calendar view coming soon!</p>
            <p className="text-sm">View scheduling optimizations in calendar format.</p>
          </div>
        </div>
      )}
    </div>
  );
}