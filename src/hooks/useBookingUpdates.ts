import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

interface UseBookingUpdatesOptions {
  onUpdate?: (booking: Booking) => void;
  onStatusChange?: (bookingId: string, oldStatus: string, newStatus: string) => void;
}

export function useBookingUpdates(userId: string | null, options: UseBookingUpdatesOptions = {}) {
  const bookingStatusCache = useRef<Record<string, string>>({});
  const onUpdateRef = useRef(options.onUpdate);
  const onStatusChangeRef = useRef(options.onStatusChange);

  // Keep refs current on every render without triggering resubscription
  useEffect(() => {
    onUpdateRef.current = options.onUpdate;
    onStatusChangeRef.current = options.onStatusChange;
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`booking-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `renter_id=eq.${userId}`,
        },
        (payload) => {
          const booking = payload.new as Booking;

          const oldStatus = bookingStatusCache.current[booking.id];
          if (oldStatus && oldStatus !== booking.status) {
            onStatusChangeRef.current?.(booking.id, oldStatus, booking.status);
          }

          bookingStatusCache.current[booking.id] = booking.status;
          onUpdateRef.current?.(booking);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);
}

export function useOwnerBookingUpdates(userId: string | null, options: UseBookingUpdatesOptions = {}) {
  const bookingStatusCache = useRef<Record<string, string>>({});
  const onUpdateRef = useRef(options.onUpdate);
  const onStatusChangeRef = useRef(options.onStatusChange);

  useEffect(() => {
    onUpdateRef.current = options.onUpdate;
    onStatusChangeRef.current = options.onStatusChange;
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`owner-booking-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `owner_id=eq.${userId}`,
        },
        (payload) => {
          const booking = payload.new as Booking;

          const oldStatus = bookingStatusCache.current[booking.id];
          if (oldStatus && oldStatus !== booking.status) {
            onStatusChangeRef.current?.(booking.id, oldStatus, booking.status);
          }

          bookingStatusCache.current[booking.id] = booking.status;
          onUpdateRef.current?.(booking);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);
}
