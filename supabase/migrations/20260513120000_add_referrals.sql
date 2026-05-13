-- Referrals feature: add per-user referral code, referrer link, and referrals ledger.

-- 1. profiles columns ------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles(referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Backfill referral_code for existing profiles that don't have one.
UPDATE profiles
SET referral_code = 'ISLAKAYD-' || UPPER(SUBSTR(id::TEXT, 1, 8))
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
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

-- Writes happen via the SECURITY DEFINER trigger (handle_new_user) or service role only.
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;
CREATE POLICY "Service role can manage referrals" ON referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. handle_new_user: assign referral_code + record incoming referral -----

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
    'ISLAKAYD-' || UPPER(SUBSTR(NEW.id::TEXT, 1, 8)),
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
