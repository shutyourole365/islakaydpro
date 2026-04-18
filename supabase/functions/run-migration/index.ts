import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import postgres from 'https://deno.land/x/postgresjs@v3.4.4/mod.js'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const dbUrl = Deno.env.get('SUPABASE_DB_URL') ?? ''
    const sql = postgres(dbUrl, { ssl: 'require' })
    const results: string[] = []

    // ─── 1. CATEGORIES TABLE ───────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text UNIQUE NOT NULL,
        description text,
        icon text,
        image_url text,
        equipment_count integer DEFAULT 0,
        created_at timestamptz DEFAULT now()
      )
    `
    await sql`ALTER TABLE categories ENABLE ROW LEVEL SECURITY`
    await sql`DROP POLICY IF EXISTS "categories_select" ON categories`
    await sql`CREATE POLICY "categories_select" ON categories FOR SELECT USING (true)`
    results.push('✅ categories table ready')

    // ─── 2. EQUIPMENT TABLE ────────────────────────────────────────────────
    await sql`
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
      )
    `
    await sql`ALTER TABLE equipment ENABLE ROW LEVEL SECURITY`
    await sql`DROP POLICY IF EXISTS "equipment_select" ON equipment`
    await sql`CREATE POLICY "equipment_select" ON equipment FOR SELECT USING (is_active = true)`
    await sql`DROP POLICY IF EXISTS "equipment_insert" ON equipment`
    await sql`CREATE POLICY "equipment_insert" ON equipment FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id)`
    await sql`DROP POLICY IF EXISTS "equipment_update" ON equipment`
    await sql`CREATE POLICY "equipment_update" ON equipment FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id)`
    await sql`DROP POLICY IF EXISTS "equipment_delete" ON equipment`
    await sql`CREATE POLICY "equipment_delete" ON equipment FOR DELETE TO authenticated USING (auth.uid() = owner_id)`
    results.push('✅ equipment table ready')

    // ─── 3. PAYOUTS TABLE ──────────────────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS payouts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id uuid,
        owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
        amount numeric(10,2) NOT NULL,
        platform_fee numeric(10,2) DEFAULT 0,
        currency text DEFAULT 'aud',
        status text DEFAULT 'pending',
        stripe_transfer_id text,
        created_at timestamptz DEFAULT now()
      )
    `
    await sql`ALTER TABLE payouts ENABLE ROW LEVEL SECURITY`
    await sql`DROP POLICY IF EXISTS "payouts_select" ON payouts`
    await sql`CREATE POLICY "payouts_select" ON payouts FOR SELECT TO authenticated USING (auth.uid() = owner_id)`
    results.push('✅ payouts table ready')

    // ─── 4. EQUIPMENT AVAILABILITY TABLE ───────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS equipment_availability (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE NOT NULL,
        start_date date NOT NULL,
        end_date date NOT NULL,
        reason text DEFAULT 'booked',
        created_at timestamptz DEFAULT now()
      )
    `
    await sql`ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY`
    await sql`DROP POLICY IF EXISTS "availability_select" ON equipment_availability`
    await sql`CREATE POLICY "availability_select" ON equipment_availability FOR SELECT USING (true)`
    results.push('✅ equipment_availability table ready')

    // ─── 5. ADD MISSING COLUMNS TO BOOKINGS ───────────────────────────────
    // existing: id, listing_id, renter_id, owner_id, start_date, end_date, total_price, status, created_at, cancellation_reason, cancelled_at
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_id uuid`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_days integer`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate numeric(10,2)`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS subtotal numeric(10,2)`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_fee numeric(10,2) DEFAULT 0`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) DEFAULT 0`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount numeric(10,2)`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending'`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes text`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_session_id text`
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text`
    results.push('✅ bookings columns added')

    // ─── 6. ADD MISSING COLUMNS TO REVIEWS ────────────────────────────────
    // existing: id, booking_id, listing_id, reviewer_id, reviewee_id, rating, comment, review_type, created_at
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS equipment_id uuid`
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS title text`
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS response text`
    await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_equipment_review boolean DEFAULT true`
    results.push('✅ reviews columns added')

    // ─── 7. ADD MISSING COLUMNS TO PROFILES ───────────────────────────────
    // existing: id, email, full_name, avatar_url, created_at, account_locked, locked_until, referral_code, reputation_score, total_reviews, avg_rating, notification_preferences, two_factor_enabled
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location text`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating numeric(3,2) DEFAULT 0`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_verified boolean DEFAULT false`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login timestamptz`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status text DEFAULT 'active'`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_connect_id text`
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true`
    results.push('✅ profiles columns added')

    // ─── 8. ADD MISSING COLUMNS TO CONVERSATIONS ──────────────────────────
    // existing: id, participants (array), last_message, last_message_at, created_at
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS equipment_id uuid`
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participant_ids uuid[] DEFAULT '{}'`
    await sql`ALTER TABLE conversations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now()`
    results.push('✅ conversations columns added')

    // ─── 9. ADD MISSING COLUMNS TO FAVORITES ──────────────────────────────
    // existing: id, user_id, listing_id, created_at
    await sql`ALTER TABLE favorites ADD COLUMN IF NOT EXISTS equipment_id uuid`
    results.push('✅ favorites columns added')

    // ─── 10. INDEXES ───────────────────────────────────────────────────────
    await sql`CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment(owner_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(category_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment(is_active) WHERE is_active = true`
    await sql`CREATE INDEX IF NOT EXISTS idx_equipment_featured ON equipment(is_featured) WHERE is_featured = true`
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_equipment ON bookings(equipment_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_reviews_equipment ON reviews(equipment_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_favorites_equipment ON favorites(equipment_id)`
    results.push('✅ indexes created')

    // ─── 11. SEED CATEGORIES ───────────────────────────────────────────────
    await sql`
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
      ON CONFLICT (slug) DO NOTHING
    `
    results.push('✅ categories seeded (10 Australian-relevant)')

    await sql.end()

    return new Response(JSON.stringify({ success: true, steps: results, total: results.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
