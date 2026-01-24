// Supabase Edge Function: Send Booking Reminders
// Run as a scheduled cron job

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Get bookings starting tomorrow (pickup reminders)
    const { data: pickupBookings } = await supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        renter_id,
        equipment:equipment(title, location),
        renter:profiles!bookings_renter_id_fkey(full_name)
      `)
      .eq('status', 'confirmed')
      .gte('start_date', tomorrow.toISOString().split('T')[0])
      .lt('start_date', new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]);

    // Get bookings ending tomorrow (return reminders)
    const { data: returnBookings } = await supabase
      .from('bookings')
      .select(`
        id,
        start_date,
        end_date,
        renter_id,
        owner_id,
        equipment:equipment(title, location),
        renter:profiles!bookings_renter_id_fkey(full_name),
        owner:profiles!bookings_owner_id_fkey(full_name)
      `)
      .eq('status', 'active')
      .gte('end_date', tomorrow.toISOString().split('T')[0])
      .lt('end_date', new Date(tomorrow.getTime() + 86400000).toISOString().split('T')[0]);

    const { data: { users } } = await supabase.auth.admin.listUsers();

    // Send pickup reminders
    for (const booking of pickupBookings || []) {
      const renterEmail = users?.find(u => u.id === booking.renter_id)?.email;
      
      if (renterEmail) {
        await sendReminder({
          to: renterEmail,
          type: 'pickup',
          data: {
            userName: (booking.renter as { full_name: string })?.full_name || 'Renter',
            equipmentTitle: (booking.equipment as { title: string })?.title,
            date: formatDate(booking.start_date),
            location: (booking.equipment as { location: string })?.location,
            daysAway: 1,
            bookingId: booking.id,
          },
        });
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: booking.renter_id,
        type: 'booking_reminder',
        title: 'Pickup Tomorrow',
        message: `Reminder: Pick up ${(booking.equipment as { title: string })?.title} tomorrow`,
        data: { booking_id: booking.id },
      });
    }

    // Send return reminders
    for (const booking of returnBookings || []) {
      const renterEmail = users?.find(u => u.id === booking.renter_id)?.email;
      const ownerEmail = users?.find(u => u.id === booking.owner_id)?.email;
      
      // Remind renter
      if (renterEmail) {
        await sendReminder({
          to: renterEmail,
          type: 'return',
          data: {
            userName: (booking.renter as { full_name: string })?.full_name || 'Renter',
            equipmentTitle: (booking.equipment as { title: string })?.title,
            date: formatDate(booking.end_date),
            location: (booking.equipment as { location: string })?.location,
            daysAway: 1,
            bookingId: booking.id,
          },
        });
      }

      // Remind owner
      if (ownerEmail) {
        await supabase.from('notifications').insert({
          user_id: booking.owner_id,
          type: 'booking_reminder',
          title: 'Return Tomorrow',
          message: `${(booking.renter as { full_name: string })?.full_name} will return ${(booking.equipment as { title: string })?.title} tomorrow`,
          data: { booking_id: booking.id },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        pickupReminders: pickupBookings?.length || 0,
        returnReminders: returnBookings?.length || 0,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Reminder error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function sendReminder(params: { to: string; type: string; data: Record<string, unknown> }) {
  const sendEmailUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`;
  
  await fetch(sendEmailUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: params.to,
      subject: `Reminder: Equipment ${params.type === 'pickup' ? 'Pickup' : 'Return'} Tomorrow`,
      template: 'booking-reminder',
      data: { ...params.data, type: params.type },
    }),
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
