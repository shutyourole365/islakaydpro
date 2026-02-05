import { supabase } from '../lib/supabase';
import { sanitizeInput } from '../utils/validation';
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
    // Sanitize search input to prevent SQL injection
    const sanitizedSearch = sanitizeInput(filters.search);
    query = query.or(`title.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%,brand.ilike.%${sanitizedSearch}%`);
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
    // Sanitize location input to prevent SQL injection
    const sanitizedLocation = sanitizeInput(filters.location);
    query = query.ilike('location', `%${sanitizedLocation}%`);
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
    }, (payload) => {
      callback(payload.new as unknown as Notification);
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
    }, (payload) => {
      callback(payload.new as unknown as Message);
    })
    .subscribe();
}

// ============================================
// Trust Score Functions
// ============================================

export async function getUserTrustScore(userId: string): Promise<{
  total: number;
  breakdown: {
    verification: number;
    rating: number;
    rentals: number;
    reviews: number;
    security: number;
  };
  level: string;
}> {
  const profile = await getProfile(userId);
  if (!profile) {
    return {
      total: 0,
      breakdown: { verification: 0, rating: 0, rentals: 0, reviews: 0, security: 0 },
      level: 'new'
    };
  }

  const breakdown = {
    verification: profile.is_verified ? 20 : 0,
    rating: Math.min(25, (profile.rating || 0) * 5),
    rentals: Math.min(25, (profile.total_rentals || 0) * 0.3),
    reviews: Math.min(15, (profile.total_reviews || 0) * 0.5),
    security: profile.two_factor_enabled ? 15 : 5,
  };

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);

  let level = 'new';
  if (total >= 90) level = 'excellent';
  else if (total >= 75) level = 'good';
  else if (total >= 50) level = 'fair';
  else if (total >= 25) level = 'building';

  return { total, breakdown, level };
}

// ============================================
// Smart Alerts Functions
// ============================================

export interface SmartAlert {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'unread' | 'read' | 'dismissed';
  equipment_id?: string;
  booking_id?: string;
  data?: Record<string, unknown>;
  created_at: string;
  action_url?: string;
}

export async function getUserAlerts(userId: string, filters?: {
  type?: string;
  priority?: string;
  status?: string;
  limit?: number;
}): Promise<SmartAlert[]> {
  let query = supabase
    .from('smart_alerts')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'dismissed')
    .order('created_at', { ascending: false });

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  await supabase
    .from('smart_alerts')
    .update({ status: 'read' })
    .eq('id', alertId);
}

export async function dismissAlert(alertId: string): Promise<void> {
  await supabase
    .from('smart_alerts')
    .update({ status: 'dismissed' })
    .eq('id', alertId);
}

export async function createAlert(alert: Omit<SmartAlert, 'id' | 'created_at'>): Promise<SmartAlert | null> {
  const { data, error } = await supabase
    .from('smart_alerts')
    .insert(alert)
    .select()
    .single();

  if (error) return null;
  return data;
}

// ============================================
// Equipment Bundle Functions
// ============================================

export interface EquipmentBundle {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  equipment_ids: string[];
  discount_percentage: number;
  original_daily_rate: number;
  discounted_daily_rate: number;
  min_rental_days: number;
  max_rental_days: number;
  is_active: boolean;
  created_at: string;
}

export async function getEquipmentBundles(filters?: {
  ownerId?: string;
  isActive?: boolean;
  limit?: number;
}): Promise<EquipmentBundle[]> {
  let query = supabase
    .from('equipment_bundles')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.ownerId) {
    query = query.eq('owner_id', filters.ownerId);
  }
  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function createEquipmentBundle(bundle: Omit<EquipmentBundle, 'id' | 'created_at'>): Promise<EquipmentBundle | null> {
  const { data, error } = await supabase
    .from('equipment_bundles')
    .insert(bundle)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function updateEquipmentBundle(bundleId: string, updates: Partial<EquipmentBundle>): Promise<EquipmentBundle | null> {
  const { data, error } = await supabase
    .from('equipment_bundles')
    .update(updates)
    .eq('id', bundleId)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteEquipmentBundle(bundleId: string): Promise<boolean> {
  const { error } = await supabase
    .from('equipment_bundles')
    .delete()
    .eq('id', bundleId);

  return !error;
}

// ============================================
// Warranty Functions
// ============================================

export interface EquipmentWarrantyRecord {
  id: string;
  equipment_id: string;
  warranty_type: 'manufacturer' | 'extended' | 'third_party';
  provider: string;
  coverage_details: string;
  start_date: string;
  end_date: string;
  claim_contact?: string;
  claim_phone?: string;
  documents?: string[];
  status: 'active' | 'expired' | 'claimed';
  created_at: string;
}

export async function getEquipmentWarranties(equipmentId?: string, ownerId?: string): Promise<EquipmentWarrantyRecord[]> {
  let query = supabase
    .from('equipment_warranties')
    .select('*, equipment:equipment(*)')
    .order('end_date', { ascending: true });

  if (equipmentId) {
    query = query.eq('equipment_id', equipmentId);
  }
  if (ownerId) {
    query = query.eq('equipment.owner_id', ownerId);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function createWarranty(warranty: Omit<EquipmentWarrantyRecord, 'id' | 'created_at'>): Promise<EquipmentWarrantyRecord | null> {
  const { data, error } = await supabase
    .from('equipment_warranties')
    .insert(warranty)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function updateWarranty(warrantyId: string, updates: Partial<EquipmentWarrantyRecord>): Promise<EquipmentWarrantyRecord | null> {
  const { data, error } = await supabase
    .from('equipment_warranties')
    .update(updates)
    .eq('id', warrantyId)
    .select()
    .single();

  if (error) return null;
  return data;
}

// ============================================
// Bulk Booking Functions
// ============================================

export interface BulkBookingRecord {
  id: string;
  renter_id: string;
  items: Array<{
    equipment_id: string;
    start_date: string;
    end_date: string;
    quantity: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount_amount: number;
  service_fee: number;
  total_deposit: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  booking_status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export async function createBulkBooking(booking: Omit<BulkBookingRecord, 'id' | 'created_at'>): Promise<BulkBookingRecord | null> {
  const { data, error } = await supabase
    .from('bulk_bookings')
    .insert(booking)
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function getUserBulkBookings(userId: string): Promise<BulkBookingRecord[]> {
  const { data, error } = await supabase
    .from('bulk_bookings')
    .select('*')
    .eq('renter_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// ============================================
// Marketplace Insights Functions
// ============================================

export interface MarketplaceInsight {
  totalListings: number;
  totalRentals: number;
  averageRating: number;
  topCategories: Array<{ name: string; count: number }>;
  priceRange: { min: number; max: number; avg: number };
  trendings: Equipment[];
}

export async function getMarketplaceInsights(): Promise<MarketplaceInsight> {
  // Get equipment count
  const { count: totalListings } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Get booking count
  const { count: totalRentals } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  // Get categories with counts
  const { data: categories } = await supabase
    .from('categories')
    .select('name, equipment_count')
    .order('equipment_count', { ascending: false })
    .limit(5);

  // Get trending equipment
  const { data: trending } = await supabase
    .from('equipment')
    .select('*')
    .eq('is_active', true)
    .order('total_bookings', { ascending: false })
    .limit(5);

  return {
    totalListings: totalListings || 0,
    totalRentals: totalRentals || 0,
    averageRating: 4.5, // Calculate from actual data
    topCategories: categories?.map(c => ({ name: c.name, count: c.equipment_count || 0 })) || [],
    priceRange: { min: 50, max: 2000, avg: 350 }, // Calculate from actual data
    trendings: trending || [],
  };
}

// ============================================
// Price Tracking Functions
// ============================================

export async function trackPriceChange(equipmentId: string, oldPrice: number, newPrice: number): Promise<void> {
  // Get users who favorited this equipment
  const { data: favorites } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('equipment_id', equipmentId);

  if (!favorites || favorites.length === 0) return;

  // Create price drop alerts for each user
  if (newPrice < oldPrice) {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    
    for (const fav of favorites) {
      await createAlert({
        user_id: fav.user_id,
        type: 'price_drop',
        title: 'Price Drop Alert!',
        message: `An item in your favorites is now ${discount}% cheaper!`,
        priority: 'high',
        status: 'unread',
        equipment_id: equipmentId,
        data: { oldPrice, newPrice, discount },
        action_url: `/equipment/${equipmentId}`,
      });
    }
  }
}

