/*
  # Islakayd Equipment Rental Platform Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `location` (text)
      - `phone` (text)
      - `is_verified` (boolean)
      - `rating` (numeric)
      - `total_reviews` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `categories` - Equipment categories
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `image_url` (text)
      - `equipment_count` (integer)
      - `created_at` (timestamptz)
    
    - `equipment` - Equipment listings
      - `id` (uuid, primary key)
      - `owner_id` (uuid, references profiles)
      - `category_id` (uuid, references categories)
      - `title` (text)
      - `description` (text)
      - `brand` (text)
      - `model` (text)
      - `condition` (text)
      - `daily_rate` (numeric)
      - `weekly_rate` (numeric)
      - `monthly_rate` (numeric)
      - `deposit_amount` (numeric)
      - `location` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `images` (text array)
      - `features` (text array)
      - `specifications` (jsonb)
      - `availability_status` (text)
      - `min_rental_days` (integer)
      - `max_rental_days` (integer)
      - `rating` (numeric)
      - `total_reviews` (integer)
      - `total_bookings` (integer)
      - `is_featured` (boolean)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `bookings` - Rental bookings
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `renter_id` (uuid, references profiles)
      - `owner_id` (uuid, references profiles)
      - `start_date` (date)
      - `end_date` (date)
      - `total_days` (integer)
      - `daily_rate` (numeric)
      - `subtotal` (numeric)
      - `service_fee` (numeric)
      - `deposit_amount` (numeric)
      - `total_amount` (numeric)
      - `status` (text)
      - `payment_status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `reviews` - Equipment and user reviews
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `equipment_id` (uuid, references equipment)
      - `reviewer_id` (uuid, references profiles)
      - `reviewee_id` (uuid, references profiles)
      - `rating` (integer)
      - `title` (text)
      - `comment` (text)
      - `response` (text)
      - `is_equipment_review` (boolean)
      - `created_at` (timestamptz)
    
    - `favorites` - User saved equipment
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `equipment_id` (uuid, references equipment)
      - `created_at` (timestamptz)
    
    - `messages` - User messaging
      - `id` (uuid, primary key)
      - `conversation_id` (uuid)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `equipment_id` (uuid, references equipment)
      - `content` (text)
      - `is_read` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  phone text,
  is_verified boolean DEFAULT false,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  image_url text,
  equipment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  brand text,
  model text,
  condition text DEFAULT 'excellent',
  daily_rate numeric(10,2) NOT NULL,
  weekly_rate numeric(10,2),
  monthly_rate numeric(10,2),
  deposit_amount numeric(10,2) DEFAULT 0,
  location text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  images text[] DEFAULT '{}',
  features text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  availability_status text DEFAULT 'available',
  min_rental_days integer DEFAULT 1,
  max_rental_days integer DEFAULT 30,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  total_bookings integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment is viewable by everyone"
  ON equipment FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  renter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_days integer NOT NULL,
  daily_rate numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  service_fee numeric(10,2) DEFAULT 0,
  deposit_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings as renter"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id);

CREATE POLICY "Users can view their own bookings as owner"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Renters can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = renter_id AND status = 'pending')
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  response text,
  is_equipment_review boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, equipment_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id);

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
CREATE INDEX IF NOT EXISTS idx_equipment_daily_rate ON equipment(daily_rate);
CREATE INDEX IF NOT EXISTS idx_equipment_rating ON equipment(rating);
CREATE INDEX IF NOT EXISTS idx_equipment_featured ON equipment(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON bookings(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_reviews_equipment ON reviews(equipment_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, image_url) VALUES
  ('Construction', 'construction', 'Heavy machinery and construction equipment', 'HardHat', 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg'),
  ('Power Tools', 'power-tools', 'Drills, saws, and electric tools', 'Drill', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'),
  ('Landscaping', 'landscaping', 'Lawn care and garden equipment', 'Trees', 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg'),
  ('Photography', 'photography', 'Cameras, lenses, and lighting', 'Camera', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'),
  ('Audio & Video', 'audio-video', 'Sound systems and video equipment', 'Speaker', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg'),
  ('Vehicles', 'vehicles', 'Trucks, trailers, and transportation', 'Truck', 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg'),
  ('Medical', 'medical', 'Medical and healthcare equipment', 'Heart', 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg'),
  ('Industrial', 'industrial', 'Factory and manufacturing tools', 'Factory', 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg'),
  ('Sports & Fitness', 'sports-fitness', 'Exercise and sports equipment', 'Dumbbell', 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'),
  ('Events', 'events', 'Party and event supplies', 'PartyPopper', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'),
  ('Electronics', 'electronics', 'Computers, drones, and tech gear', 'Laptop', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'),
  ('Cleaning', 'cleaning', 'Professional cleaning equipment', 'Sparkles', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg')
ON CONFLICT (slug) DO NOTHING;/*
  # Security and Performance Fixes

  1. New Indexes
    - Add missing indexes on foreign keys for better query performance:
      - `favorites.equipment_id`
      - `messages.equipment_id`
      - `messages.sender_id`
      - `reviews.booking_id`
      - `reviews.reviewee_id`
      - `reviews.reviewer_id`

  2. RLS Policy Optimizations
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row, improving performance at scale

  3. Security
    - All changes maintain existing security model
    - No data modifications
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favorites_equipment_id ON favorites(equipment_id);
CREATE INDEX IF NOT EXISTS idx_messages_equipment_id ON messages(equipment_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- PART 2: Optimize RLS Policies for Profiles
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================
-- PART 3: Optimize RLS Policies for Equipment
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;
CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================
-- PART 4: Optimize RLS Policies for Bookings
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings as renter" ON bookings;
CREATE POLICY "Users can view their own bookings as renter"
  ON bookings FOR SELECT
  TO authenticated
  USING (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own bookings as owner" ON bookings;
CREATE POLICY "Users can view their own bookings as owner"
  ON bookings FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Renters can update their pending bookings" ON bookings;
CREATE POLICY "Renters can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (renter_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Owners can update booking status" ON bookings;
CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================
-- PART 5: Optimize RLS Policies for Reviews
-- ============================================

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (select auth.uid()))
  WITH CHECK (reviewer_id = (select auth.uid()));

-- ============================================
-- PART 6: Optimize RLS Policies for Favorites
-- ============================================

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;
CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 7: Optimize RLS Policies for Messages
-- ============================================

DROP POLICY IF EXISTS "Users can view messages they sent" ON messages;
CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view messages they received" ON messages;
CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (receiver_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Receivers can mark messages as read" ON messages;
CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = (select auth.uid()))
  WITH CHECK (receiver_id = (select auth.uid()));
/*
  # Security and Performance Fixes v2

  This migration re-applies all security and performance fixes to ensure they take effect.

  1. New Indexes on Foreign Keys
    - `idx_favorites_equipment_id` on favorites(equipment_id)
    - `idx_messages_equipment_id` on messages(equipment_id)
    - `idx_messages_sender_id` on messages(sender_id)
    - `idx_reviews_booking_id` on reviews(booking_id)
    - `idx_reviews_reviewee_id` on reviews(reviewee_id)
    - `idx_reviews_reviewer_id` on reviews(reviewer_id)

  2. RLS Policy Optimizations
    - All policies updated to use `(select auth.uid())` for better performance
    - Prevents re-evaluation of auth functions for each row

  3. Security
    - No changes to security model
    - No data modifications
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

DROP INDEX IF EXISTS idx_favorites_equipment_id;
CREATE INDEX idx_favorites_equipment_id ON favorites(equipment_id);

DROP INDEX IF EXISTS idx_messages_equipment_id;
CREATE INDEX idx_messages_equipment_id ON messages(equipment_id);

DROP INDEX IF EXISTS idx_messages_sender_id;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

DROP INDEX IF EXISTS idx_reviews_booking_id;
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

DROP INDEX IF EXISTS idx_reviews_reviewee_id;
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

DROP INDEX IF EXISTS idx_reviews_reviewer_id;
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- PART 2: Recreate RLS Policies for Profiles
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================
-- PART 3: Recreate RLS Policies for Equipment
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;

CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================
-- PART 4: Recreate RLS Policies for Bookings
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings as renter" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings as owner" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Renters can update their pending bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can update booking status" ON bookings;

CREATE POLICY "Users can view their own bookings as renter"
  ON bookings FOR SELECT
  TO authenticated
  USING (renter_id = (select auth.uid()));

CREATE POLICY "Users can view their own bookings as owner"
  ON bookings FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = (select auth.uid()));

CREATE POLICY "Renters can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (renter_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (renter_id = (select auth.uid()));

CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================
-- PART 5: Recreate RLS Policies for Reviews
-- ============================================

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = (select auth.uid()));

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (select auth.uid()))
  WITH CHECK (reviewer_id = (select auth.uid()));

-- ============================================
-- PART 6: Recreate RLS Policies for Favorites
-- ============================================

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 7: Recreate RLS Policies for Messages
-- ============================================

DROP POLICY IF EXISTS "Users can view messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can view messages they received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON messages;

CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()));

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (receiver_id = (select auth.uid()));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = (select auth.uid()))
  WITH CHECK (receiver_id = (select auth.uid()));
/*
  # Advanced Security, Analytics, and Features Enhancement
  
  1. New Tables
    - `audit_logs` - Security audit trail for all user actions
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for anonymous actions)
      - `action` (text) - action performed
      - `entity_type` (text) - type of entity affected
      - `entity_id` (uuid, nullable)
      - `ip_address` (text)
      - `user_agent` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
    
    - `user_sessions` - Track active user sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `device_info` (jsonb)
      - `ip_address` (text)
      - `last_active` (timestamp)
      - `expires_at` (timestamp)
      - `is_active` (boolean)
    
    - `notifications` - In-app notification system
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - notification type
      - `title` (text)
      - `message` (text)
      - `data` (jsonb)
      - `is_read` (boolean)
      - `created_at` (timestamp)
    
    - `conversations` - Group messages into conversations
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, nullable)
      - `booking_id` (uuid, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conversation_participants` - Track conversation members
      - `id` (uuid, primary key)
      - `conversation_id` (uuid)
      - `user_id` (uuid)
      - `last_read_at` (timestamp)
    
    - `user_analytics` - Track user engagement metrics
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `total_rentals` (integer)
      - `total_spent` (decimal)
      - `total_earned` (decimal)
      - `equipment_listed` (integer)
      - `reviews_given` (integer)
      - `reviews_received` (integer)
      - `avg_rating_given` (decimal)
      - `avg_rating_received` (decimal)
      - `last_active` (timestamp)
      - `updated_at` (timestamp)
    
    - `equipment_analytics` - Track equipment performance
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `view_count` (integer)
      - `favorite_count` (integer)
      - `booking_count` (integer)
      - `total_revenue` (decimal)
      - `avg_rental_duration` (decimal)
      - `updated_at` (timestamp)
    
    - `verification_requests` - User verification workflow
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `verification_type` (text) - id, address, phone, business
      - `document_urls` (text[])
      - `status` (text) - pending, approved, rejected
      - `reviewer_notes` (text)
      - `reviewed_by` (uuid, nullable)
      - `submitted_at` (timestamp)
      - `reviewed_at` (timestamp)
    
    - `equipment_availability` - Block out dates for equipment
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text) - booked, maintenance, unavailable
      - `booking_id` (uuid, nullable)
    
    - `saved_searches` - User saved search preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `filters` (jsonb)
      - `alert_enabled` (boolean)
      - `created_at` (timestamp)
    
    - `platform_settings` - Global platform configuration
      - `key` (text, primary key)
      - `value` (jsonb)
      - `updated_at` (timestamp)
      - `updated_by` (uuid)
  
  2. Profile Enhancements
    - Add `is_admin` boolean for admin access
    - Add `two_factor_enabled` boolean
    - Add `email_verified` boolean
    - Add `phone_verified` boolean
    - Add `last_login` timestamp
    - Add `account_status` text (active, suspended, banned)
  
  3. Security
    - RLS enabled on all new tables
    - Audit logs readable only by admins
    - User-specific data isolation
    - Secure verification workflow
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'active';
  END IF;
END $$;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  last_active timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = true;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view own participation"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own participation"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Update messages to link to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  END IF;
END $$;

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_rentals integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  total_earned decimal(10,2) DEFAULT 0,
  equipment_listed integer DEFAULT 0,
  reviews_given integer DEFAULT 0,
  reviews_received integer DEFAULT 0,
  avg_rating_given decimal(3,2) DEFAULT 0,
  avg_rating_received decimal(3,2) DEFAULT 0,
  profile_views integer DEFAULT 0,
  response_rate decimal(5,2) DEFAULT 0,
  avg_response_time_hours decimal(10,2) DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Public analytics viewable by all"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Equipment analytics table
CREATE TABLE IF NOT EXISTS equipment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL UNIQUE REFERENCES equipment(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  booking_count integer DEFAULT 0,
  inquiry_count integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  avg_rental_duration decimal(10,2) DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_analytics_equipment_id ON equipment_analytics(equipment_id);

ALTER TABLE equipment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment analytics viewable by owner"
  ON equipment_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_analytics.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment analytics viewable by admins"
  ON equipment_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type text NOT NULL,
  document_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status) WHERE status = 'pending';

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own verification requests"
  ON verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Equipment availability table
CREATE TABLE IF NOT EXISTS equipment_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_equipment ON equipment_availability(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_availability_dates ON equipment_availability(equipment_id, start_date, end_date);

ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment availability viewable by all authenticated"
  ON equipment_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Equipment owners can manage availability"
  ON equipment_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment owners can update availability"
  ON equipment_availability FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment owners can delete availability"
  ON equipment_availability FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  alert_enabled boolean DEFAULT false,
  last_alert_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify platform settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('service_fee_percent', '12', 'Platform service fee percentage'),
  ('min_rental_days', '1', 'Minimum rental duration in days'),
  ('max_rental_days', '90', 'Maximum rental duration in days'),
  ('insurance_options', '{"basic": {"rate": 0.05, "coverage": 1000}, "standard": {"rate": 0.08, "coverage": 5000}, "premium": {"rate": 0.12, "coverage": 25000}}', 'Insurance plan configurations'),
  ('featured_listing_fee', '25', 'Fee to feature a listing'),
  ('verification_required_amount', '500', 'Transaction amount requiring verification')
ON CONFLICT (key) DO NOTHING;

-- Create function to auto-create user analytics on profile creation
CREATE OR REPLACE FUNCTION create_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_analytics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_analytics ON profiles;
CREATE TRIGGER on_profile_created_analytics
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_analytics();

-- Create function to auto-create equipment analytics on equipment creation
CREATE OR REPLACE FUNCTION create_equipment_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO equipment_analytics (equipment_id)
  VALUES (NEW.id)
  ON CONFLICT (equipment_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_equipment_created_analytics ON equipment;
CREATE TRIGGER on_equipment_created_analytics
  AFTER INSERT ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION create_equipment_analytics();

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update booking and create availability block
CREATE OR REPLACE FUNCTION on_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO equipment_availability (equipment_id, start_date, end_date, reason, booking_id)
    VALUES (NEW.equipment_id, NEW.start_date, NEW.end_date, 'booked', NEW.id)
    ON CONFLICT DO NOTHING;
    
    UPDATE equipment_analytics
    SET booking_count = booking_count + 1,
        total_revenue = total_revenue + NEW.total_amount,
        updated_at = now()
    WHERE equipment_id = NEW.equipment_id;
    
    UPDATE user_analytics
    SET total_rentals = total_rentals + 1,
        total_spent = total_spent + NEW.total_amount,
        updated_at = now()
    WHERE user_id = NEW.renter_id;
    
    PERFORM create_notification(
      NEW.renter_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking has been confirmed!',
      jsonb_build_object('booking_id', NEW.id, 'equipment_id', NEW.equipment_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
CREATE TRIGGER on_booking_status_change
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION on_booking_confirmed();

-- Create function to send notification on new message
CREATE OR REPLACE FUNCTION on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'new_message',
    'New Message',
    'You have a new message',
    jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION on_new_message();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_equipment_featured ON equipment(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_equipment_rating ON equipment(rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;-- Add email notification infrastructure
-- This migration sets up webhook triggers for booking events

-- Create a function to notify on booking changes
CREATE OR REPLACE FUNCTION notify_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  -- Build the payload
  IF TG_OP = 'DELETE' THEN
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(OLD),
      'old_record', NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
  ELSE
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', NULL
    );
  END IF;

  -- Notify the booking-webhook edge function via pg_notify
  PERFORM pg_notify('booking_changes', payload::text);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking changes
DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_changes();

-- Create table for email logs (for debugging and analytics)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  template text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Index for querying email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- RLS for email logs (admin only)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Create table for email preferences
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  booking_confirmations boolean DEFAULT true,
  booking_reminders boolean DEFAULT true,
  new_messages boolean DEFAULT true,
  new_reviews boolean DEFAULT true,
  price_alerts boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  weekly_digest boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for email preferences
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- RLS for email preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Function to create default email preferences on user signup
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create email preferences on profile creation
DROP TRIGGER IF EXISTS on_profile_created_email_prefs ON profiles;
CREATE TRIGGER on_profile_created_email_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Create scheduled job table for reminders (if using pg_cron)
-- Note: pg_cron must be enabled in Supabase dashboard
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
COMMENT ON TABLE email_logs IS 'Log of all sent emails for debugging';

-- Grant necessary permissions
GRANT SELECT ON email_preferences TO authenticated;
GRANT INSERT, UPDATE ON email_preferences TO authenticated;
-- Add Stripe payment infrastructure
-- This migration adds tables for payments, payouts, and Stripe integration

-- Add Stripe fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_complete boolean DEFAULT false;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_connect ON profiles(stripe_connect_account_id) WHERE stripe_connect_account_id IS NOT NULL;

-- Add Stripe fields to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS payout_id uuid;

-- Create index for Stripe session lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment ON bookings(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_charge_id text,
  payment_method text,
  refunded_amount decimal(10, 2) DEFAULT 0,
  refunded_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount decimal(10, 2) NOT NULL,
  platform_fee decimal(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id text,
  stripe_payout_id text,
  failure_reason text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for payouts
CREATE INDEX IF NOT EXISTS idx_payouts_booking ON payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_owner ON payouts(owner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at DESC);

-- RLS for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Add foreign key for payout_id in bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_payout
FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE SET NULL;

-- Create view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  date_trunc('day', p.created_at) as date,
  count(*) as transaction_count,
  sum(p.amount) as total_amount,
  sum(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as completed_amount,
  sum(CASE WHEN p.status = 'refunded' THEN p.refunded_amount ELSE 0 END) as refunded_amount,
  count(CASE WHEN p.status = 'completed' THEN 1 END) as successful_count,
  count(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count
FROM payments p
GROUP BY date_trunc('day', p.created_at)
ORDER BY date DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON payment_analytics TO authenticated;

-- Create function to update booking payment status
CREATE OR REPLACE FUNCTION update_booking_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE bookings 
    SET 
      payment_status = 'paid',
      status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
      paid_at = now(),
      updated_at = now()
    WHERE id = NEW.booking_id;
  ELSIF NEW.status = 'refunded' THEN
    UPDATE bookings 
    SET 
      payment_status = 'refunded',
      updated_at = now()
    WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment status updates
DROP TRIGGER IF EXISTS on_payment_status_change ON payments;
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_payment();

-- Create function to update booking payout status
CREATE OR REPLACE FUNCTION update_booking_on_payout()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bookings 
  SET 
    payout_status = NEW.status,
    updated_at = now()
  WHERE id = NEW.booking_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payout status updates
DROP TRIGGER IF EXISTS on_payout_status_change ON payouts;
CREATE TRIGGER on_payout_status_change
  AFTER UPDATE OF status ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_payout();

-- Add comments
COMMENT ON TABLE payments IS 'Records of all payment transactions';
COMMENT ON TABLE payouts IS 'Records of payouts to equipment owners';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payments';
COMMENT ON COLUMN profiles.stripe_connect_account_id IS 'Stripe Connect account ID for receiving payouts';

-- Grant necessary permissions
GRANT SELECT ON payments TO authenticated;
GRANT SELECT ON payouts TO authenticated;
-- Push Notifications Infrastructure
-- Migration: Add push notification support

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification logs for analytics
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ids UUID[] DEFAULT '{}',
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT DEFAULT 'general',
  sent_count INTEGER DEFAULT 0,
  total_subscriptions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User notification preferences (extend existing or create new)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Push notification toggles
  push_enabled BOOLEAN DEFAULT true,
  push_booking_requests BOOLEAN DEFAULT true,
  push_booking_updates BOOLEAN DEFAULT true,
  push_messages BOOLEAN DEFAULT true,
  push_reviews BOOLEAN DEFAULT true,
  push_price_alerts BOOLEAN DEFAULT true,
  push_promotions BOOLEAN DEFAULT false,
  push_reminders BOOLEAN DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  -- Timezone
  timezone TEXT DEFAULT 'America/Los_Angeles',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS Policies for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Service role can manage all subscriptions
CREATE POLICY "Service role full access to push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- RLS Policies for notification_logs (admin only)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

CREATE POLICY "Service role full access to notification_logs"
  ON notification_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Function to create default notification preferences on user signup
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to check if user should receive push (respects quiet hours)
CREATE OR REPLACE FUNCTION should_send_push(p_user_id UUID, p_notification_type TEXT DEFAULT 'general')
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs notification_preferences%ROWTYPE;
  v_current_time TIME;
BEGIN
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = p_user_id;
  
  -- If no preferences, allow by default
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check if push is enabled
  IF NOT v_prefs.push_enabled THEN
    RETURN false;
  END IF;
  
  -- Check notification type toggle
  CASE p_notification_type
    WHEN 'booking_request' THEN
      IF NOT v_prefs.push_booking_requests THEN RETURN false; END IF;
    WHEN 'booking_update' THEN
      IF NOT v_prefs.push_booking_updates THEN RETURN false; END IF;
    WHEN 'message' THEN
      IF NOT v_prefs.push_messages THEN RETURN false; END IF;
    WHEN 'review' THEN
      IF NOT v_prefs.push_reviews THEN RETURN false; END IF;
    WHEN 'price_alert' THEN
      IF NOT v_prefs.push_price_alerts THEN RETURN false; END IF;
    WHEN 'promotion' THEN
      IF NOT v_prefs.push_promotions THEN RETURN false; END IF;
    WHEN 'reminder' THEN
      IF NOT v_prefs.push_reminders THEN RETURN false; END IF;
    ELSE
      -- Allow general notifications
      NULL;
  END CASE;
  
  -- Check quiet hours
  IF v_prefs.quiet_hours_enabled THEN
    v_current_time := (now() AT TIME ZONE v_prefs.timezone)::TIME;
    
    IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
      -- Normal case: quiet hours don't span midnight
      IF v_current_time >= v_prefs.quiet_hours_start AND v_current_time < v_prefs.quiet_hours_end THEN
        RETURN false;
      END IF;
    ELSE
      -- Quiet hours span midnight (e.g., 22:00 to 08:00)
      IF v_current_time >= v_prefs.quiet_hours_start OR v_current_time < v_prefs.quiet_hours_end THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated timestamp trigger for preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON notification_preferences;
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Analytics view for notification effectiveness
CREATE OR REPLACE VIEW notification_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  notification_type,
  COUNT(*) AS total_sent,
  SUM(sent_count) AS successful_deliveries,
  SUM(total_subscriptions) AS total_targets,
  ROUND(
    CASE 
      WHEN SUM(total_subscriptions) > 0 
      THEN (SUM(sent_count)::NUMERIC / SUM(total_subscriptions)::NUMERIC) * 100 
      ELSE 0 
    END, 2
  ) AS delivery_rate_percent
FROM notification_logs
GROUP BY DATE_TRUNC('day', created_at), notification_type
ORDER BY date DESC, notification_type;

-- Grant access to the analytics view
GRANT SELECT ON notification_analytics TO authenticated;
