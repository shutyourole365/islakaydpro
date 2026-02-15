export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  is_verified: boolean;
  is_admin: boolean;
  two_factor_enabled: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  identity_verified?: boolean;
  business_verified?: boolean;
  verification_level?: 'none' | 'basic' | 'complete';
  last_login: string | null;
  account_status: 'active' | 'suspended' | 'banned';
  rating: number;
  total_reviews: number;
  total_rentals?: number;
  preferred_payment_methods?: string[];
  notification_preferences?: { email?: boolean; push?: boolean; sms?: boolean };
  created_at: string;
  updated_at: string;
}

// Branded types for better type safety
export type UserId = string & { readonly __brand: 'UserId' };
export type EquipmentId = string & { readonly __brand: 'EquipmentId' };
export type BookingId = string & { readonly __brand: 'BookingId' };
export type Email = string & { readonly __brand: 'Email' };
export type Phone = string & { readonly __brand: 'Phone' };

// Type guards for branded types
export const isUserId = (value: string): value is UserId => typeof value === 'string' && value.length > 0;
export const isEquipmentId = (value: string): value is EquipmentId => typeof value === 'string' && value.length > 0;
export const isBookingId = (value: string): value is BookingId => typeof value === 'string' && value.length > 0;
export const isEmail = (value: string): value is Email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const isPhone = (value: string): value is Phone => /^\+?[\d\s\-\(\)]+$/.test(value);

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  equipment_count: number;
  created_at: string;
}

export interface Equipment {
  id: EquipmentId;
  owner_id: UserId;
  category_id: string | null;
  title: string;
  description: string | null;
  brand: string | null;
  model: string | null;
  condition: string;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  deposit_amount: number;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  availability_status: string;
  min_rental_days: number;
  max_rental_days: number;
  rating: number;
  total_reviews: number;
  total_bookings: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  category?: Category;
}

export interface Booking {
  id: BookingId;
  equipment_id: EquipmentId;
  renter_id: UserId;
  owner_id: UserId;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  service_fee: number;
  deposit_amount: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
  renter?: Profile;
  owner?: Profile;
}

export interface Review {
  id: string;
  booking_id: string | null;
  equipment_id: string | null;
  reviewer_id: string;
  reviewee_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  response: string | null;
  is_equipment_review: boolean;
  equipment_condition?: number;
  communication?: number;
  punctuality?: number;
  created_at: string;
  updated_at?: string;
  reviewer?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string | null;
  sender_id: string;
  receiver_id: string;
  equipment_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Conversation {
  id: string;
  equipment_id: string | null;
  booking_id: string | null;
  created_at: string;
  updated_at: string;
  participants?: ConversationParticipant[];
  messages?: Message[];
  equipment?: Equipment;
  last_message?: Message;
  unread_count?: number;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  last_read_at: string;
  joined_at: string;
  user?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  equipment_id: string;
  created_at: string;
  equipment?: Equipment;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'new_message'
  | 'new_review'
  | 'payment_received'
  | 'verification_approved'
  | 'verification_rejected'
  | 'listing_approved'
  | 'price_alert'
  | 'system';

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: Profile;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_info: {
    browser?: string;
    os?: string;
    device?: string;
  };
  ip_address: string | null;
  last_active: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  total_rentals: number;
  total_spent: number;
  total_earned: number;
  equipment_listed: number;
  reviews_given: number;
  reviews_received: number;
  avg_rating_given: number;
  avg_rating_received: number;
  profile_views: number;
  response_rate: number;
  avg_response_time_hours: number;
  last_active: string;
  updated_at: string;
}

export interface EquipmentAnalytics {
  id: string;
  equipment_id: string;
  view_count: number;
  favorite_count: number;
  booking_count: number;
  inquiry_count: number;
  total_revenue: number;
  avg_rental_duration: number;
  conversion_rate: number;
  updated_at: string;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: 'id' | 'address' | 'phone' | 'business';
  document_urls: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  user?: Profile;
  reviewer?: Profile;
}

export interface EquipmentAvailability {
  id: string;
  equipment_id: string;
  start_date: string;
  end_date: string;
  reason: 'booked' | 'maintenance' | 'unavailable';
  booking_id: string | null;
  created_at: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: SearchFilters;
  alert_enabled: boolean;
  last_alert_at: string | null;
  created_at: string;
}

export interface PlatformSetting {
  key: string;
  value: unknown;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  sortBy: string;
  radius?: number;
  features?: string[];
  availability?: {
    startDate: string;
    endDate: string;
  };
}

export interface DashboardStats {
  activeBookings: number;
  totalSpent: number;
  totalEarned: number;
  savedItems: number;
  reviewsGiven: number;
  reviewsReceived: number;
  equipmentListed: number;
  responseRate: number;
  avgRating: number;
  profileViews: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RevenueData {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  total: number;
  growth: number;
}

export interface BookingCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'booking' | 'blocked' | 'maintenance';
  status?: Booking['status'];
  equipmentId?: string;
  bookingId?: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  rate: number;
  coverage: number;
  features: string[];
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  booking_confirmations: boolean;
  booking_reminders: boolean;
  new_messages: boolean;
  new_reviews: boolean;
  price_alerts: boolean;
  marketing_emails: boolean;
  weekly_digest: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template: string;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  sent_at: string | null;
}

// ============================================
// NEW FEATURES - Equipment Management
// ============================================

export interface EquipmentWarranty {
  id: string;
  equipment_id: string;
  warranty_type: 'manufacturer' | 'extended' | 'third_party';
  provider: string;
  coverage_details: string;
  start_date: string;
  end_date: string;
  claim_contact: string | null;
  claim_phone: string | null;
  documents: string[];
  status: 'active' | 'expired' | 'claimed';
  created_at: string;
  updated_at: string;
  equipment?: Equipment;
}

export interface EquipmentCertification {
  id: string;
  equipment_id: string;
  certification_type: string;
  issuing_authority: string;
  certificate_number: string;
  issue_date: string;
  expiry_date: string;
  document_url: string | null;
  status: 'valid' | 'expired' | 'pending_renewal';
  created_at: string;
  equipment?: Equipment;
}

export interface EquipmentBundle {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  equipment_ids: string[];
  original_total: number;
  bundle_price: number;
  discount_percentage: number;
  min_rental_days: number;
  max_rental_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  equipment?: Equipment[];
  owner?: Profile;
}

// ============================================
// NEW FEATURES - Booking & Transactions
// ============================================

export interface BulkBooking {
  id: string;
  renter_id: string;
  booking_ids: string[];
  total_equipment: number;
  subtotal: number;
  bulk_discount: number;
  service_fee: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  notes: string | null;
  created_at: string;
  updated_at: string;
  bookings?: Booking[];
  renter?: Profile;
}

export interface TransactionHistory {
  id: string;
  user_id: string;
  type: 'payment' | 'refund' | 'deposit' | 'withdrawal' | 'fee';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference_id: string | null;
  reference_type: 'booking' | 'bulk_booking' | 'deposit' | 'withdrawal' | null;
  payment_method: string | null;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================
// NEW FEATURES - Trust & Reputation
// ============================================

export interface RenterTrustScore {
  id: string;
  user_id: string;
  overall_score: number;
  payment_reliability: number;
  equipment_care: number;
  communication: number;
  timeliness: number;
  total_rentals: number;
  perfect_returns: number;
  late_returns: number;
  damage_reports: number;
  disputes: number;
  verification_bonus: number;
  last_calculated: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
}

export interface TrustBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, number>;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: TrustBadge;
  user?: Profile;
}

// ============================================
// NEW FEATURES - Smart Alerts & Insights
// ============================================

export interface SmartAlert {
  id: string;
  user_id: string;
  alert_type: 'price_drop' | 'availability' | 'warranty_expiry' | 'maintenance_due' | 'certification_expiry' | 'market_trend' | 'booking_reminder';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reference_id: string | null;
  reference_type: string | null;
  action_url: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  scheduled_for: string | null;
  created_at: string;
  read_at: string | null;
}

export interface MarketInsight {
  id: string;
  category_id: string | null;
  insight_type: 'demand_trend' | 'price_trend' | 'seasonal_pattern' | 'competitor_analysis';
  title: string;
  description: string;
  data: {
    trend_direction: 'up' | 'down' | 'stable';
    percentage_change: number;
    time_period: string;
    data_points: Array<{ date: string; value: number }>;
    recommendations: string[];
  };
  valid_from: string;
  valid_until: string;
  created_at: string;
  category?: Category;
}

export interface PricingSuggestion {
  id: string;
  equipment_id: string;
  suggested_daily_rate: number;
  suggested_weekly_rate: number;
  suggested_monthly_rate: number;
  current_daily_rate: number;
  market_average: number;
  demand_factor: number;
  competition_factor: number;
  seasonal_factor: number;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  expires_at: string;
  equipment?: Equipment;
}

// ============================================
// NEW FEATURES - Equipment Utilization
// ============================================

export interface EquipmentUtilization {
  id: string;
  equipment_id: string;
  period_start: string;
  period_end: string;
  total_days: number;
  rented_days: number;
  maintenance_days: number;
  available_days: number;
  utilization_rate: number;
  revenue_generated: number;
  unique_renters: number;
  avg_rental_duration: number;
  created_at: string;
  equipment?: Equipment;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  maintenance_type: 'preventive' | 'corrective' | 'inspection' | 'calibration';
  description: string;
  performed_by: string;
  performed_at: string;
  next_due_date: string | null;
  cost: number;
  parts_replaced: string[];
  notes: string | null;
  documents: string[];
  created_at: string;
  equipment?: Equipment;
}

export interface MaintenancePrediction {
  id: string;
  equipment_id: string;
  predicted_date: string;
  maintenance_type: 'preventive' | 'corrective';
  confidence: number;
  based_on: string[];
  estimated_cost: number;
  recommendation: string;
  created_at: string;
  equipment?: Equipment;
}

// ============================================
// NEW FEATURES - Communication
// ============================================

export interface MessageTemplate {
  id: string;
  user_id: string | null;
  name: string;
  subject: string | null;
  content: string;
  category: 'booking' | 'inquiry' | 'reminder' | 'thank_you' | 'custom';
  variables: string[];
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  scheduled_for: string;
  status: 'scheduled' | 'sent' | 'cancelled';
  created_at: string;
  sent_at: string | null;
}
