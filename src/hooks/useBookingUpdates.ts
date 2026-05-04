import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

interface UseBookingUpdatesOptions {
  onUpdate?: (booking: Booking) => void;
  onStatusChange?: (bookingId: string, oldStatus: string, newStatus: string) => void;
}

export function useBookingUpdates(userId: string | null, options: UseBookingUpdatesOptions = {}) {
  const { onUpdate, onStatusChange } = options;
  const bookingStatusCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;

    // Subscribe to booking updates for this user's bookings
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

          // Detect status changes
          const oldStatus = bookingStatusCache.current[booking.id];
          if (oldStatus && oldStatus !== booking.status) {
            onStatusChange?.(booking.id, oldStatus, booking.status);
          }

          // Cache the current status
          bookingStatusCache.current[booking.id] = booking.status;

          // Notify about the update
          onUpdate?.(booking);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, onUpdate, onStatusChange]);
}

export function useOwnerBookingUpdates(userId: string | null, options: UseBookingUpdatesOptions = {}) {
  const { onUpdate, onStatusChange } = options;
  const bookingStatusCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;

    // Subscribe to booking updates where this user is the owner
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

          // Detect status changes
          const oldStatus = bookingStatusCache.current[booking.id];
          if (oldStatus && oldStatus !== booking.status) {
            onStatusChange?.(booking.id, oldStatus, booking.status);
          }

          // Cache the current status
          bookingStatusCache.current[booking.id] = booking.status;

          // Notify about the update
          onUpdate?.(booking);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, onUpdate, onStatusChange]);
}
