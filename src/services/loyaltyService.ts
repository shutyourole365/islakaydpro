import { supabase } from '../lib/supabase';

export interface LoyaltyAccount {
  id: string;
  userId: string;
  totalPoints: number;
  totalRentals: number;
  totalSpent: number;
  tierLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  tierExpiry: string | null;
  joinedAt: string;
}

export interface LoyaltyReward {
  id: string;
  userId: string;
  pointsEarned: number;
  pointsUsed: number;
  type: 'booking' | 'review' | 'referral' | 'milestone' | 'redemption';
  description: string;
  transactionDate: string;
}

export interface RewardOption {
  id: string;
  name: string;
  pointsCost: number;
  discountAmount: number;
  discountPercent: number;
  description: string;
  maxRedemptions: number;
  expiresAt: string | null;
}

export interface TierBenefit {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  minPoints: number;
  minRentals: number;
  pointsMultiplier: number;
  discountPercent: number;
  benefits: string[];
}

const tierBenefits: Record<string, TierBenefit> = {
  bronze: {
    tier: 'bronze',
    minPoints: 0,
    minRentals: 0,
    pointsMultiplier: 1.0,
    discountPercent: 0,
    benefits: ['1x points on rentals', 'Birthday bonus points'],
  },
  silver: {
    tier: 'silver',
    minPoints: 500,
    minRentals: 5,
    pointsMultiplier: 1.2,
    discountPercent: 5,
    benefits: ['1.2x points on rentals', '5% discount on all rentals', 'Priority support', '50% booking fee waiver'],
  },
  gold: {
    tier: 'gold',
    minPoints: 1500,
    minRentals: 15,
    pointsMultiplier: 1.5,
    discountPercent: 10,
    benefits: ['1.5x points on rentals', '10% discount on all rentals', 'Free booking', 'Exclusive access to premium equipment'],
  },
  platinum: {
    tier: 'platinum',
    minPoints: 3500,
    minRentals: 30,
    pointsMultiplier: 2.0,
    discountPercent: 15,
    benefits: ['2x points on rentals', '15% discount on all rentals', 'Free premium memberships', 'Exclusive events', 'VIP support line'],
  },
};

export async function getLoyaltyAccount(userId: string): Promise<LoyaltyAccount> {
  const { data, error } = await supabase
    .from('loyalty_accounts')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    // Create new loyalty account
    return createLoyaltyAccount(userId);
  }

  return {
    id: data.id,
    userId: data.user_id,
    totalPoints: data.total_points,
    totalRentals: data.total_rentals,
    totalSpent: data.total_spent,
    tierLevel: data.tier_level,
    tierExpiry: data.tier_expiry,
    joinedAt: data.joined_at,
  };
}

async function createLoyaltyAccount(userId: string): Promise<LoyaltyAccount> {
  const { data, error } = await supabase
    .from('loyalty_accounts')
    .insert({
      user_id: userId,
      total_points: 0,
      total_rentals: 0,
      total_spent: 0,
      tier_level: 'bronze',
      joined_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    totalPoints: data.total_points,
    totalRentals: data.total_rentals,
    totalSpent: data.total_spent,
    tierLevel: data.tier_level,
    tierExpiry: data.tier_expiry,
    joinedAt: data.joined_at,
  };
}

export async function awardPoints(
  userId: string,
  points: number,
  type: 'booking' | 'review' | 'referral' | 'milestone',
  description: string
): Promise<LoyaltyReward> {
  const account = await getLoyaltyAccount(userId);
  const tierBenefit = tierBenefits[account.tierLevel];
  const adjustedPoints = Math.round(points * tierBenefit.pointsMultiplier);

  const { data: reward, error: rewardError } = await supabase
    .from('loyalty_rewards')
    .insert({
      user_id: userId,
      points_earned: adjustedPoints,
      points_used: 0,
      type,
      description,
      transaction_date: new Date().toISOString(),
    })
    .select()
    .single();

  if (rewardError) throw rewardError;

  // Update account points
  await supabase
    .from('loyalty_accounts')
    .update({
      total_points: account.totalPoints + adjustedPoints,
    })
    .eq('id', account.id);

  // Check if tier should be updated
  await updateTierLevel(userId);

  return {
    id: reward.id,
    userId: reward.user_id,
    pointsEarned: reward.points_earned,
    pointsUsed: reward.points_used,
    type: reward.type,
    description: reward.description,
    transactionDate: reward.transaction_date,
  };
}

export async function redeemPoints(
  userId: string,
  points: number,
  description: string
): Promise<LoyaltyAccount> {
  const account = await getLoyaltyAccount(userId);

  if (account.totalPoints < points) {
    throw new Error('Insufficient points');
  }

  // Record the redemption
  await supabase
    .from('loyalty_rewards')
    .insert({
      user_id: userId,
      points_earned: 0,
      points_used: points,
      type: 'redemption',
      description,
      transaction_date: new Date().toISOString(),
    });

  // Update account
  const { data, error } = await supabase
    .from('loyalty_accounts')
    .update({
      total_points: account.totalPoints - points,
    })
    .eq('id', account.id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    totalPoints: data.total_points,
    totalRentals: data.total_rentals,
    totalSpent: data.total_spent,
    tierLevel: data.tier_level,
    tierExpiry: data.tier_expiry,
    joinedAt: data.joined_at,
  };
}

export async function recordRental(userId: string, totalPrice: number): Promise<void> {
  const account = await getLoyaltyAccount(userId);

  // Award 1 point per dollar spent
  const points = Math.round(totalPrice);
  await awardPoints(userId, points, 'booking', `Earned from rental (${totalPrice.toFixed(2)})`);

  // Update rental count and spent
  await supabase
    .from('loyalty_accounts')
    .update({
      total_rentals: account.totalRentals + 1,
      total_spent: account.totalSpent + totalPrice,
    })
    .eq('id', account.id);
}

async function updateTierLevel(userId: string): Promise<void> {
  const account = await getLoyaltyAccount(userId);

  let newTier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

  if (account.totalPoints >= 3500 && account.totalRentals >= 30) {
    newTier = 'platinum';
  } else if (account.totalPoints >= 1500 && account.totalRentals >= 15) {
    newTier = 'gold';
  } else if (account.totalPoints >= 500 && account.totalRentals >= 5) {
    newTier = 'silver';
  }

  if (newTier !== account.tierLevel) {
    await supabase
      .from('loyalty_accounts')
      .update({ tier_level: newTier })
      .eq('id', account.id);
  }
}

export async function getRewardHistory(userId: string, limit: number = 20): Promise<LoyaltyReward[]> {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    userId: r.user_id,
    pointsEarned: r.points_earned,
    pointsUsed: r.points_used,
    type: r.type,
    description: r.description,
    transactionDate: r.transaction_date,
  }));
}

export async function getAvailableRewards(): Promise<RewardOption[]> {
  const { data, error } = await supabase
    .from('reward_options')
    .select('*')
    .eq('active', true)
    .order('points_cost', { ascending: true });

  if (error) throw error;

  return (data || []).map(r => ({
    id: r.id,
    name: r.name,
    pointsCost: r.points_cost,
    discountAmount: r.discount_amount,
    discountPercent: r.discount_percent,
    description: r.description,
    maxRedemptions: r.max_redemptions,
    expiresAt: r.expires_at,
  }));
}

export function getTierBenefits(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): TierBenefit {
  return tierBenefits[tier];
}

export function calculateTierProgress(account: LoyaltyAccount): {
  currentTier: TierBenefit;
  nextTier: TierBenefit | null;
  pointsToNextTier: number;
  rentalsToNextTier: number;
  progressPercent: number;
} {
  const currentTierBenefit = tierBenefits[account.tierLevel];
  const tierKeys: Array<'bronze' | 'silver' | 'gold' | 'platinum'> = ['bronze', 'silver', 'gold', 'platinum'];
  const currentIndex = tierKeys.indexOf(account.tierLevel);
  const nextTier = currentIndex < tierKeys.length - 1 ? tierBenefits[tierKeys[currentIndex + 1]] : null;

  const pointsToNext = nextTier ? Math.max(0, nextTier.minPoints - account.totalPoints) : 0;
  const rentalsToNext = nextTier ? Math.max(0, nextTier.minRentals - account.totalRentals) : 0;

  let progressPercent = 100;
  if (nextTier) {
    const pointsProgress = Math.min(100, (account.totalPoints / nextTier.minPoints) * 100);
    const rentalProgress = Math.min(100, (account.totalRentals / nextTier.minRentals) * 100);
    progressPercent = Math.round((pointsProgress + rentalProgress) / 2);
  }

  return {
    currentTier: currentTierBenefit,
    nextTier,
    pointsToNextTier: pointsToNext,
    rentalsToNextTier: rentalsToNext,
    progressPercent,
  };
}
