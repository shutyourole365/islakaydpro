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

-- ─── 2. Back-fill equipment_owner_counts matview + indexes + refresher ──────
-- All `IF NOT EXISTS` so these are no-ops on prod (everything is already there)
-- and only create the objects on preview / fresh-deploy databases.
--
-- The unique index on owner_id is REQUIRED by the refresher function below —
-- `REFRESH MATERIALIZED VIEW CONCURRENTLY` only works when the view has at
-- least one unique index. The non-unique index mirrors what prod has.
CREATE MATERIALIZED VIEW IF NOT EXISTS public.equipment_owner_counts AS
SELECT
  owner_id,
  count(*) AS equipment_count,
  max(updated_at) AS last_updated
FROM public.equipment
GROUP BY owner_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_mview_equipment_owner_id
  ON public.equipment_owner_counts (owner_id);
CREATE INDEX IF NOT EXISTS idx_mview_equipment_owner_id
  ON public.equipment_owner_counts (owner_id);

REVOKE SELECT ON public.equipment_owner_counts FROM anon, authenticated, PUBLIC;

-- Refresher function — called by the dashboard-only
-- `refresh_equipment_owner_counts` Edge Function on a cron schedule. Without
-- this back-fill, the function would be missing on preview / fresh deploys
-- and the Edge Function call would fail.
CREATE OR REPLACE FUNCTION public.refresh_equipment_owner_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.equipment_owner_counts;
EXCEPTION WHEN OTHERS THEN
  -- Swallow errors so a transient refresh failure doesn't break cron;
  -- mirrors the existing prod definition. Real failures surface in logs.
  NULL;
END;
$$;

-- Lock down EXECUTE — only service_role (the Edge Function's role) needs it.
REVOKE EXECUTE ON FUNCTION public.refresh_equipment_owner_counts() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.refresh_equipment_owner_counts() TO service_role;

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
--
-- Revoke from anon/authenticated/PUBLIC explicitly (not just PUBLIC) because
-- CREATE OR REPLACE preserves any pre-existing grants if the function already
-- exists on the target DB. Without this, a stale GRANT could survive and the
-- explicit one below would just augment it. Mirrors the security hardening
-- migration's defensive pattern.
REVOKE EXECUTE ON FUNCTION public.increment_view_count(uuid) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_view_count(uuid) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.increment_view_count(uuid) IS
  'Bumps equipment.views by 1 for the given id. Callable by anon and authenticated; bypasses RLS via SECURITY DEFINER scoped to a single-column update.';
