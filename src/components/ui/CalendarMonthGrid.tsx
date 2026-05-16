import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CalendarEventColor = 'red' | 'amber' | 'green' | 'blue' | 'gray' | 'purple';

export interface CalendarEvent {
  id: string;
  date: Date;
  label: string;
  color?: CalendarEventColor;
  meta?: string;
}

interface CalendarMonthGridProps {
  events: CalendarEvent[];
  initialMonth?: Date;
  onEventClick?: (id: string) => void;
  emptyMessage?: string;
  className?: string;
}

const COLOR_CLASSES: Record<CalendarEventColor, string> = {
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarMonthGrid({
  events,
  initialMonth,
  onEventClick,
  emptyMessage = 'No events this month.',
  className = '',
}: CalendarMonthGridProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const base = initialMonth ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const monthGrid = useMemo<Array<Date | null>>(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Array<Date | null> = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo<Map<string, CalendarEvent[]>>(() => {
    const map = new Map<string, CalendarEvent[]>();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    for (const ev of events) {
      if (ev.date.getFullYear() !== year || ev.date.getMonth() !== month) continue;
      const key = String(ev.date.getDate());
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events, currentMonth]);

  const monthEventCount = useMemo(
    () => Array.from(eventsByDay.values()).reduce((sum, list) => sum + list.length, 0),
    [eventsByDay]
  );

  const today = new Date();
  const monthLabel = currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const goPrev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const goNext = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous month"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="px-3 py-1 text-sm rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next month"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{monthLabel}</h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">{monthEventCount} event{monthEventCount === 1 ? '' : 's'}</div>
      </div>

      <div className="grid grid-cols-7 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
        {WEEKDAYS.map((label) => (
          <div key={label} className="px-2 py-2 text-center uppercase tracking-wide">{label}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthGrid.map((date, idx) => {
          if (!date) {
            return <div key={`pad-${idx}`} className="h-24 sm:h-28 border-t border-l border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20" />;
          }
          const dayEvents = eventsByDay.get(String(date.getDate())) ?? [];
          const isToday = sameDay(date, today);
          return (
            <div
              key={date.toISOString()}
              className={`h-24 sm:h-28 border-t border-l border-gray-100 dark:border-gray-700 p-1.5 overflow-hidden flex flex-col ${
                isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-1 overflow-y-auto pr-0.5">
                {dayEvents.slice(0, 3).map((ev) => {
                  const tone = COLOR_CLASSES[ev.color ?? 'blue'];
                  const Tag = onEventClick ? 'button' : 'div';
                  return (
                    <Tag
                      key={ev.id}
                      type={onEventClick ? 'button' : undefined}
                      onClick={onEventClick ? () => onEventClick(ev.id) : undefined}
                      title={ev.meta ? `${ev.label} · ${ev.meta}` : ev.label}
                      className={`w-full text-left truncate px-1.5 py-0.5 rounded border text-[11px] font-medium ${tone} ${onEventClick ? 'hover:opacity-90 cursor-pointer' : ''}`}
                    >
                      {ev.label}
                    </Tag>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {monthEventCount === 0 && (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
