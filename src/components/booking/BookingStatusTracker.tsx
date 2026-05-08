import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, AlertCircle, Activity } from 'lucide-react';
import type { Booking } from '../../types';

interface BookingStatusTrackerProps {
  booking: Booking;
  isLive?: boolean;
  showLabel?: boolean;
  compact?: boolean;
}

const statusConfig: Record<Booking['status'], { label: string; color: string; bgColor: string; barColor: string; icon: JSX.Element }> = {
  pending: {
    label: 'Pending',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
    barColor: 'bg-amber-500 dark:bg-amber-400',
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: 'Confirmed',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
    barColor: 'bg-blue-500 dark:bg-blue-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  active: {
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
    barColor: 'bg-green-500 dark:bg-green-400',
    icon: <Activity className="w-4 h-4 animate-pulse" />,
  },
  completed: {
    label: 'Completed',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600',
    barColor: 'bg-gray-500 dark:bg-gray-400',
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
    barColor: 'bg-red-500 dark:bg-red-400',
    icon: <AlertCircle className="w-4 h-4" />,
  },
};

const statusSequence: Booking['status'][] = ['pending', 'confirmed', 'active', 'completed'];

function getStatusProgress(status: Booking['status']): number {
  const index = statusSequence.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / statusSequence.length) * 100;
}

export default function BookingStatusTracker({
  booking,
  isLive = false,
  showLabel = true,
  compact = false,
}: BookingStatusTrackerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const config = statusConfig[booking.status];
  const progress = getStatusProgress(booking.status);

  useEffect(() => {
    if (isLive) {
      setIsUpdating(true);
      const timer = setTimeout(() => setIsUpdating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [booking.status, isLive]);

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${config.bgColor} ${config.color} ${isUpdating ? 'animate-pulse' : ''}`}>
        {config.icon}
        {config.label}
        {isLive && <span className="ml-1 text-xs opacity-60">(live)</span>}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${isUpdating ? 'opacity-80' : ''}`}>
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium ${config.bgColor} ${config.color}`}>
          {config.icon}
          <span>{config.label}</span>
          {isLive && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
        </div>
        {booking.payment_status && (
          <div className={`text-xs font-medium px-3 py-1.5 rounded-lg ${
            booking.payment_status === 'paid'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : booking.payment_status === 'refunded'
                ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
          }`}>
            {booking.payment_status === 'paid' ? '💳 Paid' : booking.payment_status === 'refunded' ? '↩️ Refunded' : '⏳ Pending'}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="text-xs text-gray-500 dark:text-gray-400">Progress: {Math.round(progress)}%</div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${config.barColor}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Timeline */}
      {showLabel && (
        <div className="flex justify-between text-xs">
          {statusSequence.map((status) => (
            <div
              key={status}
              className={`flex flex-col items-center gap-1 ${
                statusSequence.indexOf(status) <= statusSequence.indexOf(booking.status) ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  statusSequence.indexOf(status) < statusSequence.indexOf(booking.status)
                    ? 'bg-green-500 text-white'
                    : statusSequence.indexOf(status) === statusSequence.indexOf(booking.status)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                {statusSequence.indexOf(status) < statusSequence.indexOf(booking.status) ? '✓' : statusSequence.indexOf(status) + 1}
              </div>
              <span className="capitalize text-gray-600 dark:text-gray-400">{status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline for cancelled bookings */}
      {booking.status === 'cancelled' && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">❌ This booking was cancelled</p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">Cancelled on {new Date(booking.updated_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}
