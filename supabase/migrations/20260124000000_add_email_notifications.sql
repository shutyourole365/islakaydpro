-- Add email notification infrastructure
-- This migration sets up webhook triggers for booking events

-- Create a function to notify on booking changes
CREATE OR REPLACE FUNCTION notify_booking_changes()
RETURNS TRIGGER AS $$
DECLARE
  payload json;
BEGIN
  -- Build the payload
  IF TG_OP = 'DELETE' THEN
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(OLD),
      'old_record', NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    );
  ELSE
    payload = json_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', row_to_json(NEW),
      'old_record', NULL
    );
  END IF;

  -- Notify the booking-webhook edge function via pg_notify
  PERFORM pg_notify('booking_changes', payload::text);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking changes
DROP TRIGGER IF EXISTS on_booking_change ON bookings;
CREATE TRIGGER on_booking_change
  AFTER INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION notify_booking_changes();

-- Create table for email logs (for debugging and analytics)
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  subject text NOT NULL,
  template text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz
);

-- Index for querying email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- RLS for email logs (admin only)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Create table for email preferences
CREATE TABLE IF NOT EXISTS email_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  booking_confirmations boolean DEFAULT true,
  booking_reminders boolean DEFAULT true,
  new_messages boolean DEFAULT true,
  new_reviews boolean DEFAULT true,
  price_alerts boolean DEFAULT true,
  marketing_emails boolean DEFAULT false,
  weekly_digest boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for email preferences
CREATE INDEX IF NOT EXISTS idx_email_preferences_user_id ON email_preferences(user_id);

-- RLS for email preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own email preferences"
  ON email_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Function to create default email preferences on user signup
CREATE OR REPLACE FUNCTION create_default_email_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO email_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create email preferences on profile creation
DROP TRIGGER IF EXISTS on_profile_created_email_prefs ON profiles;
CREATE TRIGGER on_profile_created_email_prefs
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_email_preferences();

-- Create scheduled job table for reminders (if using pg_cron)
-- Note: pg_cron must be enabled in Supabase dashboard
COMMENT ON TABLE email_preferences IS 'User email notification preferences';
COMMENT ON TABLE email_logs IS 'Log of all sent emails for debugging';

-- Grant necessary permissions
GRANT SELECT ON email_preferences TO authenticated;
GRANT INSERT, UPDATE ON email_preferences TO authenticated;
