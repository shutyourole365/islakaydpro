import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';

interface BookingCalendarProps {
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onDateSelect: (start: Date | null, end: Date | null) => void;
  minRentalDays?: number;
  maxRentalDays?: number;
  unavailableDates?: Date[];
  dailyRate: number;
  className?: string;
}

export default function BookingCalendar({
  selectedStart,
  selectedEnd,
  onDateSelect,
  minRentalDays = 1,
  maxRentalDays = 90,
  unavailableDates = [],
  dailyRate,
  className = '',
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(
      (unavailable) => unavailable.toDateString() === date.toDateString()
    );
  };

  const isDateDisabled = (date: Date) => {
    if (date < today) return true;
    if (isDateUnavailable(date)) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStart) return false;
    const endDate = selectedEnd || hoverDate;
    if (!endDate) return false;
    return date > selectedStart && date < endDate;
  };

  const isDateSelected = (date: Date) => {
    if (selectedStart && date.toDateString() === selectedStart.toDateString()) return true;
    if (selectedEnd && date.toDateString() === selectedEnd.toDateString()) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;

    if (!selectedStart || (selectedStart && selectedEnd)) {
      onDateSelect(date, null);
    } else {
      if (date < selectedStart) {
        onDateSelect(date, null);
      } else {
        const daysDiff = Math.ceil(
          (date.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

        if (daysDiff < minRentalDays) {
          return;
        }
        if (daysDiff > maxRentalDays) {
          return;
        }

        let hasUnavailable = false;
        const checkDate = new Date(selectedStart);
        while (checkDate <= date) {
          if (isDateUnavailable(checkDate)) {
            hasUnavailable = true;
            break;
          }
          checkDate.setDate(checkDate.getDate() + 1);
        }

        if (hasUnavailable) {
          onDateSelect(date, null);
        } else {
          onDateSelect(selectedStart, date);
        }
      }
    }
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(prev);
    }
  };

  const rentalDays = useMemo(() => {
    if (!selectedStart || !selectedEnd) return 0;
    return Math.ceil(
      (selectedEnd.getTime() - selectedStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
  }, [selectedStart, selectedEnd]);

  const totalPrice = rentalDays * dailyRate;

  const clearDates = () => {
    onDateSelect(null, null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentMonth <= new Date(today.getFullYear(), today.getMonth(), 1)}
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const disabled = isDateDisabled(date);
            const selected = isDateSelected(date);
            const inRange = isDateInRange(date);
            const isToday = date.toDateString() === today.toDateString();

            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={disabled}
                className={`
                  aspect-square flex items-center justify-center rounded-full text-sm font-medium
                  transition-all duration-200
                  ${disabled ? 'text-gray-300 cursor-not-allowed line-through' : 'cursor-pointer'}
                  ${selected ? 'bg-teal-500 text-white shadow-lg' : ''}
                  ${inRange && !selected ? 'bg-teal-100 text-teal-700' : ''}
                  ${!disabled && !selected && !inRange ? 'hover:bg-gray-100 text-gray-900' : ''}
                  ${isToday && !selected ? 'ring-2 ring-teal-500 ring-offset-2' : ''}
                `}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {(selectedStart || selectedEnd) && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-teal-500" />
              <div>
                {selectedStart && (
                  <span className="text-sm font-medium text-gray-900">
                    {selectedStart.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
                {selectedEnd && (
                  <>
                    <span className="text-gray-400 mx-2">-</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedEnd.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={clearDates}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {rentalDays > 0 && (
            <div className="mt-3 p-3 bg-teal-50 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  ${dailyRate} x {rentalDays} day{rentalDays > 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-teal-700">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-teal-100" />
            <span>In range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-gray-200 line-through" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
