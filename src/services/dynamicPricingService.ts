/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface DynamicPrice {
  id: string;
  equipmentId: string;
  baseDailyRate: number;
  priceMultiplier: number;
  minDailyRate: number;
  maxDailyRate: number;
  effectiveFrom: string;
  effectiveUntil: string | null;
  reason: string;
  demandLevel: 'low' | 'medium' | 'high' | 'very_high';
  createdAt: string;
}

export interface PricingRule {
  id: string;
  equipmentId: string;
  ruleType: 'seasonal' | 'demand_based' | 'duration_discount' | 'advance_booking';
  condition: Record<string, any>;
  priceMultiplier: number;
  enabled: boolean;
  createdAt: string;
}

export interface PricingMetrics {
  equipmentId: string;
  currentDemand: number;
  rentalVelocity: number;
  occupancyRate: number;
  recommendedPriceMultiplier: number;
  totalRevenueLast30Days: number;
  averageDailyRate: number;
  peakDates: string[];
}

export async function createDynamicPrice(
  equipmentId: string,
  priceData: Omit<DynamicPrice, 'id' | 'createdAt' | 'equipmentId'>
): Promise<DynamicPrice> {
  const { data, error } = await supabase
    .from('dynamic_prices')
    .insert({
      equipment_id: equipmentId,
      base_daily_rate: priceData.baseDailyRate,
      price_multiplier: priceData.priceMultiplier,
      min_daily_rate: priceData.minDailyRate,
      max_daily_rate: priceData.maxDailyRate,
      effective_from: priceData.effectiveFrom,
      effective_until: priceData.effectiveUntil,
      reason: priceData.reason,
      demand_level: priceData.demandLevel,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    equipmentId: data.equipment_id,
    baseDailyRate: data.base_daily_rate,
    priceMultiplier: data.price_multiplier,
    minDailyRate: data.min_daily_rate,
    maxDailyRate: data.max_daily_rate,
    effectiveFrom: data.effective_from,
    effectiveUntil: data.effective_until,
    reason: data.reason,
    demandLevel: data.demand_level,
    createdAt: data.created_at,
  };
}

export async function getDynamicPrices(equipmentId: string): Promise<DynamicPrice[]> {
  const { data, error } = await supabase
    .from('dynamic_prices')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('effective_from', { ascending: false });

  if (error) throw error;

  return (data || []).map(d => ({
    id: d.id,
    equipmentId: d.equipment_id,
    baseDailyRate: d.base_daily_rate,
    priceMultiplier: d.price_multiplier,
    minDailyRate: d.min_daily_rate,
    maxDailyRate: d.max_daily_rate,
    effectiveFrom: d.effective_from,
    effectiveUntil: d.effective_until,
    reason: d.reason,
    demandLevel: d.demand_level,
    createdAt: d.created_at,
  }));
}

export async function updateDynamicPrice(
  priceId: string,
  updates: Partial<Omit<DynamicPrice, 'id' | 'createdAt' | 'equipmentId'>>
): Promise<DynamicPrice> {
  const updateData: Record<string, any> = {};

  if (updates.priceMultiplier !== undefined) updateData.price_multiplier = updates.priceMultiplier;
  if (updates.minDailyRate !== undefined) updateData.min_daily_rate = updates.minDailyRate;
  if (updates.maxDailyRate !== undefined) updateData.max_daily_rate = updates.maxDailyRate;
  if (updates.effectiveUntil !== undefined) updateData.effective_until = updates.effectiveUntil;
  if (updates.reason !== undefined) updateData.reason = updates.reason;
  if (updates.demandLevel !== undefined) updateData.demand_level = updates.demandLevel;

  const { data, error } = await supabase
    .from('dynamic_prices')
    .update(updateData)
    .eq('id', priceId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    equipmentId: data.equipment_id,
    baseDailyRate: data.base_daily_rate,
    priceMultiplier: data.price_multiplier,
    minDailyRate: data.min_daily_rate,
    maxDailyRate: data.max_daily_rate,
    effectiveFrom: data.effective_from,
    effectiveUntil: data.effective_until,
    reason: data.reason,
    demandLevel: data.demand_level,
    createdAt: data.created_at,
  };
}

export async function deleteDynamicPrice(priceId: string): Promise<void> {
  const { error } = await supabase
    .from('dynamic_prices')
    .delete()
    .eq('id', priceId);

  if (error) throw error;
}

export async function createPricingRule(
  equipmentId: string,
  rule: Omit<PricingRule, 'id' | 'createdAt' | 'equipmentId'>
): Promise<PricingRule> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .insert({
      equipment_id: equipmentId,
      rule_type: rule.ruleType,
      condition: rule.condition,
      price_multiplier: rule.priceMultiplier,
      enabled: rule.enabled,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    equipmentId: data.equipment_id,
    ruleType: data.rule_type,
    condition: data.condition,
    priceMultiplier: data.price_multiplier,
    enabled: data.enabled,
    createdAt: data.created_at,
  };
}

export async function getPricingRules(equipmentId: string): Promise<PricingRule[]> {
  const { data, error } = await supabase
    .from('pricing_rules')
    .select('*')
    .eq('equipment_id', equipmentId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    equipmentId: r.equipment_id,
    ruleType: r.rule_type,
    condition: r.condition,
    priceMultiplier: r.price_multiplier,
    enabled: r.enabled,
    createdAt: r.created_at,
  }));
}

export async function updatePricingRule(
  ruleId: string,
  updates: Partial<Omit<PricingRule, 'id' | 'createdAt' | 'equipmentId'>>
): Promise<PricingRule> {
  const updateData: Record<string, any> = {};

  if (updates.priceMultiplier !== undefined) updateData.price_multiplier = updates.priceMultiplier;
  if (updates.enabled !== undefined) updateData.enabled = updates.enabled;
  if (updates.condition !== undefined) updateData.condition = updates.condition;

  const { data, error } = await supabase
    .from('pricing_rules')
    .update(updateData)
    .eq('id', ruleId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    equipmentId: data.equipment_id,
    ruleType: data.rule_type,
    condition: data.condition,
    priceMultiplier: data.price_multiplier,
    enabled: data.enabled,
    createdAt: data.created_at,
  };
}

export async function deletePricingRule(ruleId: string): Promise<void> {
  const { error } = await supabase
    .from('pricing_rules')
    .delete()
    .eq('id', ruleId);

  if (error) throw error;
}

export async function calculateOptimalPrice(equipmentId: string): Promise<number> {
  const { data: equipment, error: equipError } = await supabase
    .from('equipment')
    .select('daily_rate, rating, rental_count')
    .eq('id', equipmentId)
    .single();

  if (equipError) throw equipError;

  const { data: bookings, error: bookError } = await supabase
    .from('bookings')
    .select('*')
    .eq('equipment_id', equipmentId)
    .gte('start_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  if (bookError) throw bookError;

  const occupancyDays = new Set();
  (bookings || []).forEach(booking => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i < days; i++) {
      occupancyDays.add(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).toDateString());
    }
  });

  const occupancyRate = occupancyDays.size / 30;
  let multiplier = 1.0;

  if (occupancyRate > 0.85) {
    multiplier = 1.4;
  } else if (occupancyRate > 0.7) {
    multiplier = 1.25;
  } else if (occupancyRate > 0.5) {
    multiplier = 1.1;
  } else if (occupancyRate < 0.2) {
    multiplier = 0.85;
  }

  const ratingBonus = equipment.rating >= 4.5 ? 1.05 : 1.0;
  const finalMultiplier = multiplier * ratingBonus;

  return Math.round(equipment.daily_rate * finalMultiplier * 100) / 100;
}

export async function getPricingMetrics(equipmentId: string): Promise<PricingMetrics> {
  const { data: equipment, error: equipError } = await supabase
    .from('equipment')
    .select('daily_rate, rating, rental_count')
    .eq('id', equipmentId)
    .single();

  if (equipError) throw equipError;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error: bookError } = await supabase
    .from('bookings')
    .select('*')
    .eq('equipment_id', equipmentId)
    .gte('start_date', thirtyDaysAgo);

  if (bookError) throw bookError;

  const occupancyDays = new Set<string>();
  let totalRevenue = 0;
  const dateBookingCounts: Record<string, number> = {};

  (bookings || []).forEach(booking => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < days; i++) {
      const dateStr = new Date(start.getTime() + i * 24 * 60 * 60 * 1000).toDateString();
      occupancyDays.add(dateStr);
      dateBookingCounts[dateStr] = (dateBookingCounts[dateStr] || 0) + 1;
    }

    totalRevenue += booking.total_price || 0;
  });

  const occupancyRate = occupancyDays.size / 30;
  const rentalVelocity = (bookings?.length || 0) / 30;
  const peakDates = Object.entries(dateBookingCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([date]) => date);

  const optimalMultiplier = occupancyRate > 0.85 ? 1.4 : occupancyRate > 0.7 ? 1.25 : 1.0;
  const averageDailyRate =
    bookings && bookings.length > 0
      ? Math.round((totalRevenue / (bookings.length || 1)) * 100) / 100
      : equipment.daily_rate;

  return {
    equipmentId,
    currentDemand: Math.round(occupancyRate * 100),
    rentalVelocity: Math.round(rentalVelocity * 100) / 100,
    occupancyRate: Math.round(occupancyRate * 100),
    recommendedPriceMultiplier: optimalMultiplier,
    totalRevenueLast30Days: totalRevenue,
    averageDailyRate,
    peakDates,
  };
}
