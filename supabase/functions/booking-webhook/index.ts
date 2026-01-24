// Supabase Edge Function: Handle Booking Events
// Triggered by database webhooks

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingRecord {
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  total_amount: number;
  status: string;
  payment_status: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: BookingRecord;
  old_record?: BookingRecord;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json() as WebhookPayload;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get related data
    const [equipmentResult, renterResult, ownerResult] = await Promise.all([
      supabase.from('equipment').select('title, location').eq('id', payload.record.equipment_id).single(),
      supabase.from('profiles').select('full_name, id').eq('id', payload.record.renter_id).single(),
      supabase.from('profiles').select('full_name, id').eq('id', payload.record.owner_id).single(),
    ]);

    // Get user emails from auth
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const renterEmail = users?.find(u => u.id === payload.record.renter_id)?.email;
    const ownerEmail = users?.find(u => u.id === payload.record.owner_id)?.email;

    const equipment = equipmentResult.data;
    const renter = renterResult.data;
    const owner = ownerResult.data;

    // Handle new booking (INSERT)
    if (payload.type === 'INSERT') {
      // Notify owner of new booking request
      if (ownerEmail) {
        await sendEmail({
          to: ownerEmail,
          subject: `New Booking Request for ${equipment?.title}`,
          template: 'booking-request',
          data: {
            ownerName: owner?.full_name || 'Owner',
            renterName: renter?.full_name || 'Renter',
            equipmentTitle: equipment?.title,
            startDate: formatDate(payload.record.start_date),
            endDate: formatDate(payload.record.end_date),
            totalDays: payload.record.total_days,
            ownerEarnings: (payload.record.total_amount * 0.88).toFixed(2), // 12% service fee
            bookingId: payload.record.id,
          },
        });
      }

      // Create in-app notification
      await supabase.from('notifications').insert({
        user_id: payload.record.owner_id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${renter?.full_name} requested to rent ${equipment?.title}`,
        data: { booking_id: payload.record.id, equipment_id: payload.record.equipment_id },
      });
    }

    // Handle status updates (UPDATE)
    if (payload.type === 'UPDATE' && payload.old_record) {
      const oldStatus = payload.old_record.status;
      const newStatus = payload.record.status;

      // Status changed to confirmed
      if (oldStatus !== 'confirmed' && newStatus === 'confirmed') {
        // Notify renter of approval
        if (renterEmail) {
          await sendEmail({
            to: renterEmail,
            subject: `Booking Approved - ${equipment?.title}`,
            template: 'booking-approved',
            data: {
              renterName: renter?.full_name || 'Renter',
              ownerName: owner?.full_name || 'Owner',
              equipmentTitle: equipment?.title,
              startDate: formatDate(payload.record.start_date),
              endDate: formatDate(payload.record.end_date),
              bookingId: payload.record.id,
            },
          });
        }

        await supabase.from('notifications').insert({
          user_id: payload.record.renter_id,
          type: 'booking_confirmed',
          title: 'Booking Confirmed',
          message: `Your booking for ${equipment?.title} has been approved!`,
          data: { booking_id: payload.record.id },
        });
      }

      // Status changed to cancelled
      if (oldStatus !== 'cancelled' && newStatus === 'cancelled') {
        if (renterEmail) {
          await sendEmail({
            to: renterEmail,
            subject: `Booking Update - ${equipment?.title}`,
            template: 'booking-rejected',
            data: {
              renterName: renter?.full_name || 'Renter',
              equipmentTitle: equipment?.title,
              reason: 'The owner was unable to fulfill this booking.',
            },
          });
        }

        await supabase.from('notifications').insert({
          user_id: payload.record.renter_id,
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Your booking for ${equipment?.title} has been cancelled.`,
          data: { booking_id: payload.record.id },
        });
      }

      // Payment completed
      if (payload.old_record.payment_status !== 'paid' && payload.record.payment_status === 'paid') {
        // Send confirmation to renter
        if (renterEmail) {
          await sendEmail({
            to: renterEmail,
            subject: `Booking Confirmed - ${equipment?.title}`,
            template: 'booking-confirmation',
            data: {
              renterName: renter?.full_name || 'Renter',
              equipmentTitle: equipment?.title,
              startDate: formatDate(payload.record.start_date),
              endDate: formatDate(payload.record.end_date),
              totalDays: payload.record.total_days,
              totalAmount: payload.record.total_amount.toFixed(2),
              pickupLocation: equipment?.location || 'Contact owner for details',
              bookingId: payload.record.id,
            },
          });
        }

        // Notify owner of payment
        if (ownerEmail) {
          await sendEmail({
            to: ownerEmail,
            subject: `Payment Received for ${equipment?.title}`,
            template: 'payment-received',
            data: {
              userName: owner?.full_name || 'Owner',
              equipmentTitle: equipment?.title,
              amount: (payload.record.total_amount * 0.88).toFixed(2),
              transactionId: `TXN-${payload.record.id.slice(0, 8).toUpperCase()}`,
              date: formatDate(new Date().toISOString()),
              bookingId: payload.record.id,
            },
          });
        }

        await supabase.from('notifications').insert({
          user_id: payload.record.owner_id,
          type: 'payment_received',
          title: 'Payment Received',
          message: `Payment received for ${equipment?.title} rental`,
          data: { booking_id: payload.record.id, amount: payload.record.total_amount },
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Booking webhook error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function sendEmail(params: { to: string; subject: string; template: string; data: Record<string, unknown> }) {
  const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`;
  
  await fetch(sendEmailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
