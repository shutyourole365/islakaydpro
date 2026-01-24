// Stripe Webhook Handler
// Handles payment events from Stripe

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log(`Received event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        // Handle subscription events if you add subscription features
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const bookingId = session.metadata?.booking_id;
  
  if (!bookingId) {
    console.error('No booking_id in session metadata');
    return;
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'confirmed',
      payment_status: 'paid',
      stripe_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    console.error('Error updating booking:', updateError);
    return;
  }

  // Get booking details for notifications
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, equipment:equipment(*), renter:profiles!bookings_renter_id_fkey(*)')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    console.error('Booking not found');
    return;
  }

  // Block dates on equipment calendar
  await supabase
    .from('equipment_availability')
    .insert({
      equipment_id: booking.equipment_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      reason: 'booked',
      booking_id: bookingId,
    });

  // Create payment record
  await supabase
    .from('payments')
    .insert({
      booking_id: bookingId,
      user_id: booking.renter_id,
      amount: session.amount_total ? session.amount_total / 100 : booking.total_amount,
      currency: session.currency || 'usd',
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_checkout_session_id: session.id,
      payment_method: 'card',
      metadata: {
        equipment_id: booking.equipment_id,
        equipment_title: booking.equipment?.title,
        start_date: booking.start_date,
        end_date: booking.end_date,
      },
    });

  // Create notification for owner
  await supabase
    .from('notifications')
    .insert({
      user_id: booking.owner_id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed & Paid',
      message: `${booking.renter?.full_name || 'A renter'} has booked your ${booking.equipment?.title}`,
      data: {
        booking_id: bookingId,
        equipment_id: booking.equipment_id,
        amount: session.amount_total ? session.amount_total / 100 : booking.total_amount,
      },
    });

  // Send confirmation emails via send-email function
  const emailPayload = {
    template: 'booking-confirmation',
    to: booking.renter?.email,
    data: {
      renterName: booking.renter?.full_name,
      equipmentTitle: booking.equipment?.title,
      startDate: booking.start_date,
      endDate: booking.end_date,
      totalAmount: session.amount_total ? session.amount_total / 100 : booking.total_amount,
      bookingId: bookingId,
    },
  };

  // Call send-email function
  await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
    },
    body: JSON.stringify(emailPayload),
  });

  console.log(`Booking ${bookingId} confirmed and paid`);
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.booking_id;
  
  if (!bookingId) {
    console.log('No booking_id in payment intent metadata');
    return;
  }

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  console.log(`Payment ${paymentIntent.id} succeeded for booking ${bookingId}`);
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const bookingId = paymentIntent.metadata?.booking_id;
  
  if (!bookingId) {
    console.log('No booking_id in payment intent metadata');
    return;
  }

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  // Get booking for notification
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, renter:profiles!bookings_renter_id_fkey(*)')
    .eq('id', bookingId)
    .single();

  if (booking) {
    // Notify renter about failed payment
    await supabase
      .from('notifications')
      .insert({
        user_id: booking.renter_id,
        type: 'payment_failed',
        title: 'Payment Failed',
        message: 'Your payment could not be processed. Please try again.',
        data: {
          booking_id: bookingId,
          error: paymentIntent.last_payment_error?.message,
        },
      });
  }

  console.log(`Payment failed for booking ${bookingId}`);
}

async function handleRefund(charge: Stripe.Charge) {
  // Find the payment by charge ID or payment intent
  const { data: payment } = await supabase
    .from('payments')
    .select('*, booking:bookings(*)')
    .eq('stripe_payment_intent_id', charge.payment_intent)
    .single();

  if (!payment) {
    console.log('Payment not found for refund');
    return;
  }

  const refundAmount = charge.amount_refunded / 100;
  const isFullRefund = charge.refunded;

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      refunded_amount: refundAmount,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id);

  // Update booking if full refund
  if (isFullRefund && payment.booking) {
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.booking.id);

    // Remove date blocks
    await supabase
      .from('equipment_availability')
      .delete()
      .eq('booking_id', payment.booking.id);
  }

  // Notify user
  await supabase
    .from('notifications')
    .insert({
      user_id: payment.user_id,
      type: 'payment_refunded',
      title: isFullRefund ? 'Full Refund Processed' : 'Partial Refund Processed',
      message: `$${refundAmount.toFixed(2)} has been refunded to your payment method.`,
      data: {
        booking_id: payment.booking?.id,
        refund_amount: refundAmount,
      },
    });

  console.log(`Refund processed: $${refundAmount}`);
}
