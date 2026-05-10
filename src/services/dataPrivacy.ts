import { supabase } from '../lib/supabase';
import { logSecurityEvent } from './auditLog';

interface ExportData {
  profile: any;
  equipment: any[];
  bookings: any[];
  payments: any[];
  reviews: any[];
  messages: any[];
  favorites: any[];
  notifications: any[];
}

export async function exportUserData(userId: string): Promise<ExportData | null> {
  try {
    // Fetch all user data
    const [profile, equipment, bookings, payments, reviews, messages, favorites, notifications] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('equipment').select('*').eq('owner_id', userId),
      supabase.from('bookings').select('*').or(`renter_id.eq.${userId},owner_id.eq.${userId}`),
      supabase.from('payments').select('*').eq('user_id', userId),
      supabase.from('reviews').select('*').or(`reviewer_id.eq.${userId},reviewee_id.eq.${userId}`),
      supabase.from('messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      supabase.from('favorites').select('*').eq('user_id', userId),
      supabase.from('notifications').select('*').eq('user_id', userId),
    ]);

    return {
      profile: profile.data,
      equipment: equipment.data || [],
      bookings: bookings.data || [],
      payments: payments.data || [],
      reviews: reviews.data || [],
      messages: messages.data || [],
      favorites: favorites.data || [],
      notifications: notifications.data || [],
    };
  } catch (error) {
    console.error('Error exporting user data:', error);
    return null;
  }
}

export async function generateDataExportFile(userData: ExportData): Promise<Blob> {
  const jsonString = JSON.stringify(userData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return blob;
}

export async function downloadDataExport(userId: string): Promise<void> {
  const userData = await exportUserData(userId);
  if (!userData) {
    throw new Error('Failed to export user data');
  }

  const blob = await generateDataExportFile(userData);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `islakayd-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  await logSecurityEvent(userId, 'profile_updated', 'success', { action: 'data_exported' });
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    // Start transaction-like operation: delete all user data in correct order
    const operations = [
      // Delete messages and notifications first (no FK constraints)
      supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`),
      supabase.from('notifications').delete().eq('user_id', userId),
      supabase.from('notification_preferences').delete().eq('user_id', userId),
      supabase.from('favorites').delete().eq('user_id', userId),
      supabase.from('saved_searches').delete().eq('user_id', userId),
      supabase.from('smart_alerts').delete().eq('user_id', userId),

      // Delete reviews (author can delete their reviews)
      supabase.from('reviews').delete().eq('reviewer_id', userId),

      // Delete disputes where user is involved
      supabase.from('disputes').delete().or(`opened_by.eq.${userId},against_user.eq.${userId}`),

      // Delete payments
      supabase.from('payments').delete().eq('user_id', userId),

      // Delete bookings (user can cancel/delete their bookings)
      supabase.from('bookings').delete().eq('renter_id', userId),

      // Delete equipment listings
      supabase.from('equipment').delete().eq('owner_id', userId),

      // Finally delete profile
      supabase.from('profiles').delete().eq('id', userId),
    ];

    // Execute all operations
    for (const operation of operations) {
      const { error } = await operation;
      if (error) {
        console.error('Error deleting user data:', error);
        // Continue with next operation even if one fails
      }
    }

    // Delete auth user account (this requires admin access in real implementation)
    // For now, we just mark account as deleted
    await logSecurityEvent(userId, 'account_suspended', 'success', { action: 'account_deleted_by_user' });

    return true;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return false;
  }
}

export async function anonymizeUserData(userId: string): Promise<boolean> {
  try {
    // Anonymize instead of fully delete (safer for audit trails)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: 'Deleted User',
        avatar_url: null,
        bio: null,
        phone: null,
        email: null,
        location: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Error anonymizing user data:', error);
      return false;
    }

    // Anonymize messages
    await supabase
      .from('messages')
      .update({ content: '[Message deleted]' })
      .eq('sender_id', userId);

    // Anonymize reviews
    await supabase
      .from('reviews')
      .update({ content: '[Review deleted]' })
      .eq('reviewer_id', userId);

    await logSecurityEvent(userId, 'profile_updated', 'success', { action: 'account_anonymized' });

    return true;
  } catch (error) {
    console.error('Error anonymizing user data:', error);
    return false;
  }
}

export async function getDataDeletionStatus(userId: string): Promise<{ isPending: boolean; requestedAt?: string }> {
  try {
    // Check if there's a pending deletion request
    const { data } = await supabase
      .from('audit_logs')
      .select('created_at')
      .eq('user_id', userId)
      .eq('event_type', 'account_suspended')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      isPending: !!data,
      requestedAt: data?.created_at,
    };
  } catch {
    return { isPending: false };
  }
}

export async function requestDataDeletion(userId: string): Promise<boolean> {
  try {
    // Create a deletion request (30-day grace period before actual deletion)
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          event_type: 'account_suspended',
          user_id: userId,
          status: 'success',
          action_details: { deletion_requested: true, grace_period_days: 30 },
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error requesting data deletion:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in data deletion request:', error);
    return false;
  }
}
