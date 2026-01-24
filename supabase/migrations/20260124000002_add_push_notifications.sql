-- Push Notifications Infrastructure
-- Migration: Add push notification support

-- Push subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification logs for analytics
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_ids UUID[] DEFAULT '{}',
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT DEFAULT 'general',
  sent_count INTEGER DEFAULT 0,
  total_subscriptions INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User notification preferences (extend existing or create new)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Push notification toggles
  push_enabled BOOLEAN DEFAULT true,
  push_booking_requests BOOLEAN DEFAULT true,
  push_booking_updates BOOLEAN DEFAULT true,
  push_messages BOOLEAN DEFAULT true,
  push_reviews BOOLEAN DEFAULT true,
  push_price_alerts BOOLEAN DEFAULT true,
  push_promotions BOOLEAN DEFAULT false,
  push_reminders BOOLEAN DEFAULT true,
  
  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  
  -- Timezone
  timezone TEXT DEFAULT 'America/Los_Angeles',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS Policies for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Service role can manage all subscriptions
CREATE POLICY "Service role full access to push_subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- RLS Policies for notification_logs (admin only)
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view notification logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) AND is_admin = true
    )
  );

CREATE POLICY "Service role full access to notification_logs"
  ON notification_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Function to create default notification preferences on user signup
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create preferences
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to check if user should receive push (respects quiet hours)
CREATE OR REPLACE FUNCTION should_send_push(p_user_id UUID, p_notification_type TEXT DEFAULT 'general')
RETURNS BOOLEAN AS $$
DECLARE
  v_prefs notification_preferences%ROWTYPE;
  v_current_time TIME;
BEGIN
  SELECT * INTO v_prefs FROM notification_preferences WHERE user_id = p_user_id;
  
  -- If no preferences, allow by default
  IF NOT FOUND THEN
    RETURN true;
  END IF;
  
  -- Check if push is enabled
  IF NOT v_prefs.push_enabled THEN
    RETURN false;
  END IF;
  
  -- Check notification type toggle
  CASE p_notification_type
    WHEN 'booking_request' THEN
      IF NOT v_prefs.push_booking_requests THEN RETURN false; END IF;
    WHEN 'booking_update' THEN
      IF NOT v_prefs.push_booking_updates THEN RETURN false; END IF;
    WHEN 'message' THEN
      IF NOT v_prefs.push_messages THEN RETURN false; END IF;
    WHEN 'review' THEN
      IF NOT v_prefs.push_reviews THEN RETURN false; END IF;
    WHEN 'price_alert' THEN
      IF NOT v_prefs.push_price_alerts THEN RETURN false; END IF;
    WHEN 'promotion' THEN
      IF NOT v_prefs.push_promotions THEN RETURN false; END IF;
    WHEN 'reminder' THEN
      IF NOT v_prefs.push_reminders THEN RETURN false; END IF;
    ELSE
      -- Allow general notifications
      NULL;
  END CASE;
  
  -- Check quiet hours
  IF v_prefs.quiet_hours_enabled THEN
    v_current_time := (now() AT TIME ZONE v_prefs.timezone)::TIME;
    
    IF v_prefs.quiet_hours_start < v_prefs.quiet_hours_end THEN
      -- Normal case: quiet hours don't span midnight
      IF v_current_time >= v_prefs.quiet_hours_start AND v_current_time < v_prefs.quiet_hours_end THEN
        RETURN false;
      END IF;
    ELSE
      -- Quiet hours span midnight (e.g., 22:00 to 08:00)
      IF v_current_time >= v_prefs.quiet_hours_start OR v_current_time < v_prefs.quiet_hours_end THEN
        RETURN false;
      END IF;
    END IF;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated timestamp trigger for preferences
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notification_preferences_timestamp ON notification_preferences;
CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Analytics view for notification effectiveness
CREATE OR REPLACE VIEW notification_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  notification_type,
  COUNT(*) AS total_sent,
  SUM(sent_count) AS successful_deliveries,
  SUM(total_subscriptions) AS total_targets,
  ROUND(
    CASE 
      WHEN SUM(total_subscriptions) > 0 
      THEN (SUM(sent_count)::NUMERIC / SUM(total_subscriptions)::NUMERIC) * 100 
      ELSE 0 
    END, 2
  ) AS delivery_rate_percent
FROM notification_logs
GROUP BY DATE_TRUNC('day', created_at), notification_type
ORDER BY date DESC, notification_type;

-- Grant access to the analytics view
GRANT SELECT ON notification_analytics TO authenticated;
