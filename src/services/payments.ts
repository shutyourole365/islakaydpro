import { supabase } from '../lib/supabase';
import type { Booking, Equipment } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

interface CheckoutParams {
  booking: Booking;
  equipment: Equipment;
  insurancePlanId?: string;
  insuranceAmount?: number;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutResponse {
  sessionId: string;
  url: string;
}

interface ConnectAccountResponse {
  accountId: string;
  url: string;
}

interface BalanceResponse {
  available: number;
  pending: number;
  currency: string;
}

interface Payout {
  id: string;
  booking_id: string;
  owner_id: string;
  amount: number;
  platform_fee: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_transfer_id: string;
  created_at: string;
  booking?: Booking & {
    equipment?: Equipment;
  };
}

// Get auth token for API calls
async function getAuthToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return session.access_token;
}

/**
 * Create a Stripe checkout session for a booking
 */
export async function createCheckoutSession(params: CheckoutParams): Promise<CheckoutResponse> {
  const token = await getAuthToken();
  
  const { booking, equipment, insurancePlanId, insuranceAmount } = params;
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      bookingId: booking.id,
      equipmentId: equipment.id,
      equipmentTitle: equipment.title,
      dailyRate: booking.daily_rate,
      totalDays: booking.total_days,
      subtotal: booking.subtotal,
      serviceFee: booking.service_fee,
      depositAmount: booking.deposit_amount,
      totalAmount: booking.total_amount + (insuranceAmount || 0),
      startDate: booking.start_date,
      endDate: booking.end_date,
      insurancePlanId,
      insuranceAmount,
      successUrl: params.successUrl || `${window.location.origin}/booking/success`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/booking/cancel`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Redirect to Stripe checkout
 */
export async function redirectToCheckout(params: CheckoutParams): Promise<void> {
  const { url } = await createCheckoutSession(params);
  window.location.href = url;
}

/**
 * Create or get Stripe Connect account for payouts
 */
export async function createConnectAccount(): Promise<ConnectAccountResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/payouts/create-connect-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      returnUrl: `${window.location.origin}/dashboard?tab=payouts&status=success`,
      refreshUrl: `${window.location.origin}/dashboard?tab=payouts&status=refresh`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create connect account');
  }

  return response.json();
}

/**
 * Redirect to Stripe Connect onboarding
 */
export async function redirectToConnectOnboarding(): Promise<void> {
  const { url } = await createConnectAccount();
  window.location.href = url;
}

/**
 * Get owner's balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  const token = await getAuthToken();
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/payouts/get-balance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get balance');
  }

  return response.json();
}

/**
 * Get payout history
 */
export async function getPayouts(): Promise<Payout[]> {
  const token = await getAuthToken();
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/payouts/get-payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get payouts');
  }

  const data = await response.json();
  return data.payouts;
}

/**
 * Request payout for a completed booking
 */
export async function requestPayout(bookingId: string): Promise<{ success: boolean; payout: Payout }> {
  const token = await getAuthToken();
  
  const response = await fetch(`${SUPABASE_URL}/functions/v1/payouts/create-payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ bookingId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payout');
  }

  return response.json();
}

/**
 * Check if user has completed Stripe Connect onboarding
 */
export async function checkPayoutStatus(): Promise<{
  hasAccount: boolean;
  isOnboarded: boolean;
  accountId?: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { hasAccount: false, isOnboarded: false };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, stripe_connect_onboarding_complete')
    .eq('id', user.id)
    .single();

  return {
    hasAccount: !!profile?.stripe_connect_account_id,
    isOnboarded: !!profile?.stripe_connect_onboarding_complete,
    accountId: profile?.stripe_connect_account_id,
  };
}

/**
 * Verify a checkout session after redirect
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  bookingId?: string;
}> {
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status, payment_status')
    .eq('stripe_checkout_session_id', sessionId)
    .single();

  if (booking && booking.payment_status === 'paid') {
    return { success: true, bookingId: booking.id };
  }

  return { success: false };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate service fee (12%)
 */
export function calculateServiceFee(subtotal: number): number {
  return Math.round(subtotal * 0.12 * 100) / 100;
}

/**
 * Calculate total with all fees
 */
export function calculateTotal(
  dailyRate: number,
  days: number,
  depositAmount: number,
  insuranceAmount = 0
): {
  subtotal: number;
  serviceFee: number;
  deposit: number;
  insurance: number;
  total: number;
} {
  const subtotal = dailyRate * days;
  const serviceFee = calculateServiceFee(subtotal);
  
  return {
    subtotal,
    serviceFee,
    deposit: depositAmount,
    insurance: insuranceAmount,
    total: subtotal + serviceFee + depositAmount + insuranceAmount,
  };
}
