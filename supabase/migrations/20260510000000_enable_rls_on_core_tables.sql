-- ================================================================
-- RLS Policy Validation and Fixes
-- Ensures core tables have proper access control
-- ================================================================
-- NOTE: This migration assumes RLS is already enabled on most tables
-- from previous migrations. Focus on validating and fixing specific issues.

-- CONVERSATIONS FIX: Ensure policy works with actual schema
-- Drop and recreate to avoid referencing non-existent 'participants' column
DROP POLICY IF EXISTS "Users can view conversations they're in" ON conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

CREATE POLICY "Users can view conversations they're in"
  ON conversations FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM conversation_participants WHERE conversation_id = conversations.id)
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (true); -- Insertion should be controlled by application logic

-- AUDIT_LOGS: Ensure RLS is disabled for internal logging
-- Drop existing overly restrictive policy if it exists
DROP POLICY IF EXISTS "Audit logs are internal only" ON audit_logs;

-- Application should handle audit log access control, not RLS
-- RLS should allow inserts for logging purposes
CREATE POLICY "Allow inserts for audit logging"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Note: SELECT access to audit_logs should be restricted via application,
-- potentially through a view or RPC that enforces admin-only access
