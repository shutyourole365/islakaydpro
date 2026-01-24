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
  last_login: string | null;
  account_status: 'active' | 'suspended' | 'banned';
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

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
  id: string;
  owner_id: string;
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
  id: string;
  equipment_id: string;
  renter_id: string;
  owner_id: string;
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
  created_at: string;
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
