-- Referral reward fulfillment.
--
-- The referral *attribution* loop already works: a ?ref=CODE link → signup →
-- handle_new_user() records a 'pending' referral. What was missing is the
-- second half — nothing ever moved a referral to 'completed' or granted the
-- referrer a reward. This migration closes that loop:
--
--   1. When a referred user lists their FIRST piece of equipment, their
--      pending referral flips to 'completed'.
--   2. The referrer's "Founding Owner" 0%-fee window is granted/extended:
--      1+ completed referrals → 6 months, 3+ → 12 months (never shrinks).
--
-- IMPORTANT: the fee-free window is TRACKED here (a column + display) but is
-- NOT yet enforced by the fee math in create-checkout / payouts / payments.ts.
-- Honoring it in live billing is a deliberate follow-up so the payment paths
-- can be changed and Stripe-tested in isolation.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS founding_owner_fee_free_until timestamptz;

COMMENT ON COLUMN public.profiles.founding_owner_fee_free_until IS
  'If set and in the future, this owner earned a 0% platform-fee window via referrals. NOT yet enforced in fee calculation as of migration 20260527120000 — tracked for display only.';

-- Grant or extend a referrer's fee-free window from their completed-referral count.
CREATE OR REPLACE FUNCTION public.grant_founding_owner_reward(p_referrer_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_completed int;
  v_months int;
BEGIN
  SELECT count(*) INTO v_completed
  FROM public.referrals
  WHERE referrer_id = p_referrer_id
    AND status IN ('completed', 'rewarded');

  v_months := CASE
                WHEN v_completed >= 3 THEN 12
                WHEN v_completed >= 1 THEN 6
                ELSE 0
              END;

  IF v_months = 0 THEN
    RETURN;
  END IF;

  -- GREATEST(..., now() + months) anchors the window to "now" and never
  -- shrinks an existing (possibly longer) window.
  UPDATE public.profiles
  SET founding_owner_fee_free_until =
        GREATEST(COALESCE(founding_owner_fee_free_until, now()),
                 now() + make_interval(months => v_months)),
      updated_at = now()
  WHERE id = p_referrer_id;
END;
$$;

-- On a user's FIRST listing, complete the referral that brought them in
-- (if any) and reward the referrer.
CREATE OR REPLACE FUNCTION public.complete_referral_on_first_listing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_referrer_id uuid;
BEGIN
  -- Only the owner's first listing should complete a referral. In an AFTER
  -- INSERT trigger the new row is already counted, so first listing => 1.
  IF (SELECT count(*) FROM public.equipment WHERE owner_id = NEW.owner_id) <> 1 THEN
    RETURN NEW;
  END IF;

  UPDATE public.referrals
  SET status = 'completed',
      completed_at = now(),
      reward_type = COALESCE(reward_type, 'discount')
  WHERE referred_user_id = NEW.owner_id
    AND status = 'pending'
  RETURNING referrer_id INTO v_referrer_id;

  IF v_referrer_id IS NOT NULL THEN
    PERFORM public.grant_founding_owner_reward(v_referrer_id);
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Referral bookkeeping must never block a listing from being created.
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS equipment_complete_referral ON public.equipment;
CREATE TRIGGER equipment_complete_referral
  AFTER INSERT ON public.equipment
  FOR EACH ROW EXECUTE FUNCTION public.complete_referral_on_first_listing();

-- Both functions run only in the trigger's SECURITY DEFINER context — never
-- meant to be called as REST RPCs. Revoke the default PUBLIC execute grant.
REVOKE EXECUTE ON FUNCTION public.grant_founding_owner_reward(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_referral_on_first_listing() FROM anon, authenticated, PUBLIC;
