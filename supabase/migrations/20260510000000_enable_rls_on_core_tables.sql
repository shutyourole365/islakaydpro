-- ================================================================
-- Audit Log Table + RLS
-- Creates audit_logs table used by auditLog.ts service
-- Conversations policies already exist using participants[] array column
-- ================================================================

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}',
  ip_address text DEFAULT 'unknown',
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own audit logs
DROP POLICY IF EXISTS "Allow inserts for audit logging" ON audit_logs;
CREATE POLICY "Allow inserts for audit logging"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Restrict SELECT: only admins via service role (no policy = no access for anon/authenticated)
-- SELECT access is handled at the application/API layer
