/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '../lib/supabase';

export interface Recommendation {
  id: string;
  equipmentId: string;
  equipmentName: string;
  reason: string;
  relevanceScore: number;
  basePrice: number;
  imageUrl: string;
  category: string;
}

export interface UserProfile {
  totalRentals: number;
  favoriteCategories: string[];
  averageRentalDuration: number;
  totalSpent: number;
  preferredPriceRange: { min: number; max: number };
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      equipment:equipment_id(category, daily_rate)
    `)
    .eq('renter_id', userId);

  if (error) throw error;

  const categoryMap: Record<string, number> = {};
  let totalDuration = 0;
  let totalSpent = 0;

  bookings?.forEach((booking: any) => {
    const category = booking.equipment?.category || 'Other';
    categoryMap[category] = (categoryMap[category] || 0) + 1;

    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    totalDuration += days;

    totalSpent += booking.total_price || 0;
  });

  const favoriteCategories = Object.entries(categoryMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat);

  const avgDuration = bookings?.length ? Math.round(totalDuration / bookings.length) : 0;

  return {
    totalRentals: bookings?.length || 0,
    favoriteCategories,
    averageRentalDuration: avgDuration,
    totalSpent,
    preferredPriceRange: {
      min: totalSpent > 0 && bookings?.length ? Math.round((totalSpent / bookings.length) * 0.5) : 0,
      max: totalSpent > 0 && bookings?.length ? Math.round((totalSpent / bookings.length) * 1.5) : 500,
    },
  };
}

export async function getSmartRecommendations(
  userId: string,
  limit: number = 6
): Promise<Recommendation[]> {
  try {
    const profile = await getUserProfile(userId);

    if (profile.totalRentals === 0) {
      return getPopularEquipment(limit);
    }

    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .in('category', profile.favoriteCategories.length > 0 ? profile.favoriteCategories : ['Other'])
      .gte('daily_rate', profile.preferredPriceRange.min)
      .lte('daily_rate', profile.preferredPriceRange.max);

    if (error) throw error;

    const { data: previousRentals, error: rentalError } = await supabase
      .from('bookings')
      .select('equipment_id')
      .eq('renter_id', userId);

    if (rentalError) throw rentalError;

    const rentedIds = new Set((previousRentals || []).map((r: any) => r.equipment_id));

    const recommendations: Recommendation[] = (equipment || [])
      .filter((e: any) => !rentedIds.has(e.id))
      .map((e: any) => {
        let reason = '';
        let score = 50;

        // Category match bonus
        if (profile.favoriteCategories.includes(e.category)) {
          score += 20;
          reason = 'Matches your favorite categories';
        }

        // Price match bonus
        if (e.daily_rate >= profile.preferredPriceRange.min && e.daily_rate <= profile.preferredPriceRange.max) {
          score += 15;
          if (!reason) reason = 'Within your price range';
        }

        // Rating bonus
        if (e.rating && e.rating >= 4.5) {
          score += 10;
          if (!reason) reason = 'Highly rated by customers';
        }

        // Popularity bonus
        if (e.rental_count && e.rental_count > 10) {
          score += 5;
        }

        return {
          id: e.id,
          equipmentId: e.id,
          equipmentName: e.name,
          reason: reason || 'Recommended for you',
          relevanceScore: Math.min(score, 100),
          basePrice: e.daily_rate,
          imageUrl: e.image_url || '',
          category: e.category,
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);

    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return getPopularEquipment(limit);
  }
}

async function getPopularEquipment(limit: number): Promise<Recommendation[]> {
  const { data: equipment, error } = await supabase
    .from('equipment')
    .select('*')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (equipment || []).map((e: any) => ({
    id: e.id,
    equipmentId: e.id,
    equipmentName: e.name,
    reason: 'Popular on IslaKayden',
    relevanceScore: Math.round((e.rating || 4) * 20),
    basePrice: e.daily_rate,
    imageUrl: e.image_url || '',
    category: e.category,
  }));
}

export async function getSimilarEquipment(
  equipmentId: string,
  limit: number = 4
): Promise<Recommendation[]> {
  const { data: currentEquip, error: currentError } = await supabase
    .from('equipment')
    .select('category, daily_rate')
    .eq('id', equipmentId)
    .single();

  if (currentError) throw currentError;

  const { data: similar, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('category', currentEquip.category)
    .neq('id', equipmentId)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (similar || []).map((e: any) => ({
    id: e.id,
    equipmentId: e.id,
    equipmentName: e.name,
    reason: `Similar ${currentEquip.category} equipment`,
    relevanceScore: Math.round((e.rating || 4) * 20),
    basePrice: e.daily_rate,
    imageUrl: e.image_url || '',
    category: e.category,
  }));
}
