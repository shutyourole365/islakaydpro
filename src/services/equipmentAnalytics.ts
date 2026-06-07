import { supabase } from '../lib/supabase';

export interface EquipmentTrend {
  equipmentId: string;
  name: string;
  totalRentals: number;
  totalRevenue: number;
  averageRating: number;
  trend: 'up' | 'down' | 'stable';
  utilization: number;
}

export interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  rentals: number;
}

export interface UserSegment {
  segment: string;
  count: number;
  totalSpent: number;
  averageSpent: number;
  retention: number;
}

export async function getEquipmentTrends(userId: string, days: number = 30): Promise<EquipmentTrend[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      equipment:equipment_id(
        id,
        name,
        category
      )
    `
    )
    .gte('created_at', startDate.toISOString())
    .eq('owner_id', userId);

  if (error) throw error;

  const trends: Record<string, EquipmentTrend> = {};

  bookings?.forEach((booking: any) => {
    const eqId = booking.equipment_id;
    if (!trends[eqId]) {
      trends[eqId] = {
        equipmentId: eqId,
        name: booking.equipment?.name || 'Unknown',
        totalRentals: 0,
        totalRevenue: 0,
        averageRating: 0,
        trend: 'stable',
        utilization: 0,
      };
    }
    trends[eqId].totalRentals += 1;
    trends[eqId].totalRevenue += booking.total_price || 0;
  });

  return Object.values(trends).sort((a, b) => b.totalRevenue - a.totalRevenue);
}

export async function getRevenueByCategory(userId: string, days: number = 30): Promise<RevenueBreakdown[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(
      `
      total_price,
      equipment:equipment_id(
        category
      )
    `
    )
    .gte('created_at', startDate.toISOString())
    .eq('owner_id', userId);

  if (error) throw error;

  const breakdown: Record<string, { amount: number; count: number }> = {};
  let total = 0;

  bookings?.forEach((booking: any) => {
    const category = booking.equipment?.category || 'Other';
    if (!breakdown[category]) {
      breakdown[category] = { amount: 0, count: 0 };
    }
    breakdown[category].amount += booking.total_price || 0;
    breakdown[category].count += 1;
    total += booking.total_price || 0;
  });

  return Object.entries(breakdown).map(([category, { amount, count }]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
    rentals: count,
  }));
}

export async function getUserSegmentAnalysis(userId: string): Promise<UserSegment[]> {
  const { data: renters, error } = await supabase
    .from('bookings')
    .select(
      `
      renter_id,
      total_price,
      created_at
    `
    )
    .eq('owner_id', userId);

  if (error) throw error;

  const segments: Record<string, { count: number; totalSpent: number; dates: string[] }> = {
    'High Value': { count: 0, totalSpent: 0, dates: [] },
    'Regular': { count: 0, totalSpent: 0, dates: [] },
    'New': { count: 0, totalSpent: 0, dates: [] },
  };

  renters?.forEach((rental: any) => {
    const spent = rental.total_price || 0;
    const date = new Date(rental.created_at);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

    let segment = 'New';
    if (spent > 500) segment = 'High Value';
    else if (daysAgo < 90) segment = 'Regular';

    segments[segment].count += 1;
    segments[segment].totalSpent += spent;
    segments[segment].dates.push(rental.created_at);
  });

  return Object.entries(segments).map(([segment, { count, totalSpent, dates }]) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCount = dates.filter(d => new Date(d) > thirtyDaysAgo).length;

    return {
      segment,
      count,
      totalSpent,
      averageSpent: count > 0 ? totalSpent / count : 0,
      retention: count > 0 ? (recentCount / count) * 100 : 0,
    };
  });
}

export async function generateAnalyticsReport(userId: string) {
  const trends = await getEquipmentTrends(userId);
  const revenue = await getRevenueByCategory(userId);
  const segments = await getUserSegmentAnalysis(userId);

  return {
    generatedAt: new Date().toISOString(),
    period: 'Last 30 days',
    trends,
    revenue,
    segments,
    summary: {
      totalEquipment: trends.length,
      topPerformer: trends[0]?.name || 'N/A',
      totalRevenue: trends.reduce((sum, t) => sum + t.totalRevenue, 0),
      totalRentals: trends.reduce((sum, t) => sum + t.totalRentals, 0),
    },
  };
}
