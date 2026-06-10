// Stripe Checkout Session Creation
// This function creates a Stripe checkout session for equipment bookings

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutRequest {
  bookingId: string;
  equipmentId: string;
  equipmentTitle: string;
  dailyRate: number;
  totalDays: number;
  subtotal: number;
  serviceFee: number;
  depositAmount: number;
  totalAmount: number;
  startDate: string;
  endDate: string;
  insurancePlanId?: string;
  insuranceAmount?: number;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

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

    const body: CheckoutRequest = await req.json();

    // Validate the booking exists and belongs to the user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, equipment:equipment(*)')
      .eq('id', body.bookingId)
      .eq('renter_id', user.id)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found or unauthorized');
    }

    // Get or create Stripe customer
    let customerId: string;

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profile?.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: body.equipmentTitle,
            description: `${body.totalDays} day rental (${body.startDate} to ${body.endDate})`,
            images: booking.equipment?.images?.slice(0, 1) || [],
          },
          unit_amount: Math.round(body.subtotal * 100), // Convert to cents
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Service Fee',
            description: 'Platform service fee (12%)',
          },
          unit_amount: Math.round(body.serviceFee * 100),
        },
        quantity: 1,
      },
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Refundable Security Deposit',
            description: 'Returned after equipment is returned in good condition',
          },
          unit_amount: Math.round(body.depositAmount * 100),
        },
        quantity: 1,
      },
    ];

    // Add insurance if selected
    if (body.insuranceAmount && body.insuranceAmount > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Rental Protection Insurance',
            description: 'Coverage for accidental damage during rental period',
          },
          unit_amount: Math.round(body.insuranceAmount * 100),
        },
        quantity: 1,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${body.successUrl}?session_id={CHECKOUT_SESSION_ID}&booking_id=${body.bookingId}`,
      cancel_url: `${body.cancelUrl}?booking_id=${body.bookingId}`,
      metadata: {
        booking_id: body.bookingId,
        equipment_id: body.equipmentId,
        user_id: user.id,
        start_date: body.startDate,
        end_date: body.endDate,
        insurance_plan_id: body.insurancePlanId || '',
      },
      payment_intent_data: {
        metadata: {
          booking_id: body.bookingId,
          equipment_id: body.equipmentId,
          user_id: user.id,
        },
        // Capture payment immediately
        capture_method: 'automatic',
      },
      // Add billing address collection
      billing_address_collection: 'required',
      // Add phone number collection
      phone_number_collection: {
        enabled: true,
      },
      // Custom branding
      custom_text: {
        submit: {
          message: 'Your booking will be confirmed once payment is complete.',
        },
      },
    });

    // Update booking with checkout session ID
    await supabase
      .from('bookings')
      .update({ 
        stripe_checkout_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.bookingId);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id, 
        url: session.url 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
