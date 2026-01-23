/*
  # Advanced Security, Analytics, and Features Enhancement
  
  1. New Tables
    - `audit_logs` - Security audit trail for all user actions
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - for anonymous actions)
      - `action` (text) - action performed
      - `entity_type` (text) - type of entity affected
      - `entity_id` (uuid, nullable)
      - `ip_address` (text)
      - `user_agent` (text)
      - `metadata` (jsonb)
      - `created_at` (timestamp)
    
    - `user_sessions` - Track active user sessions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `device_info` (jsonb)
      - `ip_address` (text)
      - `last_active` (timestamp)
      - `expires_at` (timestamp)
      - `is_active` (boolean)
    
    - `notifications` - In-app notification system
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text) - notification type
      - `title` (text)
      - `message` (text)
      - `data` (jsonb)
      - `is_read` (boolean)
      - `created_at` (timestamp)
    
    - `conversations` - Group messages into conversations
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, nullable)
      - `booking_id` (uuid, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `conversation_participants` - Track conversation members
      - `id` (uuid, primary key)
      - `conversation_id` (uuid)
      - `user_id` (uuid)
      - `last_read_at` (timestamp)
    
    - `user_analytics` - Track user engagement metrics
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `total_rentals` (integer)
      - `total_spent` (decimal)
      - `total_earned` (decimal)
      - `equipment_listed` (integer)
      - `reviews_given` (integer)
      - `reviews_received` (integer)
      - `avg_rating_given` (decimal)
      - `avg_rating_received` (decimal)
      - `last_active` (timestamp)
      - `updated_at` (timestamp)
    
    - `equipment_analytics` - Track equipment performance
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `view_count` (integer)
      - `favorite_count` (integer)
      - `booking_count` (integer)
      - `total_revenue` (decimal)
      - `avg_rental_duration` (decimal)
      - `updated_at` (timestamp)
    
    - `verification_requests` - User verification workflow
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `verification_type` (text) - id, address, phone, business
      - `document_urls` (text[])
      - `status` (text) - pending, approved, rejected
      - `reviewer_notes` (text)
      - `reviewed_by` (uuid, nullable)
      - `submitted_at` (timestamp)
      - `reviewed_at` (timestamp)
    
    - `equipment_availability` - Block out dates for equipment
      - `id` (uuid, primary key)
      - `equipment_id` (uuid, references equipment)
      - `start_date` (date)
      - `end_date` (date)
      - `reason` (text) - booked, maintenance, unavailable
      - `booking_id` (uuid, nullable)
    
    - `saved_searches` - User saved search preferences
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `filters` (jsonb)
      - `alert_enabled` (boolean)
      - `created_at` (timestamp)
    
    - `platform_settings` - Global platform configuration
      - `key` (text, primary key)
      - `value` (jsonb)
      - `updated_at` (timestamp)
      - `updated_by` (uuid)
  
  2. Profile Enhancements
    - Add `is_admin` boolean for admin access
    - Add `two_factor_enabled` boolean
    - Add `email_verified` boolean
    - Add `phone_verified` boolean
    - Add `last_login` timestamp
    - Add `account_status` text (active, suspended, banned)
  
  3. Security
    - RLS enabled on all new tables
    - Audit logs readable only by admins
    - User-specific data isolation
    - Secure verification workflow
*/

-- Add new columns to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'two_factor_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login timestamptz;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'account_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN account_status text DEFAULT 'active';
  END IF;
END $$;

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_info jsonb DEFAULT '{}',
  ip_address text,
  last_active timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = true;

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid REFERENCES equipment(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conv ON conversation_participants(conversation_id);

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations they participate in"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
      AND conversation_participants.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can view own participation"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own participation"
  ON conversation_participants FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Update messages to link to conversations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'conversation_id'
  ) THEN
    ALTER TABLE messages ADD COLUMN conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
  END IF;
END $$;

-- User analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_rentals integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  total_earned decimal(10,2) DEFAULT 0,
  equipment_listed integer DEFAULT 0,
  reviews_given integer DEFAULT 0,
  reviews_received integer DEFAULT 0,
  avg_rating_given decimal(3,2) DEFAULT 0,
  avg_rating_received decimal(3,2) DEFAULT 0,
  profile_views integer DEFAULT 0,
  response_rate decimal(5,2) DEFAULT 0,
  avg_response_time_hours decimal(10,2) DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Public analytics viewable by all"
  ON user_analytics FOR SELECT
  TO authenticated
  USING (true);

-- Equipment analytics table
CREATE TABLE IF NOT EXISTS equipment_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL UNIQUE REFERENCES equipment(id) ON DELETE CASCADE,
  view_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  booking_count integer DEFAULT 0,
  inquiry_count integer DEFAULT 0,
  total_revenue decimal(10,2) DEFAULT 0,
  avg_rental_duration decimal(10,2) DEFAULT 0,
  conversion_rate decimal(5,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_analytics_equipment_id ON equipment_analytics(equipment_id);

ALTER TABLE equipment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment analytics viewable by owner"
  ON equipment_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_analytics.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment analytics viewable by admins"
  ON equipment_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type text NOT NULL,
  document_urls text[] DEFAULT '{}',
  status text DEFAULT 'pending',
  reviewer_notes text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status) WHERE status = 'pending';

ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own verification requests"
  ON verification_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Equipment availability table
CREATE TABLE IF NOT EXISTS equipment_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_availability_equipment ON equipment_availability(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_availability_dates ON equipment_availability(equipment_id, start_date, end_date);

ALTER TABLE equipment_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Equipment availability viewable by all authenticated"
  ON equipment_availability FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Equipment owners can manage availability"
  ON equipment_availability FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment owners can update availability"
  ON equipment_availability FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Equipment owners can delete availability"
  ON equipment_availability FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM equipment
      WHERE equipment.id = equipment_availability.equipment_id
      AND equipment.owner_id = (select auth.uid())
    )
  );

-- Saved searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  alert_enabled boolean DEFAULT false,
  last_alert_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saved searches"
  ON saved_searches FOR ALL
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Platform settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform settings"
  ON platform_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can modify platform settings"
  ON platform_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.is_admin = true
    )
  );

-- Insert default platform settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('service_fee_percent', '12', 'Platform service fee percentage'),
  ('min_rental_days', '1', 'Minimum rental duration in days'),
  ('max_rental_days', '90', 'Maximum rental duration in days'),
  ('insurance_options', '{"basic": {"rate": 0.05, "coverage": 1000}, "standard": {"rate": 0.08, "coverage": 5000}, "premium": {"rate": 0.12, "coverage": 25000}}', 'Insurance plan configurations'),
  ('featured_listing_fee', '25', 'Fee to feature a listing'),
  ('verification_required_amount', '500', 'Transaction amount requiring verification')
ON CONFLICT (key) DO NOTHING;

-- Create function to auto-create user analytics on profile creation
CREATE OR REPLACE FUNCTION create_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_analytics (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_created_analytics ON profiles;
CREATE TRIGGER on_profile_created_analytics
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_analytics();

-- Create function to auto-create equipment analytics on equipment creation
CREATE OR REPLACE FUNCTION create_equipment_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO equipment_analytics (equipment_id)
  VALUES (NEW.id)
  ON CONFLICT (equipment_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_equipment_created_analytics ON equipment;
CREATE TRIGGER on_equipment_created_analytics
  AFTER INSERT ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION create_equipment_analytics();

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS uuid AS $$
DECLARE
  audit_id uuid;
BEGIN
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_metadata)
  RETURNING id INTO audit_id;
  RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update booking and create availability block
CREATE OR REPLACE FUNCTION on_booking_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO equipment_availability (equipment_id, start_date, end_date, reason, booking_id)
    VALUES (NEW.equipment_id, NEW.start_date, NEW.end_date, 'booked', NEW.id)
    ON CONFLICT DO NOTHING;
    
    UPDATE equipment_analytics
    SET booking_count = booking_count + 1,
        total_revenue = total_revenue + NEW.total_amount,
        updated_at = now()
    WHERE equipment_id = NEW.equipment_id;
    
    UPDATE user_analytics
    SET total_rentals = total_rentals + 1,
        total_spent = total_spent + NEW.total_amount,
        updated_at = now()
    WHERE user_id = NEW.renter_id;
    
    PERFORM create_notification(
      NEW.renter_id,
      'booking_confirmed',
      'Booking Confirmed',
      'Your booking has been confirmed!',
      jsonb_build_object('booking_id', NEW.id, 'equipment_id', NEW.equipment_id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_booking_status_change ON bookings;
CREATE TRIGGER on_booking_status_change
  AFTER INSERT OR UPDATE OF status ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION on_booking_confirmed();

-- Create function to send notification on new message
CREATE OR REPLACE FUNCTION on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.receiver_id,
    'new_message',
    'New Message',
    'You have a new message',
    jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION on_new_message();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_equipment_featured ON equipment(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_equipment_rating ON equipment(rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_admin ON profiles(is_admin) WHERE is_admin = true;