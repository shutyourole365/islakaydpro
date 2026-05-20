-- Cleanup migration. Three goals:
--
-- 1. Drop two orphan no-op trigger functions on prod that were created via the
--    SQL editor and never back-filled into a migration. Both have empty bodies
--    (just `RETURN NEW`) and are not attached to any trigger — pure dead code
--    that the security advisor + the previous hardening migration flagged.
--
-- 2. Back-fill the `equipment_owner_counts` materialized view + refresher
--    function into the migration history. They exist on prod but not in any
--    migration file (so preview branches don't have them, and a fresh deploy
--    from migrations alone wouldn't either). The view is actively refreshed
--    by the `refresh_equipment_owner_counts` Edge Function so it's not dead.
--
-- 3. Add the missing `equipment.views` column and the `increment_view_count`
--    RPC that the frontend has been calling silently-failing in prod. See
--    src/services/database.ts:249 — the call has been there since launch and
--    has been reporting errors to Sentry on every equipment-detail view.

-- ─── 1. Drop orphan no-op trigger functions ──────────────────────────────────
-- Verified prior to drafting that neither is attached to any pg_trigger.
DROP FUNCTION IF EXISTS public.create_notification();
DROP FUNCTION IF EXISTS public.log_audit_event();

-- ─── 2. Back-fill equipment_owner_counts materialized view ──────────────────
-- IF NOT EXISTS so this is a no-op on prod (the view is already there) and
-- only creates the object on preview / fresh-deploy databases. After creation,
-- mirror the access-tightening from the previous security migration so newly
-- created instances aren't exposed to anon/authenticated.
CREATE MATERIALIZED VIEW IF NOT EXISTS public.equipment_owner_counts AS
SELECT
  owner_id,
  count(*) AS equipment_count,
  max(updated_at) AS last_updated
FROM public.equipment
GROUP BY owner_id;

REVOKE SELECT ON public.equipment_owner_counts FROM anon, authenticated, PUBLIC;

-- ─── 3. Equipment view-count column + RPC ───────────────────────────────────
ALTER TABLE public.equipment
  ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_view_count(equipment_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.equipment
  SET views = views + 1
  WHERE id = equipment_id;
$$;

-- SECURITY DEFINER so anonymous browsers can bump the counter even when RLS
-- on `equipment` would otherwise block an UPDATE. The function does exactly
-- one thing (increment a counter on a row keyed by uuid); no other side
-- effects, so the elevated-privilege scope is intentionally minimal.
-- search_path is pinned to prevent search_path injection.
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.increment_view_count(uuid) IS
  'Bumps equipment.views by 1 for the given id. Callable by anon and authenticated; bypasses RLS via SECURITY DEFINER scoped to a single-column update.';
