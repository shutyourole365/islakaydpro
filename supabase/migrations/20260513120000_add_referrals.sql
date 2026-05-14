-- Referrals feature: add per-user referral code, referrer link, and referrals ledger.

-- 1. profiles columns ------------------------------------------------------

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT,
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code
  ON profiles(referral_code)
  WHERE referral_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Code generator: 12 hex chars (~48 bits) prefixed with ISLAKAYD-. Retries
-- on the very-unlikely unique-index collision so backfill and signup never
-- abort just because of a generator clash.
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
  v_attempt INT := 0;
BEGIN
  LOOP
    v_code := 'ISLAKAYD-' || UPPER(SUBSTR(REPLACE(gen_random_uuid()::TEXT, '-', ''), 1, 12));
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = v_code) INTO v_exists;
    EXIT WHEN NOT v_exists;
    v_attempt := v_attempt + 1;
    IF v_attempt >= 5 THEN
      -- Fall through with the last candidate; the unique index acts as a
      -- final safeguard and the caller can retry.
      EXIT;
    END IF;
  END LOOP;
  RETURN v_code;
END;
$$;

-- Backfill referral_code for existing profiles that don't have one.
UPDATE profiles
SET referral_code = public.generate_referral_code()
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
-- Use (select auth.uid()) so PG evaluates it once per statement instead of
-- per row — matches the convention in 20260120165134_fix_rls_and_indexes_v2.
DROP POLICY IF EXISTS "Users can view their own referrals" ON referrals;
CREATE POLICY "Users can view their own referrals" ON referrals
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = referrer_id OR (select auth.uid()) = referred_user_id);

-- Writes happen via the SECURITY DEFINER trigger (handle_new_user) or service role only.
DROP POLICY IF EXISTS "Service role can manage referrals" ON referrals;
CREATE POLICY "Service role can manage referrals" ON referrals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. profiles column-write guard ------------------------------------------
-- The existing "Users can update their own profile" policy allows updates
-- to any column on the user's own row. Without this guard a user could
-- self-assign referred_by or rewrite their referral_code, corrupting
-- attribution. Block non-service-role attempts to change either column.

CREATE OR REPLACE FUNCTION public.guard_profile_referral_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF current_setting('request.jwt.claims', true)::jsonb ->> 'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
    RAISE EXCEPTION 'profiles.referral_code is read-only for end users';
  END IF;

  IF NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'profiles.referred_by is read-only for end users';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_guard_referral_columns ON profiles;
CREATE TRIGGER profiles_guard_referral_columns
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_referral_columns();

-- 5. handle_new_user: assign referral_code + record incoming referral -----

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
    public.generate_referral_code(),
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
      -- Bypass the column-write guard via service-role-equivalent DEFINER context.
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
