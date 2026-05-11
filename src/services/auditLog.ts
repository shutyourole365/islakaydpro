import { supabase } from '../lib/supabase';

export type AuditAction =
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

type Metadata = Record<string, string | number | boolean | null>;

interface AuditLogEntry {
  action: AuditAction;
  user_id: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Metadata;
  ip_address?: string;
  user_agent?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    // Get user agent if available (browser environment)
    let userAgent = 'unknown';

    if (typeof navigator !== 'undefined') {
      userAgent = navigator.userAgent;
    }

    // IP address should be captured server-side via Supabase Edge Functions
    // Client-side IP fetching introduces latency and privacy concerns
    const ipAddress = 'unknown';

    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          action: entry.action,
          user_id: entry.user_id,
          entity_type: entry.entity_type,
          entity_id: entry.entity_id,
          metadata: entry.metadata || {},
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ]);

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Error in audit logging:', err);
  }
}

interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type?: string;
  entity_id?: string;
  metadata: Metadata;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export async function getAuditLogs(
  userId?: string,
  action?: AuditAction,
  limit: number = 50
): Promise<AuditLog[]> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (action) {
      query = query.eq('action', action);
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
  stripePaymentIntentId?: string
): Promise<void> {
  await logAuditEvent({
    action: 'payment_created',
    user_id: userId,
    metadata: {
      amount,
      currency,
      stripe_payment_intent_id: stripePaymentIntentId ?? null,
    },
  });
}

export async function logRefund(
  userId: string,
  amount: number,
  bookingId?: string,
  reason?: string
): Promise<void> {
  await logAuditEvent({
    action: 'refund_issued',
    user_id: userId,
    entity_type: 'booking',
    entity_id: bookingId ?? null,
    metadata: { amount, reason: reason ?? null },
  });
}

export async function logDispute(
  userId: string,
  disputeId: string,
  type: string
): Promise<void> {
  await logAuditEvent({
    action: 'dispute_opened',
    user_id: userId,
    entity_type: 'dispute',
    entity_id: disputeId,
    metadata: { dispute_type: type },
  });
}

export async function logBookingConfirmation(
  userId: string,
  bookingId: string,
  equipmentId: string,
  amount: number
): Promise<void> {
  await logAuditEvent({
    action: 'booking_confirmed',
    user_id: userId,
    entity_type: 'booking',
    entity_id: bookingId,
    metadata: { equipment_id: equipmentId, amount },
  });
}

export async function logSecurityEvent(
  userId: string,
  action: 'password_changed' | 'verification_completed' | 'account_suspended' | 'profile_updated',
  details?: Metadata
): Promise<void> {
  await logAuditEvent({
    action,
    user_id: userId,
    metadata: details,
  });
}
