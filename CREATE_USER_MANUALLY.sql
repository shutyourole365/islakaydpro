-- MANUAL USER CREATION GUIDE
-- Copy and paste these commands into Supabase SQL Editor

-- Step 1: Create the user in auth.users (run this first)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'demo@islakayd.com',
  crypt('Demo123456!', gen_salt('bf')),
  now(),
  '{"full_name": "Islakayd Demo Owner"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
)
ON CONFLICT (email) DO NOTHING
RETURNING id;

-- Step 2: Note the ID from above, then create profile (replace YOUR_USER_ID with the ID)
-- OR run this query to auto-create profile for the demo user:

INSERT INTO public.profiles (
  id,
  full_name,
  bio,
  location,
  is_verified,
  rating,
  total_reviews,
  account_status,
  created_at,
  updated_at
)
SELECT 
  id,
  'Islakayd Demo Owner',
  'Demo account for equipment listings',
  'Los Angeles, CA',
  true,
  4.9,
  127,
  'active',
  now(),
  now()
FROM auth.users 
WHERE email = 'demo@islakayd.com'
ON CONFLICT (id) 
DO UPDATE SET
  full_name = EXCLUDED.full_name,
  bio = EXCLUDED.bio,
  location = EXCLUDED.location,
  is_verified = EXCLUDED.is_verified,
  rating = EXCLUDED.rating,
  total_reviews = EXCLUDED.total_reviews,
  updated_at = now();
