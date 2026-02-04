-- Create Demo User and Profile for Islakayd
-- Run this in Supabase SQL Editor to create a demo account

-- First, check if user already exists
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Check if demo user exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo@islakayd.com';
  
  IF v_user_id IS NULL THEN
    -- Create new user
    v_user_id := gen_random_uuid();
    
    -- Insert into auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      confirmation_sent_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'demo@islakayd.com',
      crypt('Demo123456!', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Islakayd Demo Owner"}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    );
    
    -- Insert into auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      jsonb_build_object('sub', v_user_id::text, 'email', 'demo@islakayd.com'),
      'email',
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Create profile (or update if trigger created it)
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
    ) VALUES (
      v_user_id,
      'Islakayd Demo Owner',
      'Professional equipment rental provider with verified track record',
      'Los Angeles, CA',
      true,
      4.9,
      127,
      'active',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      bio = EXCLUDED.bio,
      location = EXCLUDED.location,
      is_verified = EXCLUDED.is_verified,
      rating = EXCLUDED.rating,
      total_reviews = EXCLUDED.total_reviews;
    
    RAISE NOTICE 'Demo user created successfully! User ID: %', v_user_id;
    RAISE NOTICE 'Email: demo@islakayd.com';
    RAISE NOTICE 'Password: Demo123456!';
  ELSE
    RAISE NOTICE 'Demo user already exists! User ID: %', v_user_id;
    RAISE NOTICE 'Email: demo@islakayd.com';
    RAISE NOTICE 'Password: Demo123456!';
  END IF;
END $$;

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  u.created_at,
  p.full_name,
  p.location,
  p.is_verified
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'demo@islakayd.com';
