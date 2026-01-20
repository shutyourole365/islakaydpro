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