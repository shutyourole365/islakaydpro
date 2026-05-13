import { supabase } from '../lib/supabase';

export type ReferralStatus = 'pending' | 'completed' | 'rewarded';
export type ReferralRewardType = 'credit' | 'discount' | 'premium';

export interface ReferralRecord {
  id: string;
  referredUser: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: ReferralStatus;
  joinedDate: Date;
  rewardEarned: number;
  rewardType: ReferralRewardType;
}

export interface ReferralStatsTotals {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  monthlyProgress: number;
}

const PENDING_REFERRAL_KEY = 'pending_referral_code';

export function applyReferralCodeOnSignup(code: string): void {
  if (typeof window === 'undefined') return;
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return;
  window.localStorage.setItem(PENDING_REFERRAL_KEY, trimmed);
}

export function consumePendingReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  const code = window.localStorage.getItem(PENDING_REFERRAL_KEY);
  if (code) window.localStorage.removeItem(PENDING_REFERRAL_KEY);
  return code;
}

export function captureReferralFromUrl(): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref) applyReferralCodeOnSignup(ref);
}

export async function getMyReferralCode(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('referral_code')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.referral_code ?? null;
}

interface ReferralRow {
  id: string;
  status: ReferralStatus;
  reward_amount: number | string | null;
  reward_type: ReferralRewardType | null;
  created_at: string;
  referred_user_id: string;
  referred: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export async function listMyReferrals(userId: string): Promise<ReferralRecord[]> {
  const { data, error } = await supabase
    .from('referrals')
    .select(`
      id,
      status,
      reward_amount,
      reward_type,
      created_at,
      referred_user_id,
      referred:profiles!referrals_referred_user_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as ReferralRow;
    return {
      id: r.id,
      referredUser: {
        id: r.referred?.id ?? r.referred_user_id,
        name: r.referred?.full_name ?? 'Islakayd user',
        email: '',
        avatar: r.referred?.avatar_url ?? undefined,
      },
      status: r.status,
      joinedDate: new Date(r.created_at),
      rewardEarned: Number(r.reward_amount ?? 0),
      rewardType: r.reward_type ?? 'credit',
    };
  });
}

export async function getReferralStats(userId: string): Promise<ReferralStatsTotals> {
  const { data, error } = await supabase
    .from('referrals')
    .select('status, reward_amount, created_at')
    .eq('referrer_id', userId);

  if (error) throw error;

  const rows = data ?? [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let total = 0;
  let success = 0;
  let pending = 0;
  let rewards = 0;
  let monthly = 0;

  for (const row of rows as Array<{ status: ReferralStatus; reward_amount: number | string | null; created_at: string }>) {
    total += 1;
    if (row.status === 'completed' || row.status === 'rewarded') success += 1;
    if (row.status === 'pending') pending += 1;
    rewards += Number(row.reward_amount ?? 0);
    if (new Date(row.created_at) >= monthStart) monthly += 1;
  }

  return {
    totalReferrals: total,
    successfulReferrals: success,
    pendingReferrals: pending,
    totalRewards: rewards,
    monthlyProgress: monthly,
  };
}
