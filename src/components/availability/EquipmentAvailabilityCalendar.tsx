import { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, MapPin, DollarSign, Check, X, AlertCircle } from 'lucide-react';
import { getEquipment, getEquipmentAvailability, blockDates, unblockDates } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';

interface EquipmentAvailabilityCalendarProps {
  onBack: () => void;
}

interface BookingSlot {
  date: string;
  status: 'available' | 'booked' | 'maintenance' | 'blocked';
  bookedBy?: string;
  price?: number;
}

interface CalendarEquipment {
  id: string;
  name: string;
  location: string;
  dailyRate: number;
  image: string;
  slots: BookingSlot[];
}

const generateSlots = (baseRate: number): BookingSlot[] => {
  const slots: BookingSlot[] = [];
  const today = new Date();
  for (let i = -15; i < 60; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    // Every date starts available; real booked / maintenance / blocked
    // statuses are merged in from getEquipmentAvailability(). We never
    // fabricate bookings or renter names.
    const dayOfWeek = date.getDay();
    const price = dayOfWeek === 0 || dayOfWeek === 6 ? Math.round(baseRate * 1.15) : baseRate;

    slots.push({ date: dateStr, status: 'available', price });
  }
  return slots;
};

const statusStyles = {
  available: { bg: 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  booked: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  maintenance: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  blocked: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-500 dark:text-gray-400', dot: 'bg-gray-400' },
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function EquipmentAvailabilityCalendar({ onBack }: EquipmentAvailabilityCalendarProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [equipmentList, setEquipmentList] = useState<CalendarEquipment[]>([]);
  const [selected, setSelected] = useState<CalendarEquipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);

  // Load the owner's real equipment. No user (or no listings) => empty state.
  useEffect(() => {
    if (!user) {
      // Clear any equipment from a previous session so it doesn't linger after logout.
      setEquipmentList([]);
      setSelected(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getEquipment({ ownerId: user.id, limit: 10 }).then(({ data }) => {
      if (cancelled) return;
      const items: CalendarEquipment[] = data.map(eq => ({
        id: eq.id,
        name: eq.title,
        location: eq.location || '',
        dailyRate: eq.daily_rate,
        image: eq.images?.[0] || '',
        slots: generateSlots(eq.daily_rate),
      }));
      setEquipmentList(items);
      setSelected(items[0] ?? null);
    }).catch(() => {
      // Surface load failures instead of silently showing an empty-account state.
      if (!cancelled) {
        addToast({
          type: 'error',
          title: 'Could not load your equipment',
          message: 'Please check your connection and try again.',
        });
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user, addToast]);

  // Load real availability slots when selected equipment changes
  const loadAvailability = useCallback(async (equipmentId: string, _dailyRate: number) => {
    try {
      const today = new Date();
      const start = new Date(today); start.setDate(today.getDate() - 15);
      const end = new Date(today); end.setDate(today.getDate() + 60);
      const records = await getEquipmentAvailability(
        equipmentId,
        start.toISOString().split('T')[0],
        end.toISOString().split('T')[0]
      );
      if (records.length > 0) {
        // Build a day-level slot map from date ranges
        const statusMap: Record<string, BookingSlot['status']> = {};
        for (const r of records) {
          const d = new Date(r.start_date);
          const endD = new Date(r.end_date);
          while (d <= endD) {
            const dateStr = d.toISOString().split('T')[0];
            statusMap[dateStr] = r.reason === 'maintenance' ? 'maintenance' : r.reason === 'booked' ? 'booked' : 'blocked';
            d.setDate(d.getDate() + 1);
          }
        }
        // Merge into existing generated slots
        setEquipmentList(prev => prev.map(eq => {
          if (eq.id !== equipmentId) return eq;
          const merged = eq.slots.map(s => statusMap[s.date] ? { ...s, status: statusMap[s.date] } : s);
          return { ...eq, slots: merged };
        }));
        setSelected(prev => {
          if (!prev || prev.id !== equipmentId) return prev;
          const merged = prev.slots.map(s => statusMap[s.date] ? { ...s, status: statusMap[s.date] } : s);
          return { ...prev, slots: merged };
        });
      }
    } catch { /* keep generated slots */ }
  }, []);

  useEffect(() => {
    if (selected) {
      loadAvailability(selected.id, selected.dailyRate);
    }
    // Depend on primitives, not the `selected` object, since loadAvailability
    // replaces it with a new reference (which would otherwise loop).
  }, [selected?.id, selected?.dailyRate, loadAvailability]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const slotMap = useMemo(() => {
    const map: Record<string, BookingSlot> = {};
    selected?.slots.forEach((s) => { map[s.date] = s; });
    return map;
  }, [selected]);

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDay, daysInMonth]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const getDateStr = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isInRange = (dateStr: string) => {
    if (!selectionStart || !selectionEnd) return false;
    return dateStr >= selectionStart && dateStr <= selectionEnd;
  };

  const handleDateClick = (day: number) => {
    const dateStr = getDateStr(day);
    const slot = slotMap[dateStr];
    if (slot && slot.status !== 'available') {
      setSelectedDate(dateStr);
      return;
    }

    if (!selectionStart || (selectionStart && selectionEnd)) {
      setSelectionStart(dateStr);
      setSelectionEnd(null);
      setSelectedDate(dateStr);
    } else {
      if (dateStr < selectionStart) {
        setSelectionEnd(selectionStart);
        setSelectionStart(dateStr);
      } else {
        setSelectionEnd(dateStr);
      }
      setSelectedDate(dateStr);
    }
  };

  const selectedSlot = selectedDate ? slotMap[selectedDate] : null;

  const rangeAvailable = useMemo(() => {
    if (!selectionStart || !selectionEnd || !selected) return true;
    for (const slot of selected.slots) {
      if (slot.date >= selectionStart && slot.date <= selectionEnd && slot.status !== 'available') {
        return false;
      }
    }
    return true;
  }, [selectionStart, selectionEnd, selected]);

  const rangeDays = selectionStart && selectionEnd
    ? Math.ceil((new Date(selectionEnd).getTime() - new Date(selectionStart).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const monthStats = useMemo(() => {
    let available = 0, booked = 0, maintenance = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const slot = slotMap[getDateStr(d)];
      if (!slot || slot.status === 'available') available++;
      else if (slot.status === 'booked') booked++;
      else if (slot.status === 'maintenance') maintenance++;
    }
    return { available, booked, maintenance };
  }, [slotMap, daysInMonth, year, month]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Availability Calendar</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Check equipment availability and plan your rentals</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400" role="status" aria-label="Loading">
            <Clock className="w-6 h-6 animate-spin" />
          </div>
        ) : !selected ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {user ? 'No equipment to manage yet' : 'Sign in to manage availability'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {user
                ? 'List a piece of equipment to set its availability and block out dates here.'
                : 'Sign in and list equipment to manage its rental calendar.'}
            </p>
          </div>
        ) : (
          <>
        {/* Equipment Selector */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {equipmentList.map((eq) => (
            <button
              key={eq.id}
              onClick={() => { setSelected(eq); setSelectionStart(null); setSelectionEnd(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap flex-shrink-0 ${
                selected.id === eq.id ? 'border-teal-500 bg-teal-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
              }`}
            >
              <img src={eq.image} alt={eq.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="text-left">
                <p className="font-semibold text-sm">{eq.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">${eq.dailyRate}/day</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Previous month">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold dark:text-white">{MONTHS[month]} {year}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" aria-label="Next month">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{day}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dateStr = getDateStr(day);
                  const slot = slotMap[dateStr];
                  const status = slot?.status || 'available';
                  const style = statusStyles[status];
                  const isToday = dateStr === new Date().toISOString().split('T')[0];
                  const inRange = isInRange(dateStr);
                  const isStart = dateStr === selectionStart;
                  const isEnd = dateStr === selectionEnd;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateClick(day)}
                      className={`relative p-2 rounded-lg text-center transition-all min-h-[52px] ${style.bg} ${
                        isStart || isEnd ? 'ring-2 ring-teal-500 ring-offset-1' : ''
                      } ${inRange && status === 'available' ? 'bg-teal-100' : ''} ${
                        isToday ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                      }`}
                    >
                      <span className={`text-sm font-medium ${style.text}`}>{day}</span>
                      {slot?.price && status === 'available' && (
                        <p className="text-[10px] text-gray-400 mt-0.5">${slot.price}</p>
                      )}
                      {status === 'booked' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 mx-auto mt-0.5" />}
                      {status === 'maintenance' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mx-auto mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                {Object.entries(statusStyles).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className={`w-3 h-3 rounded-full ${val.dot}`} />
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Month Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Month Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Check className="w-4 h-4 text-green-500" /> Available
                  </span>
                  <span className="font-bold text-green-600">{monthStats.available} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <X className="w-4 h-4 text-red-500" /> Booked
                  </span>
                  <span className="font-bold text-red-600">{monthStats.booked} days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <AlertCircle className="w-4 h-4 text-yellow-500" /> Maintenance
                  </span>
                  <span className="font-bold text-yellow-600">{monthStats.maintenance} days</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(monthStats.available / daysInMonth) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center">{((monthStats.available / daysInMonth) * 100).toFixed(0)}% availability this month</p>
              </div>
            </div>

            {/* Selected Date Info */}
            {selectedSlot && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  {new Date(selectedDate! + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusStyles[selectedSlot.status].bg} ${statusStyles[selectedSlot.status].text}`}>
                  <div className={`w-2 h-2 rounded-full ${statusStyles[selectedSlot.status].dot}`} />
                  {selectedSlot.status.charAt(0).toUpperCase() + selectedSlot.status.slice(1)}
                </div>
                {selectedSlot.bookedBy && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Booked by: {selectedSlot.bookedBy}</p>
                )}
                {selectedSlot.status === 'blocked' && (
                  <button
                    className="mt-3 text-xs text-teal-600 underline"
                    onClick={async () => {
                      if (!selectedDate) return;
                      try {
                        await unblockDates(selectedDate);
                        await loadAvailability(selected.id, selected.dailyRate);
                        setSelectedDate(null);
                      } catch {
                        addToast({
                          type: 'error',
                          title: 'Unblock failed',
                          message: 'Could not unblock this date. Please try again.',
                        });
                      }
                    }}
                  >
                    Unblock this date
                  </button>
                )}
                {selectedSlot.price && selectedSlot.status === 'available' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> Rate: ${selectedSlot.price}/day
                  </p>
                )}
              </div>
            )}

            {/* Selection Summary */}
            {selectionStart && selectionEnd && (
              <div className={`rounded-2xl shadow-sm border p-6 ${rangeAvailable ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Booking Selection</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Start</span>
                    <span className="font-medium dark:text-white">{new Date(selectionStart + 'T12:00:00').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">End</span>
                    <span className="font-medium dark:text-white">{new Date(selectionEnd + 'T12:00:00').toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Duration</span>
                    <span className="font-medium dark:text-white">{rangeDays} day{rangeDays !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-500 dark:text-gray-400">Est. Total</span>
                    <span className="font-bold text-teal-600">${(rangeDays * selected.dailyRate).toLocaleString()}</span>
                  </div>
                </div>
                {rangeAvailable ? (
                  <button
                    className="w-full mt-4 py-2.5 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors"
                    onClick={async () => {
                      if (!selectionStart || !selectionEnd) return;
                      try {
                        await blockDates(selected.id, selectionStart, selectionEnd, 'unavailable');
                        await loadAvailability(selected.id, selected.dailyRate);
                        setSelectionStart(null); setSelectionEnd(null);
                      } catch {
                        addToast({
                          type: 'error',
                          title: 'Block failed',
                          message: 'Could not block these dates. Please try again.',
                        });
                      }
                    }}
                  >
                    Block {rangeDays} Days
                  </button>
                ) : (
                  <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-xs text-red-700 dark:text-red-300 text-center">
                    Some dates in this range are unavailable
                  </div>
                )}
              </div>
            )}

            {/* Equipment Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img src={selected.image} alt={selected.name} className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {selected.location}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <DollarSign className="w-3 h-3" /> {selected.dailyRate}/day
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" /> Min 1 day rental
                </p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
