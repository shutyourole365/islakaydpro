-- ========================================
-- ISLAKAYD DATABASE SEED DATA
-- ========================================
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/ialxlykysbqyiejepzkx/editor

-- Insert Categories
INSERT INTO categories (id, name, slug, description, icon, image_url) VALUES
  ('cat-construction', 'Construction Equipment', 'construction', 'Heavy machinery and construction tools', '🏗️', 'https://images.unsplash.com/photo-2581094794329-c8112d4e5190?w=800'),
  ('cat-power-tools', 'Power Tools', 'power-tools', 'Drills, saws, sanders and more', '🔧', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'),
  ('cat-photography', 'Photography & Video', 'photography', 'Cameras, lenses, lighting equipment', '📸', 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800'),
  ('cat-audio-video', 'Audio & Video', 'audio-video', 'Sound systems, DJ equipment, microphones', '🎵', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'),
  ('cat-landscaping', 'Landscaping', 'landscaping', 'Lawn mowers, trimmers, tractors', '🌿', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800'),
  ('cat-events', 'Event Equipment', 'events', 'Tents, tables, chairs, decorations', '🎉', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'),
  ('cat-vehicles', 'Vehicles & Trailers', 'vehicles', 'Trucks, vans, trailers', '🚗', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'),
  ('cat-cleaning', 'Cleaning Equipment', 'cleaning', 'Pressure washers, carpet cleaners', '🧹', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800')
ON CONFLICT (id) DO NOTHING;

-- Note: Sample equipment and user data should be created through the app interface
-- to ensure proper authentication flow and RLS policies are respected.

-- Verify installation
SELECT 
  'Categories' as table_name, 
  COUNT(*) as count 
FROM categories
UNION ALL
SELECT 
  'Profiles' as table_name, 
  COUNT(*) as count 
FROM profiles
UNION ALL
SELECT 
  'Equipment' as table_name, 
  COUNT(*) as count 
FROM equipment;
