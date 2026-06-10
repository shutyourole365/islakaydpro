// Stripe Payout Handler
// Creates payouts to equipment owners after successful rentals

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface PayoutRequest {
  bookingId: string;
}

interface ConnectAccountRequest {
  returnUrl: string;
  refreshUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    switch (action) {
      case 'create-connect-account':
        return await createConnectAccount(user, await req.json());
      
      case 'create-payout':
        return await createPayout(user, await req.json());
      
      case 'get-balance':
        return await getBalance(user);
      
      case 'get-payouts':
        return await getPayouts(user);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Payout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function createConnectAccount(user: any, body: ConnectAccountRequest) {
  // Check if user already has a Connect account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, stripe_connect_onboarding_complete')
    .eq('id', user.id)
    .single();

  let accountId = profile?.stripe_connect_account_id;

  if (!accountId) {
    // Create new Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      settings: {
        payouts: {
          schedule: {
            interval: 'daily',
          },
        },
      },
    });

    accountId = account.id;

    // Save account ID to profile
    await supabase
      .from('profiles')
      .update({ 
        stripe_connect_account_id: accountId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: body.refreshUrl,
    return_url: body.returnUrl,
    type: 'account_onboarding',
  });

  return new Response(
    JSON.stringify({ 
      accountId,
      url: accountLink.url,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function createPayout(user: any, body: PayoutRequest) {
  // Verify booking exists and user is the owner
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, equipment:equipment(*)')
    .eq('id', body.bookingId)
    .eq('owner_id', user.id)
    .eq('status', 'completed')
    .eq('payment_status', 'paid')
    .single();

  if (error || !booking) {
    throw new Error('Booking not found or not eligible for payout');
  }

  // Check if payout already exists
  const { data: existingPayout } = await supabase
    .from('payouts')
    .select('id')
    .eq('booking_id', body.bookingId)
    .single();

  if (existingPayout) {
    throw new Error('Payout already exists for this booking');
  }

  // Get owner's Connect account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id, stripe_connect_onboarding_complete')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_connect_account_id || !profile?.stripe_connect_onboarding_complete) {
    throw new Error('Please complete your payout setup first');
  }

  // Calculate owner's share (subtotal - platform fee)
  // Platform keeps 12% service fee, owner gets subtotal
  const ownerAmount = booking.subtotal;
  const platformFee = booking.service_fee;

  // Create transfer to connected account
  const transfer = await stripe.transfers.create({
    amount: Math.round(ownerAmount * 100), // Convert to cents
    currency: 'usd',
    destination: profile.stripe_connect_account_id,
    transfer_group: `booking_${body.bookingId}`,
    metadata: {
      booking_id: body.bookingId,
      equipment_id: booking.equipment_id,
      owner_id: user.id,
    },
  });

  // Record payout in database
  const { data: payout } = await supabase
    .from('payouts')
    .insert({
      booking_id: body.bookingId,
      owner_id: user.id,
      amount: ownerAmount,
      platform_fee: platformFee,
      currency: 'usd',
      status: 'pending',
      stripe_transfer_id: transfer.id,
    })
    .select()
    .single();

  // Update booking payout status
  await supabase
    .from('bookings')
    .update({
      payout_status: 'pending',
      payout_id: payout?.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.bookingId);

  // Notify owner
  await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: 'payout_initiated',
      title: 'Payout Initiated',
      message: `$${ownerAmount.toFixed(2)} is being transferred to your bank account.`,
      data: {
        booking_id: body.bookingId,
        amount: ownerAmount,
        transfer_id: transfer.id,
      },
    });

  return new Response(
    JSON.stringify({ 
      success: true,
      payout: {
        id: payout?.id,
        amount: ownerAmount,
        status: 'pending',
      },
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function getBalance(user: any) {
  // Get owner's Connect account
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_connect_account_id')
    .eq('id', user.id)
    .single();

  if (!profile?.stripe_connect_account_id) {
    return new Response(
      JSON.stringify({ 
        available: 0,
        pending: 0,
        currency: 'usd',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }

  // Get balance from Stripe
  const balance = await stripe.balance.retrieve({
    stripeAccount: profile.stripe_connect_account_id,
  });

  const available = balance.available.find(b => b.currency === 'usd')?.amount || 0;
  const pending = balance.pending.find(b => b.currency === 'usd')?.amount || 0;

  return new Response(
    JSON.stringify({ 
      available: available / 100,
      pending: pending / 100,
      currency: 'usd',
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

async function getPayouts(user: any) {
  // Get payouts from database
  const { data: payouts, error } = await supabase
    .from('payouts')
    .select('*, booking:bookings(*, equipment:equipment(title, images))')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    throw error;
  }

  return new Response(
    JSON.stringify({ payouts: payouts || [] }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}
