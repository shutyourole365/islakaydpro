-- Security hardening: address advisor warnings flagged on prod (ialxlykysbqyiejepzkx).
--
-- Five fixes, all reversible. See PR description for the per-fix DOWN statements.
--
-- Verified before drafting:
--  - Frontend's only `.rpc(...)` call is `increment_view_count`, which is NOT in
--    the SECURITY DEFINER set — so nothing in the app relies on these privileges.
--  - Frontend does not call `storage.from('equipment-images').list(...)`.
--  - Frontend does not read the `equipment_owner_counts` materialized view.

-- 1. Pin search_path on the two SECURITY INVOKER trigger functions flagged with
--    a mutable search_path. Prevents search_path injection if the trigger ever
--    fires with a manipulated session search_path.
ALTER FUNCTION public.update_reviews_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_equipment_rating() SET search_path = public, pg_temp;

-- 2. Revoke EXECUTE on SECURITY DEFINER trigger functions from anon/authenticated/public.
--    These functions are wired up as triggers; triggers fire as the function owner
--    regardless of EXECUTE grants. The default PostgreSQL grants made them callable
--    as REST RPCs (e.g. `POST /rest/v1/rpc/handle_new_user`), which was never the
--    intent. Triggers continue to work after the revoke; the attack surface is removed.
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname || '.' || p.proname || '(' ||
           pg_catalog.pg_get_function_identity_arguments(p.oid) || ')' AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true
      AND p.proname IN (
        'create_default_email_preferences',
        'create_default_notification_preferences',
        'create_equipment_analytics',
        'create_user_analytics',
        'guard_profile_referral_columns',
        'handle_new_user',
        'notify_booking_changes',
        'on_booking_confirmed',
        'on_new_message',
        'update_booking_on_payment',
        'update_booking_on_payout',
        'update_notification_preferences_updated_at'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon, authenticated, PUBLIC', fn.sig);
  END LOOP;
END $$;

-- 3. Revoke EXECUTE on server-side SECURITY DEFINER RPCs from anon/authenticated.
--    These are utility functions the frontend never calls. service_role retains
--    EXECUTE so Edge Functions and admin paths keep working.
REVOKE EXECUTE ON FUNCTION public.create_notification() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_event() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_audit_event(uuid, text, text, uuid, jsonb) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.refresh_equipment_owner_counts() FROM anon, authenticated, PUBLIC;

-- 4. Drop the overly broad SELECT policy on the equipment-images bucket.
--    `equipment-images` is a public bucket; public URLs served by
--    `/storage/v1/object/public/equipment-images/<path>` do NOT require any
--    storage.objects policy. This policy only enabled clients to *list* files
--    in the bucket via `storage.from('equipment-images').list()`, which leaks
--    every upload. Verified: frontend never calls list() on this bucket.
DROP POLICY IF EXISTS "Public can view equipment images" ON storage.objects;

-- 5. Revoke SELECT on the equipment_owner_counts materialized view from anon/authenticated.
--    Refreshed by the `refresh_equipment_owner_counts` Edge Function (service_role).
--    Verified: nothing in src/ or supabase/functions/ reads the view directly.
REVOKE SELECT ON public.equipment_owner_counts FROM anon, authenticated, PUBLIC;
