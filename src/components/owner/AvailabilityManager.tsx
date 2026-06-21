import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trash2,
  Plus,
  Info,
  Loader2,
} from 'lucide-react';
import {
  getEquipmentAvailability,
  blockDates,
  unblockDates,
  getBookings,
} from '../../services/database';
import type { Equipment, EquipmentAvailability, Booking } from '../../types';

interface AvailabilityManagerProps {
  equipment: Equipment;
  onClose: () => void;
}

type BlockReason = 'maintenance' | 'unavailable';

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function AvailabilityManager({ equipment, onClose }: AvailabilityManagerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [blockedRanges, setBlockedRanges] = useState<EquipmentAvailability[]>([]);
  const [bookedRanges, setBookedRanges] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectStart, setSelectStart] = useState<Date | null>(null);
  const [selectEnd, setSelectEnd] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [reason, setReason] = useState<BlockReason>('maintenance');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [availability, bookings] = await Promise.all([
        getEquipmentAvailability(equipment.id),
        getBookings({ equipmentId: equipment.id }),
      ]);
      setBlockedRanges(availability.filter(a => a.reason !== 'booked'));
      setBookedRanges(bookings.filter(b => b.status === 'confirmed' || b.status === 'active'));
    } catch {
      setError('Failed to load availability data');
    } finally {
      setIsLoading(false);
    }
  }, [equipment.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const daysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days: Date[] = [];
    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      days.push(new Date(year, month, -(firstDay - i - 1)));
    }
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateBlocked = (date: Date) => {
    const str = toLocalDateStr(date);
    return blockedRanges.some(r => str >= r.start_date && str <= r.end_date);
  };

  const isDateBooked = (date: Date) => {
    const str = toLocalDateStr(date);
    return bookedRanges.some(b => str >= b.start_date && str <= b.end_date);
  };

  const isDateInSelection = (date: Date) => {
    const start = selectStart;
    const end = selectEnd || hoverDate;
    if (!start || !end) return false;
    const lo = start <= end ? start : end;
    const hi = start <= end ? end : start;
    return date >= lo && date <= hi;
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();
  const isPast = (date: Date) => date < today;

  const handleDateClick = (date: Date) => {
    if (!isCurrentMonth(date) || isPast(date) || isDateBooked(date)) return;

    if (isDateBlocked(date)) {
      const str = toLocalDateStr(date);
      const range = blockedRanges.find(r => str >= r.start_date && str <= r.end_date);
      if (range) handleUnblock(range.id);
      return;
    }

    if (!selectStart || selectEnd) {
      setSelectStart(date);
      setSelectEnd(null);
    } else {
      if (isSameDay(date, selectStart)) {
        setSelectStart(null);
        setSelectEnd(null);
      } else {
        setSelectEnd(date);
      }
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockDates(id);
      setBlockedRanges(prev => prev.filter(r => r.id !== id));
    } catch {
      setError('Failed to unblock dates');
    }
  };

  const handleBlock = async () => {
    if (!selectStart) return;
    const start = selectStart <= (selectEnd || selectStart) ? selectStart : selectEnd!;
    const end = selectStart <= (selectEnd || selectStart) ? (selectEnd || selectStart) : selectStart;

    setIsSaving(true);
    setError('');
    try {
      const newBlock = await blockDates(
        equipment.id,
        toLocalDateStr(start),
        toLocalDateStr(end),
        reason,
      );
      setBlockedRanges(prev => [...prev, newBlock]);
      setSelectStart(null);
      setSelectEnd(null);
    } catch {
      setError('Failed to block dates');
    } finally {
      setIsSaving(false);
    }
  };

  const getDayClass = (date: Date) => {
    const inCurrentMonth = isCurrentMonth(date);
    const past = isPast(date);
    const booked = isDateBooked(date);
    const blocked = isDateBlocked(date);
    const inSelection = isDateInSelection(date);
    const isToday = isSameDay(date, today);

    if (!inCurrentMonth) return 'text-gray-300 dark:text-gray-600 cursor-default';
    if (past) return 'text-gray-300 dark:text-gray-600 cursor-default';
    if (booked) return 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default rounded-lg';
    if (blocked) return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 cursor-pointer rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors';
    if (inSelection) return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg';
    if (isToday) return 'ring-2 ring-teal-500 text-teal-600 dark:text-teal-400 font-bold cursor-pointer rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20';
    return 'text-gray-700 dark:text-gray-200 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';
  };

  const days = daysInMonth();
  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Manage Availability</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[280px]">{equipment.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            </div>
          ) : (
            <>
              {/* Calendar */}
              <div className="p-6">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{monthLabel}</h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, i) => (
                    <button
                      key={i}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => selectStart && !selectEnd && setHoverDate(date)}
                      onMouseLeave={() => setHoverDate(null)}
                      disabled={!isCurrentMonth(date) || isPast(date) || isDateBooked(date)}
                      className={`aspect-square flex items-center justify-center text-sm font-medium transition-colors ${getDayClass(date)}`}
                    >
                      {isCurrentMonth(date) ? date.getDate() : ''}
                    </button>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-teal-200 dark:bg-teal-900/50" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Blocked (click to unblock)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Booked</span>
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Click a date to start selecting, click again to set the end date, then choose a reason and block. Click a red date to unblock it.
                  </p>
                </div>
              </div>

              {/* Block panel */}
              {selectStart && (
                <div className="mx-6 mb-6 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-2xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Block Dates</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {selectEnd
                      ? `${formatDate(toLocalDateStr(selectStart <= selectEnd ? selectStart : selectEnd))} → ${formatDate(toLocalDateStr(selectStart <= selectEnd ? selectEnd : selectStart))}`
                      : `Start: ${formatDate(toLocalDateStr(selectStart))} — click another date to set end`
                    }
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Reason</label>
                    <div className="flex gap-2">
                      {(['maintenance', 'unavailable'] as BlockReason[]).map(r => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors capitalize ${
                            reason === r
                              ? 'bg-teal-500 border-teal-500 text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-teal-400'
                          }`}
                        >
                          {r === 'maintenance' ? 'Maintenance' : 'Not Available'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectStart(null); setSelectEnd(null); setError(''); }}
                      className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBlock}
                      disabled={!selectEnd || isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Block Dates
                    </button>
                  </div>
                </div>
              )}

              {/* Blocked ranges list */}
              {blockedRanges.length > 0 && (
                <div className="px-6 pb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Blocked Periods</h4>
                  <div className="space-y-2">
                    {blockedRanges
                      .sort((a, b) => a.start_date.localeCompare(b.start_date))
                      .map(range => (
                        <div
                          key={range.id}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(range.start_date)}
                              {range.start_date !== range.end_date && ` → ${formatDate(range.end_date)}`}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                              {range.reason === 'maintenance' ? 'Maintenance' : 'Not Available'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUnblock(range.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            aria-label="Remove block"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {blockedRanges.length === 0 && !selectStart && (
                <div className="px-6 pb-6 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No blocked periods. Click dates on the calendar to block them.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
