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
