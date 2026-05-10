import { supabase } from '../lib/supabase';

export type AuditEventType =
  | 'payment_created'
  | 'payment_failed'
  | 'refund_issued'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'equipment_listed'
  | 'equipment_unlisted'
  | 'verification_completed'
  | 'account_suspended'
  | 'account_reactivated'
  | 'password_changed'
  | 'profile_updated'
  | 'message_flagged'
  | 'review_removed'
  | 'bulk_action';

interface AuditLogEntry {
  event_type: AuditEventType;
  user_id: string;
  target_user_id?: string;
  target_entity_type?: string;
  target_entity_id?: string;
  action_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed';
  error_message?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // Get IP address if available (browser environment)
    let ipAddress = 'unknown';
    let userAgent = 'unknown';

    if (typeof navigator !== 'undefined') {
      userAgent = navigator.userAgent;
    }

    // Fetch IP from API if available
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      if (ipResponse.ok) {
        const ipData = await ipResponse.json() as { ip?: string };
        if (ipData.ip) ipAddress = ipData.ip;
      }
    } catch {
      // IP fetch failed, continue with 'unknown'
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          event_type: entry.event_type,
          user_id: entry.user_id,
          target_user_id: entry.target_user_id,
          target_entity_type: entry.target_entity_type,
          target_entity_id: entry.target_entity_id,
          action_details: entry.action_details,
          ip_address: ipAddress,
          user_agent: userAgent,
          status: entry.status,
          error_message: entry.error_message,
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Error in audit logging:', err);
  }
}

export async function getAuditLogs(
  userId?: string,
  eventType?: AuditEventType,
  limit: number = 50
): Promise<any[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    return [];
  }
}

// Specialized logging functions for specific operations

export async function logPayment(
  userId: string,
  amount: number,
  currency: string,
  status: 'success' | 'failed',
  stripePaymentIntentId?: string,
  errorMessage?: string
): Promise<void> {
  await logAuditEvent({
    event_type: 'payment_created',
    user_id: userId,
    action_details: {
      amount,
      currency,
      stripe_payment_intent_id: stripePaymentIntentId,
    },
    status,
    error_message: errorMessage,
  });
}

export async function logRefund(
  userId: string,
  targetUserId: string,
  amount: number,
  bookingId?: string,
  reason?: string
): Promise<void> {
  await logAuditEvent({
    event_type: 'refund_issued',
    user_id: userId,
    target_user_id: targetUserId,
    target_entity_type: 'booking',
    target_entity_id: bookingId,
    action_details: { amount, reason },
    status: 'success',
  });
}

export async function logDispute(
  userId: string,
  disputeId: string,
  targetUserId: string,
  type: string,
  status: 'success' | 'failed'
): Promise<void> {
  await logAuditEvent({
    event_type: 'dispute_opened',
    user_id: userId,
    target_user_id: targetUserId,
    target_entity_type: 'dispute',
    target_entity_id: disputeId,
    action_details: { dispute_type: type },
    status,
  });
}

export async function logBookingConfirmation(
  userId: string,
  bookingId: string,
  equipmentId: string,
  amount: number
): Promise<void> {
  await logAuditEvent({
    event_type: 'booking_confirmed',
    user_id: userId,
    target_entity_type: 'booking',
    target_entity_id: bookingId,
    action_details: { equipment_id: equipmentId, amount },
    status: 'success',
  });
}

export async function logSecurityEvent(
  userId: string,
  eventType: 'password_changed' | 'verification_completed' | 'account_suspended',
  status: 'success' | 'failed',
  details?: Record<string, any>
): Promise<void> {
  await logAuditEvent({
    event_type: eventType,
    user_id: userId,
    action_details: details,
    status,
  });
}
