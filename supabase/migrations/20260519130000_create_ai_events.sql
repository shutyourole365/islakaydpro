-- ================================================================
-- AI Events Telemetry
-- Records lightweight events from the Kayd AI assistant so the
-- Admin → AI Telemetry view can analyse engagement and feedback.
-- Event types match the README's documented set; new types can be
-- added without a migration since 'event_type' is plain text.
-- Payload is a flexible jsonb bag so event-specific data (message
-- id, thumbs-up/down, image url, latency) can be stored without
-- schema churn.
-- ================================================================

CREATE TABLE IF NOT EXISTS ai_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Common access patterns: list a user's own events, admin browses
-- all events filtered by type and time.
CREATE INDEX IF NOT EXISTS idx_ai_events_user_created
  ON ai_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_events_type_created
  ON ai_events(event_type, created_at DESC);

ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;

-- All policies scoped to TO authenticated to match the canonical
-- pattern in 20260124000001_add_stripe_payments.sql. user_id stays
-- nullable on the table for future flexibility (e.g. service-role
-- inserts) but writes from the client require auth.

-- Signed-in users may insert their own events.
CREATE POLICY "Users can insert own ai events"
  ON ai_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Users can read their own events; admins (profiles.is_admin = true)
-- can read everything for the AI Telemetry dashboard.
CREATE POLICY "Users can read own ai events"
  ON ai_events FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Admins can read all ai events"
  ON ai_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );
