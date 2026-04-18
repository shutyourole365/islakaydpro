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
