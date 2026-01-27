import { useState, useEffect } from 'react';
import {
  Calendar,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';

interface SmartSchedulerProps {
  equipmentId: string;
  equipmentTitle: string;
  dailyRate: number;
  onSelectDates: (start: Date, end: Date, discount: number) => void;
  onClose: () => void;
}

interface TimeSlot {
  date: Date;
  available: boolean;
  demand: 'low' | 'medium' | 'high';
  discount: number;
  price: number;
  recommended: boolean;
  reason?: string;
}

interface AIRecommendation {
  startDate: Date;
  endDate: Date;
  totalSavings: number;
  reason: string;
  confidence: number;
}

export default function SmartScheduler({
  equipmentTitle,
  dailyRate,
  onSelectDates,
}: SmartSchedulerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'recommendations'>('calendar');

  useEffect(() => {
    loadSmartData();
  }, [currentMonth]);

  const loadSmartData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate smart time slots
    const slots: TimeSlot[] = [];
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const dayOfMonth = d.getDate();
      
      // Simulate demand patterns
      let demand: TimeSlot['demand'] = 'medium';
      let discount = 0;
      let recommended = false;
      let reason: string | undefined;
      
      // Weekdays generally lower demand
      if (!isWeekend) {
        demand = 'low';
        discount = 15;
        if (dayOfWeek === 2 || dayOfWeek === 3) { // Tue/Wed best
          discount = 20;
          recommended = true;
          reason = 'Best day of the week - 20% off';
        }
      } else {
        demand = 'high';
        discount = 0;
      }
      
      // End of month often less busy
      if (dayOfMonth >= 25) {
        discount = Math.max(discount, 10);
        if (!isWeekend) {
          recommended = true;
          reason = 'End of month special';
        }
      }
      
      // Future dates only
      const available = d >= new Date();
      
      slots.push({
        date: new Date(d),
        available,
        demand,
        discount,
        price: Math.round(dailyRate * (1 - discount / 100)),
        recommended,
        reason,
      });
    }

    // Generate AI recommendations
    const recs: AIRecommendation[] = [
      {
        startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 15),
        endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 18),
        totalSavings: 85,
        reason: 'Mid-week booking with 20% discount. Lowest demand period.',
        confidence: 95,
      },
      {
        startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 27),
        endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
        totalSavings: 120,
        reason: 'End of month pricing + weekend rates. Great value!',
        confidence: 88,
      },
      {
        startDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 8),
        endDate: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 10),
        totalSavings: 45,
        reason: 'Popular dates but still 15% off for weekday portion.',
        confidence: 75,
      },
    ];

    setTimeSlots(slots);
    setRecommendations(recs);
    setLoading(false);
  };

  const handleDateClick = (slot: TimeSlot) => {
    if (!slot.available) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(slot.date);
      setSelectedEnd(null);
    } else {
      if (slot.date < selectedStart) {
        setSelectedStart(slot.date);
      } else {
        setSelectedEnd(slot.date);
      }
    }
  };

  const calculateTotal = () => {
    if (!selectedStart || !selectedEnd) return null;

    let total = 0;
    let savings = 0;
    let days = 0;

    for (const slot of timeSlots) {
      if (slot.date >= selectedStart && slot.date <= selectedEnd && slot.available) {
        total += slot.price;
        savings += dailyRate - slot.price;
        days++;
      }
    }

    return { total, savings, days, avgDiscount: Math.round((savings / (days * dailyRate)) * 100) };
  };

  const totals = calculateTotal();

  const isDateInRange = (date: Date) => {
    if (!selectedStart) return false;
    const end = selectedEnd || selectedStart;
    return date >= selectedStart && date <= end;
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const applyRecommendation = (rec: AIRecommendation) => {
    setSelectedStart(rec.startDate);
    setSelectedEnd(rec.endDate);
    setViewMode('calendar');
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Analyzing best times to book...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Smart Scheduler</h2>
              <p className="text-sm text-white/80">{equipmentTitle}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${dailyRate}/day</p>
            <p className="text-sm text-white/80">Base rate</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-white/10 rounded-xl p-1">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'calendar' ? 'bg-white text-indigo-600' : 'text-white/80'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode('recommendations')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'recommendations' ? 'bg-white text-indigo-600' : 'text-white/80'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            AI Picks
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Navigation */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for start of month */}
              {Array.from({ length: timeSlots[0]?.date.getDay() || 0 }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {timeSlots.map((slot) => {
                const inRange = isDateInRange(slot.date);
                const isStart = selectedStart?.toDateString() === slot.date.toDateString();
                const isEnd = selectedEnd?.toDateString() === slot.date.toDateString();

                return (
                  <button
                    key={slot.date.toISOString()}
                    onClick={() => handleDateClick(slot)}
                    disabled={!slot.available}
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                      transition-all
                      ${!slot.available ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer'}
                      ${isStart || isEnd ? 'bg-indigo-600 text-white' : ''}
                      ${inRange && !isStart && !isEnd ? 'bg-indigo-100 text-indigo-700' : ''}
                      ${!inRange && slot.available ? 'hover:bg-gray-100' : ''}
                      ${slot.recommended && !inRange ? 'ring-2 ring-green-400 ring-offset-1' : ''}
                    `}
                  >
                    <span className="font-medium">{slot.date.getDate()}</span>
                    {slot.available && slot.discount > 0 && !isStart && !isEnd && (
                      <span className={`text-xs ${inRange ? 'text-indigo-600' : 'text-green-600'}`}>
                        -{slot.discount}%
                      </span>
                    )}
                    {slot.recommended && !inRange && (
                      <Star className="absolute top-0.5 right-0.5 w-3 h-3 text-green-500 fill-green-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-100 rounded border border-green-400" />
                Low demand
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-amber-100 rounded border border-amber-400" />
                Normal
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-100 rounded border border-red-400" />
                High demand
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-green-500 fill-green-500" />
                Recommended
              </span>
            </div>
          </div>
        </>
      ) : (
        /* AI Recommendations */
        <div className="p-4 max-h-80 overflow-y-auto">
          <p className="text-sm text-gray-600 mb-4">
            Based on demand patterns and pricing, here are the best times to book:
          </p>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {rec.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {rec.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded-full text-xs font-medium">
                        Save ${rec.totalSavings}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rec.reason}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600">
                      <Zap className="w-4 h-4" />
                      <span className="font-medium">{rec.confidence}%</span>
                    </div>
                    <span className="text-xs text-gray-500">confidence</span>
                  </div>
                </div>
                <button
                  onClick={() => applyRecommendation(rec)}
                  className="w-full mt-2 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Select These Dates
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {totals && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-600">
                {selectedStart?.toLocaleDateString()} - {selectedEnd?.toLocaleDateString()}
              </p>
              <p className="text-lg font-bold text-gray-900">
                {totals.days} days • ${totals.total} total
              </p>
            </div>
            {totals.savings > 0 && (
              <div className="text-right">
                <p className="text-green-600 font-semibold">You save ${totals.savings}</p>
                <p className="text-xs text-gray-500">Avg {totals.avgDiscount}% off</p>
              </div>
            )}
          </div>
          <button
            onClick={() => onSelectDates(selectedStart!, selectedEnd!, totals.avgDiscount)}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Confirm These Dates
          </button>
        </div>
      )}
    </div>
  );
}
