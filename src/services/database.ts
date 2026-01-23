import { supabase } from '../lib/supabase';
import type {
  Profile,
  Equipment,
  Booking,
  Category,
  Review,
  Favorite,
  Notification,
  Conversation,
  Message,
  UserAnalytics,
  EquipmentAnalytics,
  EquipmentAvailability,
  SavedSearch,
  VerificationRequest,
} from '../types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function getEquipment(filters?: {
  categoryId?: string;
  ownerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ data: Equipment[]; count: number }> {
  let query = supabase
    .from('equipment')
    .select('*, owner:profiles(*), category:categories(*)', { count: 'exact' })
    .eq('is_active', true);

  if (filters?.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
  }
  if (filters?.minPrice !== undefined) {
    query = query.gte('daily_rate', filters.minPrice);
  }
  if (filters?.maxPrice !== undefined) {
    query = query.lte('daily_rate', filters.maxPrice);
  }
  if (filters?.condition) {
    query = query.eq('condition', filters.condition);
  }
  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters?.featured) {
    query = query.eq('is_featured', true);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: data || [], count: count || 0 };
}

export async function getEquipmentById(id: string): Promise<Equipment | null> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*, owner:profiles(*), category:categories(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    await incrementEquipmentViews(id);
  }

  return data;
}

export async function createEquipment(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews' | 'total_bookings'>): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .insert(equipment)
    .select('*, owner:profiles(*), category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
  const { data, error } = await supabase
    .from('equipment')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, owner:profiles(*), category:categories(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEquipment(id: string): Promise<void> {
  const { error } = await supabase
    .from('equipment')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

async function incrementEquipmentViews(equipmentId: string): Promise<void> {
  try {
    await supabase.rpc('increment_view_count', { equipment_id: equipmentId });
  } catch {
    // Silently ignore view count errors
  }
}

export async function getBookings(filters: {
  renterId?: string;
  ownerId?: string;
  equipmentId?: string;
  status?: Booking['status'];
  limit?: number;
}): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select('*, equipment:equipment(*, owner:profiles(*)), renter:profiles!bookings_renter_id_fkey(*)');

  if (filters.renterId) {
    query = query.eq('renter_id', filters.renterId);
  }
  if (filters.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }
  if (filters.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, equipment:equipment(*, owner:profiles(*)), renter:profiles!bookings_renter_id_fkey(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select('*, equipment:equipment(*, owner:profiles(*)), renter:profiles!bookings_renter_id_fkey(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*, equipment:equipment(*, owner:profiles(*)), renter:profiles!bookings_renter_id_fkey(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function getEquipmentAvailability(equipmentId: string, startDate?: string, endDate?: string): Promise<EquipmentAvailability[]> {
  let query = supabase
    .from('equipment_availability')
    .select('*')
    .eq('equipment_id', equipmentId);

  if (startDate) {
    query = query.gte('end_date', startDate);
  }
  if (endDate) {
    query = query.lte('start_date', endDate);
  }

  query = query.order('start_date');

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function checkAvailability(equipmentId: string, startDate: string, endDate: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('equipment_availability')
    .select('id')
    .eq('equipment_id', equipmentId)
    .lte('start_date', endDate)
    .gte('end_date', startDate)
    .limit(1);

  if (error) throw error;
  return !data || data.length === 0;
}

export async function blockDates(equipmentId: string, startDate: string, endDate: string, reason: EquipmentAvailability['reason']): Promise<EquipmentAvailability> {
  const { data, error } = await supabase
    .from('equipment_availability')
    .insert({ equipment_id: equipmentId, start_date: startDate, end_date: endDate, reason })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unblockDates(id: string): Promise<void> {
  const { error } = await supabase
    .from('equipment_availability')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getReviews(filters: {
  equipmentId?: string;
  reviewerId?: string;
  revieweeId?: string;
  limit?: number;
}): Promise<Review[]> {
  let query = supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)');

  if (filters.equipmentId) {
    query = query.eq('equipment_id', filters.equipmentId);
  }
  if (filters.reviewerId) {
    query = query.eq('reviewer_id', filters.reviewerId);
  }
  if (filters.revieweeId) {
    query = query.eq('reviewee_id', filters.revieweeId);
  }

  query = query.order('created_at', { ascending: false });

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'response'>): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, equipment:equipment(*, owner:profiles(*), category:categories(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addFavorite(userId: string, equipmentId: string): Promise<Favorite> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, equipment_id: equipmentId })
    .select('*, equipment:equipment(*)')
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(userId: string, equipmentId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('equipment_id', equipmentId);

  if (error) throw error;
}

export async function isFavorite(userId: string, equipmentId: string): Promise<boolean> {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('equipment_id', equipmentId)
    .maybeSingle();

  return !!data;
}

export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  query = query.order('created_at', { ascending: false }).limit(50);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select(`
      conversation:conversations(
        *,
        equipment:equipment(*),
        messages(*, sender:profiles!messages_sender_id_fkey(*))
      )
    `)
    .eq('user_id', userId)
    .order('conversation(updated_at)', { ascending: false });

  if (error) throw error;

  return (data || []).map(d => d.conversation).filter(Boolean) as unknown as Conversation[];
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function sendMessage(message: {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  equipmentId?: string;
}): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: message.conversationId,
      sender_id: message.senderId,
      receiver_id: message.receiverId,
      content: message.content,
      equipment_id: message.equipmentId,
    })
    .select('*, sender:profiles!messages_sender_id_fkey(*)')
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', message.conversationId);

  return data;
}

export async function createConversation(participants: string[], equipmentId?: string): Promise<Conversation> {
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ equipment_id: equipmentId })
    .select()
    .single();

  if (convError) throw convError;

  const participantInserts = participants.map(userId => ({
    conversation_id: conversation.id,
    user_id: userId,
  }));

  const { error: partError } = await supabase
    .from('conversation_participants')
    .insert(participantInserts);

  if (partError) throw partError;

  return conversation;
}

export async function getUserAnalytics(userId: string): Promise<UserAnalytics | null> {
  const { data, error } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getEquipmentAnalytics(equipmentId: string): Promise<EquipmentAnalytics | null> {
  const { data, error } = await supabase
    .from('equipment_analytics')
    .select('*')
    .eq('equipment_id', equipmentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function saveSearch(search: Omit<SavedSearch, 'id' | 'created_at' | 'last_alert_at'>): Promise<SavedSearch> {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert(search)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSavedSearch(id: string): Promise<void> {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function submitVerificationRequest(request: {
  userId: string;
  verificationType: VerificationRequest['verification_type'];
  documentUrls: string[];
}): Promise<VerificationRequest> {
  const { data, error } = await supabase
    .from('verification_requests')
    .insert({
      user_id: request.userId,
      verification_type: request.verificationType,
      document_urls: request.documentUrls,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVerificationRequests(userId: string): Promise<VerificationRequest[]> {
  const { data, error } = await supabase
    .from('verification_requests')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function logAuditEvent(event: {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await supabase
      .from('audit_logs')
      .insert({
        user_id: event.userId,
        action: event.action,
        entity_type: event.entityType,
        entity_id: event.entityId,
        metadata: event.metadata || {},
      });
  } catch {
    // Silently ignore audit log errors
  }
}

export function subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
  return supabase
    .channel(`notifications:${userId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, payload => {
      callback(payload.new as Notification);
    })
    .subscribe();
}

export function subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, payload => {
      callback(payload.new as Message);
    })
    .subscribe();
}
