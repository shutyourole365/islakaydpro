-- Islakayd full schema — all migrations + seed, concatenated in order.
-- Paste into the Supabase SQL Editor of a fresh project and run once.
-- Generated 2026-05-30T05:28:18Z. Do not edit by hand.


-- ============================================================
-- 20260120161308_create_islakayd_schema.sql
-- ============================================================
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
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 20260120164959_fix_security_and_performance_issues.sql
-- ============================================================
/*
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


-- ============================================================
-- 20260120165134_fix_rls_and_indexes_v2.sql
-- ============================================================
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


-- ============================================================
-- 20260123053227_add_security_analytics_and_advanced_features.sql
-- ============================================================
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
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;

-- ============================================================
-- 20260124000000_add_email_notifications.sql
-- ============================================================
-- Add email notification infrastructure
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


-- ============================================================
-- 20260124000001_add_stripe_payments.sql
-- ============================================================
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


-- ============================================================
-- 20260124000002_add_push_notifications.sql
-- ============================================================
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


-- ============================================================
-- 20260203000000_auto_create_profiles.sql
-- ============================================================
-- Create profile automatically when user signs up
-- This fixes the "Database error saving new user" issue

-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to call function when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Update RLS policy to allow service role to insert (for the trigger)
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure authenticated users can still insert their own profile (for manual creation)
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a profile when a new user signs up';


-- ============================================================
-- 20260218120000_add_ai_assistant_pref_to_profiles.sql
-- ============================================================
-- Add ai_assistant_enabled preference to profiles

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true;

-- Backfill existing rows to true where NULL
UPDATE profiles SET ai_assistant_enabled = true WHERE ai_assistant_enabled IS NULL;

COMMENT ON COLUMN profiles.ai_assistant_enabled IS 'User preference: enable LLM-powered AI assistant (true = enabled)';


-- ============================================================
-- 20260321000000_add_disputes_agreements_verification_subscriptions.sql
-- ============================================================
-- ================================================================
-- New Feature Migrations: Disputes, Rental Agreements,
-- ID Verification, Recurring Rentals
-- ================================================================

-- 1. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  opened_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  against_user uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('damage', 'no_show', 'late_return', 'wrong_item', 'payment', 'other')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_renter', 'resolved_owner', 'resolved_split', 'closed')),
  title text NOT NULL,
  description text NOT NULL,
  evidence_urls text[] DEFAULT '{}',
  resolution_notes text,
  deposit_action text CHECK (deposit_action IN ('full_refund', 'partial_refund', 'owner_keeps', 'split')),
  deposit_split_percent integer CHECK (deposit_split_percent BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE TABLE IF NOT EXISTS dispute_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id uuid REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  attachments text[] DEFAULT '{}',
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view disputes they are party to"
  ON disputes FOR SELECT
  USING (auth.uid() = opened_by OR auth.uid() = against_user);

CREATE POLICY "Authenticated users can open disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = opened_by);

CREATE POLICY "Dispute parties can update disputes"
  ON disputes FOR UPDATE
  USING (auth.uid() = opened_by OR auth.uid() = against_user);

CREATE POLICY "Dispute parties can view messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_id
        AND (d.opened_by = auth.uid() OR d.against_user = auth.uid())
    )
  );

CREATE POLICY "Dispute parties can send messages"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM disputes d
      WHERE d.id = dispute_id
        AND (d.opened_by = auth.uid() OR d.against_user = auth.uid())
    )
  );

-- 2. RENTAL AGREEMENTS TABLE
CREATE TABLE IF NOT EXISTS rental_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  renter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  equipment_title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_amount numeric(10,2) NOT NULL,
  deposit_amount numeric(10,2) NOT NULL DEFAULT 0,
  daily_rate numeric(10,2) NOT NULL,
  insurance_plan text,
  special_terms text,
  owner_signed_at timestamptz,
  renter_signed_at timestamptz,
  owner_signature text,
  renter_signature text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'owner_signed', 'fully_signed', 'voided')),
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rental_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agreement parties can view agreements"
  ON rental_agreements FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = renter_id);

CREATE POLICY "System can create agreements"
  ON rental_agreements FOR INSERT
  WITH CHECK (auth.uid() = owner_id OR auth.uid() = renter_id);

CREATE POLICY "Parties can sign agreements"
  ON rental_agreements FOR UPDATE
  USING (auth.uid() = owner_id OR auth.uid() = renter_id);

-- 3. ID VERIFICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS id_verification_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('drivers_license', 'passport', 'national_id', 'state_id')),
  document_url text NOT NULL,
  selfie_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  rejection_reason text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE id_verification_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification docs"
  ON id_verification_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit verification docs"
  ON id_verification_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. RECURRING RENTALS (SUBSCRIPTIONS) TABLE
CREATE TABLE IF NOT EXISTS recurring_rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  renter_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  frequency text NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  rental_days integer NOT NULL DEFAULT 1,
  rate_per_period numeric(10,2) NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'completed')),
  next_billing_date date,
  total_periods_completed integer DEFAULT 0,
  total_amount_paid numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recurring_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renter can view their recurring rentals"
  ON recurring_rentals FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Renter can create recurring rentals"
  ON recurring_rentals FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Parties can update recurring rentals"
  ON recurring_rentals FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_disputes_booking_id ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_opened_by ON disputes(opened_by);
CREATE INDEX IF NOT EXISTS idx_disputes_against_user ON disputes(against_user);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_booking_id ON rental_agreements(booking_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_renter_id ON rental_agreements(renter_id);
CREATE INDEX IF NOT EXISTS idx_rental_agreements_owner_id ON rental_agreements(owner_id);
CREATE INDEX IF NOT EXISTS idx_id_verifications_user_id ON id_verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_renter_id ON recurring_rentals(renter_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_equipment_id ON recurring_rentals(equipment_id);
CREATE INDEX IF NOT EXISTS idx_recurring_rentals_status ON recurring_rentals(status);


-- ============================================================
-- 20260322000000_add_ai_chat_history.sql
-- ============================================================
-- ================================================================
-- AI Chat History
-- Persists Kayd assistant conversations per user session
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  suggestions jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_history_user_session
  ON ai_chat_history(user_id, session_id, created_at);

ALTER TABLE ai_chat_history ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own chat history
CREATE POLICY "Users can read own chat history"
  ON ai_chat_history FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own chat history"
  ON ai_chat_history FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own chat history"
  ON ai_chat_history FOR DELETE
  USING (user_id = (select auth.uid()));


-- ============================================================
-- 20260322000001_create_storage_buckets.sql
-- ============================================================
-- ================================================================
-- Storage Buckets
-- ================================================================

-- Create equipment-images bucket (public so images are accessible without auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'equipment-images',
  'equipment-images',
  true,
  10485760,  -- 10 MB per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload equipment images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'equipment-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own equipment images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own equipment images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'equipment-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to all equipment images
CREATE POLICY "Public can view equipment images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'equipment-images');


-- ============================================================
-- 20260418102009_align_schema_with_codebase.sql
-- ============================================================
-- ============================================================
-- ISLAKAYD SCHEMA ALIGNMENT
-- Creates missing tables so the app code works correctly
-- ============================================================

-- 1. CATEGORIES TABLE (missing entirely)
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

DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- 2. EQUIPMENT TABLE (missing - DB has 'listings' instead)
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

DROP POLICY IF EXISTS "Equipment is viewable by everyone" ON equipment;
CREATE POLICY "Equipment is viewable by everyone"
  ON equipment FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;
CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- 3. FIX BOOKINGS TABLE - add missing columns the code expects
-- Current bookings table has: listing_id, renter_id, owner_id, start_date, end_date, status, total_price
-- Code expects: equipment_id, renter_id, owner_id, start_date, end_date, total_days, daily_rate, subtotal, service_fee, deposit_amount, total_amount, status, payment_status, notes

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee numeric(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;

-- 4. FIX REVIEWS TABLE - add missing columns
-- Current: booking_id, listing_id, rating, comment, reviewer_id, reviewee_id, review_type
-- Code expects: booking_id, equipment_id, reviewer_id, reviewee_id, rating, title, comment, response, is_equipment_review
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_equipment_review boolean DEFAULT true;

-- 5. FIX FAVORITES TABLE - add equipment_id column
-- Current: user_id only (favorites table seems bare)
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE;

-- 6. FIX PROFILES TABLE - add columns the code expects
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true;

-- 7. NOTIFICATIONS TABLE - ensure it has the right columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data jsonb DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read boolean DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 8. INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
CREATE INDEX IF NOT EXISTS idx_equipment_daily_rate ON equipment(daily_rate);
CREATE INDEX IF NOT EXISTS idx_equipment_rating ON equipment(rating);
CREATE INDEX IF NOT EXISTS idx_equipment_featured ON equipment(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_equipment ON reviews(equipment_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_equipment ON favorites(equipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 9. SEED CATEGORIES (Australian-relevant)
INSERT INTO categories (name, slug, description, icon, image_url) VALUES
  ('Construction', 'construction', 'Excavators, bobcats, scaffolding and earthmoving gear', 'HardHat', 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg'),
  ('Power Tools', 'power-tools', 'Drills, saws, grinders and electric tools', 'Drill', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'),
  ('Landscaping', 'landscaping', 'Mowers, aerators, chainsaws and garden equipment', 'Trees', 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg'),
  ('Photography', 'photography', 'Cameras, lenses, drones and lighting rigs', 'Camera', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'),
  ('Trailers & Vehicles', 'trailers-vehicles', 'Box trailers, car trailers, utes and vans', 'Truck', 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg'),
  ('Events & Party', 'events-party', 'Marquees, tables, chairs, audio and lighting', 'PartyPopper', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'),
  ('Cleaning', 'cleaning', 'Pressure washers, carpet cleaners and floor polishers', 'Sparkles', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg'),
  ('Sports & Recreation', 'sports-recreation', 'Camping gear, surfboards, kayaks and fitness equipment', 'Dumbbell', 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg'),
  ('Electronics', 'electronics', 'Projectors, PA systems, drones and tech gear', 'Laptop', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'),
  ('Industrial', 'industrial', 'Forklifts, generators, compressors and welders', 'Factory', 'https://images.pexels.com/photos/1267338/pexels-photo-1267338.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- 10. STRIPE PAYOUTS TABLE (needed by payments service)
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount numeric(10,2) NOT NULL,
  platform_fee numeric(10,2) DEFAULT 0,
  currency text DEFAULT 'aud',
  status text DEFAULT 'pending',
  stripe_transfer_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can view their own payouts" ON payouts;
CREATE POLICY "Owners can view their own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- 11. EQUIPMENT AVAILABILITY TABLE (for calendar blocking)
CREATE TABLE IF NOT EXISTS equipment_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text DEFAULT 'booked',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view availability" ON equipment_availability;
CREATE POLICY "Anyone can view availability"
  ON equipment_availability FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owners can manage availability" ON equipment_availability;
CREATE POLICY "Owners can manage availability"
  ON equipment_availability FOR ALL
  TO authenticated
  USING (
    auth.uid() = (SELECT owner_id FROM equipment WHERE id = equipment_id)
  );

-- 12. CONVERSATIONS TABLE fix (code expects equipment_id, participant_ids)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant_ids uuid[] DEFAULT '{}';
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message text;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at timestamptz;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();


-- ============================================================
-- 20260419000000_create_equipment_payouts.sql
-- ============================================================
-- Migration: Create equipment and payouts tables, seed categories
-- 2026-04-19 equipment-and-payouts

-- ── 1. EQUIPMENT TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id           uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id        uuid REFERENCES categories(id) ON DELETE SET NULL,
  title              text NOT NULL,
  description        text,
  brand              text,
  model              text,
  condition          text DEFAULT 'excellent',
  daily_rate         numeric(10,2) NOT NULL,
  weekly_rate        numeric(10,2),
  monthly_rate       numeric(10,2),
  deposit_amount     numeric(10,2) DEFAULT 0,
  location           text,
  latitude           numeric(10,7),
  longitude          numeric(10,7),
  images             text[]   DEFAULT '{}',
  features           text[]   DEFAULT '{}',
  specifications     jsonb    DEFAULT '{}',
  availability_status text    DEFAULT 'available',
  min_rental_days    integer  DEFAULT 1,
  max_rental_days    integer  DEFAULT 30,
  rating             numeric(3,2) DEFAULT 0,
  total_reviews      integer  DEFAULT 0,
  total_bookings     integer  DEFAULT 0,
  is_featured        boolean  DEFAULT false,
  is_active          boolean  DEFAULT true,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipment_select" ON equipment;
CREATE POLICY "equipment_select" ON equipment FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "equipment_owner_select" ON equipment;
CREATE POLICY "equipment_owner_select" ON equipment FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "equipment_insert" ON equipment;
CREATE POLICY "equipment_insert" ON equipment FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "equipment_update" ON equipment;
CREATE POLICY "equipment_update" ON equipment FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "equipment_delete" ON equipment;
CREATE POLICY "equipment_delete" ON equipment FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

-- ── 2. PAYOUTS TABLE ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id          uuid REFERENCES bookings(id) ON DELETE CASCADE,
  owner_id            uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount              numeric(10,2) NOT NULL,
  platform_fee        numeric(10,2) DEFAULT 0,
  currency            text DEFAULT 'aud',
  status              text DEFAULT 'pending',
  stripe_transfer_id  text,
  created_at          timestamptz DEFAULT now()
);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payouts_select" ON payouts;
CREATE POLICY "payouts_select" ON payouts FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

-- ── 3. ADD MISSING COLUMNS TO EXISTING TABLES ────────────────────────────────
-- bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_id      uuid REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days        integer;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate        numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal          numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee       numeric(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount    numeric(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount      numeric(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status    text DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes             text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at        timestamptz DEFAULT now();
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id         text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id  text;

-- reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS equipment_id       uuid REFERENCES equipment(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title              text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response           text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_equipment_review boolean DEFAULT true;

-- favorites
ALTER TABLE favorites ADD COLUMN IF NOT EXISTS equipment_id     uuid REFERENCES equipment(id) ON DELETE CASCADE;

-- profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio               text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location          text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone             text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified       boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin          boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating            numeric(3,2) DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified    boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified    boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login        timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status    text DEFAULT 'active';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at        timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id  text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_id   text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true;

-- notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id      uuid REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type         text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title        text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS message      text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS data         jsonb DEFAULT '{}';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read      boolean DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at   timestamptz DEFAULT now();

-- ── 4. INDEXES ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_equipment_owner     ON equipment(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category  ON equipment(category_id);
CREATE INDEX IF NOT EXISTS idx_equipment_active    ON equipment(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_bookings_equipment  ON bookings(equipment_id);
CREATE INDEX IF NOT EXISTS idx_favorites_equipment ON favorites(equipment_id);

-- ── 5. SEED CATEGORIES ────────────────────────────────────────────────────────
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Construction',      'construction',       'Excavators, bobcats, scaffolding', 'HardHat'),
  ('Power Tools',       'power-tools',        'Drills, saws, grinders',           'Drill'),
  ('Landscaping',       'landscaping',        'Mowers, chainsaws, garden gear',   'Trees'),
  ('Photography',       'photography',        'Cameras, lenses, drones',          'Camera'),
  ('Trailers & Vehicles','trailers-vehicles', 'Box trailers, utes and vans',      'Truck'),
  ('Events & Party',    'events-party',       'Marquees, tables, chairs, AV',     'PartyPopper'),
  ('Cleaning',          'cleaning',           'Pressure washers, carpet cleaners','Sparkles'),
  ('Sports & Recreation','sports-recreation', 'Camping, kayaks, fitness',         'Dumbbell'),
  ('Electronics',       'electronics',        'Projectors, PA systems, tech',     'Laptop'),
  ('Industrial',        'industrial',         'Forklifts, generators, welders',   'Factory')
ON CONFLICT (slug) DO NOTHING;


-- ============================================================
-- 20260422000000_create_reviews.sql
-- ============================================================
-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  response TEXT,
  is_equipment_review BOOLEAN DEFAULT true,
  equipment_condition INTEGER CHECK (equipment_condition >= 1 AND equipment_condition <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_equipment_id ON reviews(equipment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Prevent duplicate reviews per booking per reviewer
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_booking_reviewer 
  ON reviews(booking_id, reviewer_id) 
  WHERE booking_id IS NOT NULL;

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON reviews;
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Reviewers can update their own reviews (within 48 hours)
DROP POLICY IF EXISTS "Reviewers can update own reviews" ON reviews;
CREATE POLICY "Reviewers can update own reviews" ON reviews
  FOR UPDATE USING (
    auth.uid() = reviewer_id
    AND created_at > NOW() - INTERVAL '48 hours'
  );

-- Equipment owners can add a response (update response field only)
DROP POLICY IF EXISTS "Equipment owners can respond to reviews" ON reviews;
CREATE POLICY "Equipment owners can respond to reviews" ON reviews
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM equipment WHERE id = reviews.equipment_id
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();

-- Function to recalculate equipment rating after review insert/update/delete
CREATE OR REPLACE FUNCTION update_equipment_rating()
RETURNS TRIGGER AS $$
DECLARE
  eq_id UUID;
BEGIN
  eq_id := COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  IF eq_id IS NOT NULL THEN
    UPDATE equipment SET
      rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE equipment_id = eq_id AND is_equipment_review = true
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE equipment_id = eq_id AND is_equipment_review = true
      )
    WHERE id = eq_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_equipment_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_equipment_rating();


-- ============================================================
-- 20260426000000_fix_conversations_participants.sql
-- ============================================================
-- Fix conversations table: add 'participants' uuid[] column
-- MessagingPage.tsx uses .contains('participants', [user.id])
-- but old migration added 'participant_ids' - add both for compatibility

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participants uuid[] DEFAULT '{}';

-- Backfill participants from conversation_participants join table
UPDATE conversations c
SET participants = (
  SELECT ARRAY_AGG(cp.user_id)
  FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
)
WHERE participants = '{}' OR participants IS NULL;

-- RLS: users can only see conversations they're in
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants));

-- Messages: ensure RLS allows participants to see messages
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
CREATE POLICY "Participants can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

DROP POLICY IF EXISTS "Participants can update message read status" ON messages;
CREATE POLICY "Participants can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

-- Index for fast participant lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
-- Note: messages uses 'is_read' not 'read' — partial index omitted to avoid column-not-found error

-- Notifications RLS (ensure user can see their own)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);


-- ============================================================
-- 20260510000000_enable_rls_on_core_tables.sql
-- ============================================================
-- ================================================================
-- Audit Log Table + RLS
-- Creates audit_logs table used by auditLog.ts service
-- Conversations policies already exist using participants[] array column
-- ================================================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  ip_address text DEFAULT 'unknown',
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own audit logs
DROP POLICY IF EXISTS "Allow inserts for audit logging" ON audit_logs;
CREATE POLICY "Allow inserts for audit logging"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Restrict SELECT: only admins via service role (no policy = no access for anon/authenticated)
-- SELECT access is handled at the application/API layer


-- ============================================================
-- 20260513120000_add_referrals.sql
-- ============================================================
-- Referrals feature: add per-user referral code, referrer link, and referrals ledger.

-- 1. profiles columns ------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles(referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Code generator: 12 hex chars (~48 bits) prefixed with ISLAKAYD-. Retries
-- on the very-unlikely unique-index collision so backfill and signup never
-- abort just because of a generator clash.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_attempt INT := 0;
BEGIN
  LOOP
    v_code := 'ISLAKAYD-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 12));
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_attempt := v_attempt + 1;
    IF v_attempt >= 5 THEN
      -- Fall through with the last candidate; the unique index acts as a
      -- final safeguard and the caller can retry.
      EXIT;
    END IF;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Backfill referral_code for existing profiles that don't have one.
UPDATE profiles
SET referral_code = public.generate_referral_code()
WHERE referral_code IS NULL;

-- 2. referrals table -------------------------------------------------------

CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'rewarded')) DEFAULT 'pending',
  reward_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  reward_type TEXT CHECK (reward_type IN ('credit', 'discount', 'premium')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  CONSTRAINT referrals_no_self_refer CHECK (referrer_id <> referred_user_id),
  CONSTRAINT referrals_unique_pair UNIQUE (referrer_id, referred_user_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- 3. RLS -------------------------------------------------------------------

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- A user can read rows where they are either party.
-- Use (select auth.uid()) so PG evaluates it once per statement instead of
-- per row — matches the convention in 20260120165134_fix_rls_and_indexes_v2.
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referred_user_id);

-- Writes happen via the SECURITY DEFINER trigger (handle_new_user) or service role only.
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;
CREATE POLICY "Service role can manage referrals" ON referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. profiles column-write guard ------------------------------------------
-- The existing "Users can update their own profile" policy allows updates
-- to any column on the user's own row. Without this guard a user could
-- self-assign referred_by or rewrite their referral_code, corrupting
-- attribution. Block non-service-role attempts to change either column.

CREATE OR REPLACE FUNCTION public.guard_profile_referral_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Allow trusted server-side contexts:
  --   * supabase service_role JWTs (admin client / edge functions)
  --   * supabase_auth_admin (the role Supabase Auth uses to fire the
  --     on_auth_user_created trigger that calls handle_new_user)
  --   * postgres / no-JWT contexts (migrations, scripts)
  -- End-user requests come in as `authenticated` and skip the bypass.
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role'
     OR session_user IN ('supabase_auth_admin', 'postgres', 'supabase_admin') THEN
    RETURN NEW;
  END IF;

  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'profiles.referral_code is read-only for end users';
  END IF;

  IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'profiles.referred_by is read-only for end users';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_referral_columns ON profiles;
CREATE TRIGGER profiles_guard_referral_columns
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_referral_columns();

-- 5. handle_new_user: assign referral_code + record incoming referral -----

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_ref_code TEXT;
  v_referrer_id UUID;
BEGIN
  v_ref_code := NULLIF(NEW.raw_user_meta_data->>'referral_code', '');

  INSERT INTO public.profiles (id, full_name, referral_code, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    public.generate_referral_code(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
    SET referral_code = COALESCE(profiles.referral_code, EXCLUDED.referral_code);

  IF v_ref_code IS NOT NULL THEN
    SELECT id INTO v_referrer_id
    FROM public.profiles
    WHERE referral_code = v_ref_code
    LIMIT 1;

    IF v_referrer_id IS NOT NULL AND v_referrer_id <> NEW.id THEN
      -- Bypass the column-write guard via service-role-equivalent DEFINER context.
      UPDATE public.profiles SET referred_by = v_referrer_id WHERE id = NEW.id;

      INSERT INTO public.referrals (referrer_id, referred_user_id, status)
      VALUES (v_referrer_id, NEW.id, 'pending')
      ON CONFLICT (referrer_id, referred_user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS
  'Creates a profile for a new auth user, assigns a referral_code, and records the incoming referral if raw_user_meta_data.referral_code matches an existing user.';

COMMENT ON TABLE referrals IS 'One row per signup attributed to a referrer via referral_code.';


-- ============================================================
-- 20260519130000_create_ai_events.sql
-- ============================================================
-- ================================================================
-- AI Events Telemetry
-- Records lightweight events from the Kayd AI assistant so the
-- Admin → AI Telemetry view can analyse engagement and feedback.
-- Event types match the README's documented set; new types can be
-- added without a migration since 'event_type' is plain text.
-- Payload is a flexible jsonb bag so event-specific data (message
-- id, thumbs-up/down, image url, latency) can be stored without
-- schema churn.
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Common access patterns: list a user's own events, admin browses
-- all events filtered by type and time.
CREATE INDEX IF NOT EXISTS idx_ai_events_user_created
  ON ai_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_events_type_created
  ON ai_events(event_type, created_at DESC);

ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- All policies scoped to TO authenticated to match the canonical
-- pattern in 20260124000001_add_stripe_payments.sql. user_id stays
-- nullable on the table for future flexibility (e.g. service-role
-- inserts) but writes from the client require auth.

-- Signed-in users may insert their own events.
CREATE POLICY "Users can insert own ai events"
  ON ai_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Users can read their own events; admins (profiles.is_admin = true)
-- can read everything for the AI Telemetry dashboard.
CREATE POLICY "Users can read own ai events"
  ON ai_events FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can read all ai events"
  ON ai_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );


-- ============================================================
-- 20260520120200_security_hardening_pre_launch.sql
-- ============================================================
-- Security hardening: address advisor warnings flagged on prod (ialxlykysbqyiejepzkx).
--
-- Five fixes, all reversible. See PR description for the per-fix DOWN statements.
--
-- Verified before drafting:
--  - Frontend's only `.rpc(...)` call is `increment_view_count`, which is NOT in
--    the SECURITY DEFINER set — so nothing in the app relies on these privileges.
--  - Frontend does not call `storage.from('equipment-images').list(...)`.
--  - Frontend does not read the `equipment_owner_counts` materialized view.

-- 1. Pin search_path on the two SECURITY INVOKER trigger functions flagged with
--    a mutable search_path. Prevents search_path injection if the trigger ever
--    fires with a manipulated session search_path.
ALTER FUNCTION public.update_reviews_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_equipment_rating() SET search_path = public, pg_temp;

-- 2. Revoke EXECUTE on SECURITY DEFINER trigger functions from anon/authenticated/public.
--    These functions are wired up as triggers; triggers fire as the function owner
--    regardless of EXECUTE grants. The default PostgreSQL grants made them callable
--    as REST RPCs (e.g. `POST /rest/v1/rpc/handle_new_user`), which was never the
--    intent. Triggers continue to work after the revoke; the attack surface is removed.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname || '.' || p.proname || '(' ||
           pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'create_default_email_preferences',
        'create_default_notification_preferences',
        'create_equipment_analytics',
        'create_user_analytics',
        'guard_profile_referral_columns',
        'handle_new_user',
        'notify_booking_changes',
        'on_booking_confirmed',
        'on_new_message',
        'update_booking_on_payment',
        'update_booking_on_payout',
        'update_notification_preferences_updated_at'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated, PUBLIC', fn.sig);
  END LOOP;
END $$;

-- 3. Revoke EXECUTE on server-side SECURITY DEFINER RPCs from anon/authenticated.
--    These are utility functions the frontend never calls. service_role retains
--    EXECUTE so Edge Functions and admin paths keep working.
--    Uses a DO block (same pattern as step 2) so it covers every overload that
--    exists on the target database without hard-coding signatures. Prod and
--    preview have drifted: prod has no-arg overloads of create_notification and
--    log_audit_event that aren't in any migration file (orphan functions
--    created manually via SQL editor — flagged as a follow-up). This loop
--    catches them whether they exist or not.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname || '.' || p.proname || '(' ||
           pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'create_notification',
        'log_audit_event',
        'generate_referral_code',
        'refresh_equipment_owner_counts'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated, PUBLIC', fn.sig);
  END LOOP;
END $$;

-- 4. Drop the overly broad SELECT policy on the equipment-images bucket.
--    `equipment-images` is a public bucket; public URLs served by
--    `/storage/v1/object/public/equipment-images/<path>` do NOT require any
--    storage.objects policy. This policy only enabled clients to *list* files
--    in the bucket via `storage.from('equipment-images').list()`, which leaks
--    every upload. Verified: frontend never calls list() on this bucket.
DROP POLICY IF EXISTS "Public can view equipment images" ON storage.objects;

-- 5. Revoke SELECT on the equipment_owner_counts materialized view from anon/authenticated.
--    Refreshed by the `refresh_equipment_owner_counts` Edge Function (service_role).
--    Verified: nothing in src/ or supabase/functions/ reads the view directly.
--    Wrapped in an IF EXISTS check because the view is another prod-only orphan
--    (not in any migration file); preview branches don't have it. The advisor
--    flagged it on prod, so the REVOKE matters there.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'equipment_owner_counts'
      AND c.relkind = 'm'
  ) THEN
    REVOKE SELECT ON public.equipment_owner_counts FROM anon, authenticated, PUBLIC;
  END IF;
END $$;


-- ============================================================
-- 20260520153000_orphan_cleanup_and_view_counts.sql
-- ============================================================
-- Cleanup migration. Three goals:
--
-- 1. Drop two orphan no-op trigger functions on prod that were created via the
--    SQL editor and never back-filled into a migration. Both have empty bodies
--    (just `RETURN NEW`) and are not attached to any trigger — pure dead code
--    that the security advisor + the previous hardening migration flagged.
--
-- 2. Back-fill the `equipment_owner_counts` materialized view + refresher
--    function into the migration history. They exist on prod but not in any
--    migration file (so preview branches don't have them, and a fresh deploy
--    from migrations alone wouldn't either). The view is actively refreshed
--    by the `refresh_equipment_owner_counts` Edge Function so it's not dead.
--
-- 3. Add the missing `equipment.views` column and the `increment_view_count`
--    RPC that the frontend has been calling silently-failing in prod. See
--    src/services/database.ts:249 — the call has been there since launch and
--    has been reporting errors to Sentry on every equipment-detail view.

-- ─── 1. Drop orphan no-op trigger functions ──────────────────────────────────
-- Verified prior to drafting that neither is attached to any pg_trigger.
DROP FUNCTION IF EXISTS public.create_notification();
DROP FUNCTION IF EXISTS public.log_audit_event();

-- ─── 2. Back-fill equipment_owner_counts matview + indexes + refresher ──────
-- All `IF NOT EXISTS` so these are no-ops on prod (everything is already there)
-- and only create the objects on preview / fresh-deploy databases.
--
-- The unique index on owner_id is REQUIRED by the refresher function below —
-- `REFRESH MATERIALIZED VIEW CONCURRENTLY` only works when the view has at
-- least one unique index. The non-unique index mirrors what prod has.
CREATE MATERIALIZED VIEW IF NOT EXISTS public.equipment_owner_counts AS
SELECT
  owner_id,
  count(*) AS equipment_count,
  max(updated_at) AS last_updated
FROM public.equipment
GROUP BY owner_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mview_equipment_owner_id
  ON public.equipment_owner_counts (owner_id);

-- Prod has a redundant non-unique index on the same column (left over from
-- when the matview was first created via SQL editor). The unique index above
-- covers both uniqueness and lookups, so the non-unique one just adds write
-- and storage overhead on every refresh. Drop it from prod here.
DROP INDEX IF EXISTS public.idx_mview_equipment_owner_id;

REVOKE SELECT ON public.equipment_owner_counts FROM anon, authenticated, PUBLIC;

-- Refresher function — called by the dashboard-only
-- `refresh_equipment_owner_counts` Edge Function on a cron schedule. Without
-- this back-fill, the function would be missing on preview / fresh deploys
-- and the Edge Function call would fail.
CREATE OR REPLACE FUNCTION public.refresh_equipment_owner_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.equipment_owner_counts;
EXCEPTION WHEN OTHERS THEN
  -- Swallow errors so a transient refresh failure doesn't break cron;
  -- mirrors the existing prod definition. Real failures surface in logs.
  NULL;
END;
$$;

-- Lock down EXECUTE — only service_role (the Edge Function's role) needs it.
REVOKE EXECUTE ON FUNCTION public.refresh_equipment_owner_counts() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_equipment_owner_counts() TO service_role;

-- ─── 3. Equipment view-count column + RPC ───────────────────────────────────
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_view_count(equipment_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.equipment
  SET views = views + 1
  WHERE id = equipment_id;
$$;

-- SECURITY DEFINER so anonymous browsers can bump the counter even when RLS
-- on `equipment` would otherwise block an UPDATE. The function does exactly
-- one thing (increment a counter on a row keyed by uuid); no other side
-- effects, so the elevated-privilege scope is intentionally minimal.
-- search_path is pinned to prevent search_path injection.
--
-- Revoke from anon/authenticated/PUBLIC explicitly (not just PUBLIC) because
-- CREATE OR REPLACE preserves any pre-existing grants if the function already
-- exists on the target DB. Without this, a stale GRANT could survive and the
-- explicit one below would just augment it. Mirrors the security hardening
-- migration's defensive pattern.
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.increment_view_count(uuid) IS
  'Bumps equipment.views by 1 for the given id. Callable by anon and authenticated; bypasses RLS via SECURITY DEFINER scoped to a single-column update.';


-- ============================================================
-- 20260527120000_referral_reward_fulfillment.sql
-- ============================================================
-- Referral reward fulfillment.
--
-- The referral *attribution* loop already works: a ?ref=CODE link → signup →
-- handle_new_user() records a 'pending' referral. What was missing is the
-- second half — nothing ever moved a referral to 'completed' or granted the
-- referrer a reward. This migration closes that loop:
--
--   1. When a referred user lists their FIRST piece of equipment, their
--      pending referral flips to 'completed'.
--   2. The referrer's "Founding Owner" 0%-fee window is granted/extended:
--      1+ completed referrals → 6 months, 3+ → 12 months (never shrinks).
--
-- IMPORTANT: the fee-free window is TRACKED here (a column + display) but is
-- NOT yet enforced by the fee math in create-checkout / payouts / payments.ts.
-- Honoring it in live billing is a deliberate follow-up so the payment paths
-- can be changed and Stripe-tested in isolation.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS founding_owner_fee_free_until timestamptz;

COMMENT ON COLUMN public.profiles.founding_owner_fee_free_until IS
  'If set and in the future, this owner earned a 0% platform-fee window via referrals. NOT yet enforced in fee calculation as of migration 20260527120000 — tracked for display only.';

-- Grant or extend a referrer's fee-free window from their completed-referral count.
CREATE OR REPLACE FUNCTION public.grant_founding_owner_reward(p_referrer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_completed int;
  v_months int;
BEGIN
  SELECT count(*) INTO v_completed
  FROM public.referrals
  WHERE referrer_id = p_referrer_id
    AND status IN ('completed', 'rewarded');

  v_months := CASE
                WHEN v_completed >= 3 THEN 12
                WHEN v_completed >= 1 THEN 6
                ELSE 0
              END;

  IF v_months = 0 THEN
    RETURN;
  END IF;

  -- GREATEST(..., now() + months) anchors the window to "now" and never
  -- shrinks an existing (possibly longer) window.
  UPDATE public.profiles
  SET founding_owner_fee_free_until =
        GREATEST(COALESCE(founding_owner_fee_free_until, now()),
                 now() + make_interval(months => v_months)),
      updated_at = now()
  WHERE id = p_referrer_id;
END;
$$;

-- On a user's FIRST listing, complete the referral that brought them in
-- (if any) and reward the referrer.
CREATE OR REPLACE FUNCTION public.complete_referral_on_first_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  -- Only the owner's first listing should complete a referral. In an AFTER
  -- INSERT trigger the new row is already counted, so first listing => 1.
  IF (SELECT count(*) FROM public.equipment WHERE owner_id = NEW.owner_id) <> 1 THEN
    RETURN NEW;
  END IF;

  UPDATE public.referrals
  SET status = 'completed',
      completed_at = now(),
      reward_type = COALESCE(reward_type, 'discount')
  WHERE referred_user_id = NEW.owner_id
    AND status = 'pending'
  RETURNING referrer_id INTO v_referrer_id;

  IF v_referrer_id IS NOT NULL THEN
    PERFORM public.grant_founding_owner_reward(v_referrer_id);
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Referral bookkeeping must never block a listing from being created.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS equipment_complete_referral ON public.equipment;
CREATE TRIGGER equipment_complete_referral
  AFTER INSERT ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.complete_referral_on_first_listing();

-- Both functions run only in the trigger's SECURITY DEFINER context — never
-- meant to be called as REST RPCs. Revoke the default PUBLIC execute grant.
REVOKE EXECUTE ON FUNCTION public.grant_founding_owner_reward(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_referral_on_first_listing() FROM anon, authenticated, PUBLIC;

-- ===== SEED_DATA.sql =====
-- Seed Data for Islakayd Database
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/ialxlykysbqyiejepzkx/sql/new

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, icon, image_url) VALUES
('Construction Equipment', 'construction', 'Heavy machinery for construction and earthmoving projects', '🚜', 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg'),
('Power Tools', 'power-tools', 'Professional power tools for every job', '🔧', 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg'),
('Photography & Video', 'photography', 'Professional cameras, lenses, and video equipment', '📷', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg'),
('Audio & DJ Equipment', 'audio', 'Sound systems, DJ gear, and audio equipment', '🎧', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg'),
('Landscaping', 'landscaping', 'Lawn mowers, trimmers, and garden equipment', '🌿', 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg'),
('Events & Parties', 'events', 'Tents, tables, chairs, and party supplies', '🎉', 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'),
('Vehicles & Transportation', 'vehicles', 'Trucks, vans, trailers, and moving equipment', '🚚', 'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg'),
('Cleaning Equipment', 'cleaning', 'Pressure washers, carpet cleaners, and more', '🧹', 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg'),
('Drones & Aerial', 'drones', 'Professional drones and aerial photography equipment', '🚁', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg'),
('Lighting & Effects', 'lighting', 'Professional lighting for events and production', '💡', 'https://images.pexels.com/photos/3784566/pexels-photo-3784566.jpeg'),
('Sports & Recreation', 'sports', 'Sports equipment and recreational gear', '⚽', 'https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg'),
('Home Improvement', 'home-improvement', 'Tools and equipment for home projects', '🏠', 'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg')
ON CONFLICT (slug) DO NOTHING;

-- Update equipment counts (will be calculated from actual equipment later)
UPDATE categories SET equipment_count = 0;

-- Verify
SELECT name, slug, equipment_count FROM categories ORDER BY name;
