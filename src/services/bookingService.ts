/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface EquipmentBundle {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  equipmentIds: string[];
  bundleDiscountPercent: number;
  createdAt: string;
}

export interface RecurringBooking {
  id: string;
  bookingId: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  nextBookingDate: string;
  autoRenew: boolean;
  endDate: string | null;
  createdAt: string;
}

export async function createBundle(
  ownerId: string,
  data: Omit<EquipmentBundle, 'id' | 'ownerId' | 'createdAt'>
): Promise<EquipmentBundle> {
  const { data: bundle, error } = await supabase
    .from('equipment_bundles')
    .insert([{
      owner_id: ownerId,
      name: data.name,
      description: data.description,
      equipment_ids: data.equipmentIds,
      bundle_discount_percent: data.bundleDiscountPercent,
    }])
    .select()
    .single();

  if (error) throw error;
  return bundle as EquipmentBundle;
}

export async function getBundles(ownerId: string): Promise<EquipmentBundle[]> {
  const { data, error } = await supabase
    .from('equipment_bundles')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EquipmentBundle[];
}

export async function deleteBundle(id: string): Promise<void> {
  const { error } = await supabase
    .from('equipment_bundles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getRecurringBookings(userId: string): Promise<RecurringBooking[]> {
  const { data, error } = await supabase
    .from('recurring_bookings')
    .select(`
      *,
      booking:booking_id(
        owner_id
      )
    `)
    .eq('booking.owner_id', userId);

  if (error) throw error;
  return data as RecurringBooking[];
}

export async function updateRecurringBooking(
  id: string,
  data: Partial<Omit<RecurringBooking, 'id' | 'createdAt'>>
): Promise<RecurringBooking> {
  const { data: recurring, error } = await supabase
    .from('recurring_bookings')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return recurring as RecurringBooking;
}

export async function calculateBundlePrice(
  equipmentIds: string[],
  discountPercent: number
): Promise<number> {
  const { data, error } = await supabase
    .from('equipment')
    .select('daily_rate')
    .in('id', equipmentIds);

  if (error) throw error;

  const basePrice = (data || []).reduce((sum: number, eq: any) => sum + (eq.daily_rate || 0), 0);
  const discount = basePrice * (discountPercent / 100);
  return basePrice - discount;
}

export async function getNextRecurringBookings(
  userId: string,
  daysAhead: number = 30
): Promise<RecurringBooking[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('recurring_bookings')
    .select(`
      *,
      booking:booking_id(
        owner_id
      )
    `)
    .eq('booking.owner_id', userId)
    .lte('next_booking_date', futureDate.toISOString())
    .order('next_booking_date', { ascending: true });

  if (error) throw error;
  return data as RecurringBooking[];
}

export function getNextOccurrenceDate(
  currentDate: string,
  frequency: 'weekly' | 'monthly' | 'yearly'
): string {
  const date = new Date(currentDate);

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.toISOString();
}
