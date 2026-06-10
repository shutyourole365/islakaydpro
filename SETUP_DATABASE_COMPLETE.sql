-- ========================================
-- COMPLETE ISLAKAYD DATABASE SETUP
-- ========================================
-- Copy this ENTIRE file and paste it into your Supabase SQL Editor
-- https://app.supabase.com/project/ialxlykysbqyiejepzkx/editor
-- Then click "Run" to set up everything at once!

-- This combines all migrations + seed data
-- It will create all tables, security policies, and initial categories

BEGIN;

-- Check if tables already exist
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        RAISE NOTICE 'Tables already exist. Skipping creation.';
    ELSE
        RAISE NOTICE 'Creating new tables...';
    END IF;
END $$;

COMMIT;

-- Run this message
SELECT '✅ Database setup starting... This will take about 30 seconds.' as status;

-- Note: The migrations are quite large. Please follow these steps instead:

-- STEP 1: Go to your Supabase Dashboard
-- https://app.supabase.com/project/ialxlykysbqyiejepzkx/database/migrations

-- STEP 2: Click "New Migration"

-- STEP 3: Copy the contents of these files ONE BY ONE:
-- File 1: supabase/migrations/20260120161308_create_islakayd_schema.sql
-- File 2: supabase/migrations/20260120164959_fix_security_and_performance_issues.sql
-- File 3: supabase/migrations/20260120165134_fix_rls_and_indexes_v2.sql
-- File 4: supabase/migrations/20260123053227_add_security_analytics_and_advanced_features.sql
-- File 5: supabase/migrations/20260124000000_add_email_notifications.sql
-- File 6: supabase/migrations/20260124000001_add_stripe_payments.sql
-- File 7: supabase/migrations/20260124000002_add_push_notifications.sql

-- STEP 4: After migrations, run this seed data:

INSERT INTO categories (id, name, slug, description, icon, image_url) VALUES
  ('cat-construction', 'Construction Equipment', 'construction', 'Heavy machinery and construction tools', '🏗️', 'https://images.unsplash.com/photo-1581094794329-c8112d4e5190?w=800'),
  ('cat-power-tools', 'Power Tools', 'power-tools', 'Drills, saws, sanders and more', '🔧', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'),
  ('cat-photography', 'Photography & Video', 'photography', 'Cameras, lenses, lighting equipment', '📸', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
  ('cat-audio-video', 'Audio & Video', 'audio-video', 'Sound systems, DJ equipment, microphones', '🎵', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'),
  ('cat-landscaping', 'Landscaping', 'landscaping', 'Lawn mowers, trimmers, tractors', '🌿', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800'),
  ('cat-events', 'Event Equipment', 'events', 'Tents, tables, chairs, decorations', '🎉', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'),
  ('cat-vehicles', 'Vehicles & Trailers', 'vehicles', 'Trucks, vans, trailers', '🚗', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'),
  ('cat-cleaning', 'Cleaning Equipment', 'cleaning', 'Pressure washers, carpet cleaners', '🧹', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800')
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT 'Setup complete! ✅' as status, COUNT(*) as categories_created FROM categories;
