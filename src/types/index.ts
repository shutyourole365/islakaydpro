export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  is_verified: boolean;
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
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  equipment_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  equipment_id: string;
  created_at: string;
  equipment?: Equipment;
}

export interface SearchFilters {
  query: string;
  category: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  condition: string;
  sortBy: string;
}
