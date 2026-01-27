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
