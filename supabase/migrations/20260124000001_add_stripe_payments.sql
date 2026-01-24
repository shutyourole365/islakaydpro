-- Add Stripe payment infrastructure
-- This migration adds tables for payments, payouts, and Stripe integration

-- Add Stripe fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_connect_account_id text,
ADD COLUMN IF NOT EXISTS stripe_connect_onboarding_complete boolean DEFAULT false;

-- Create index for Stripe lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_connect ON profiles(stripe_connect_account_id) WHERE stripe_connect_account_id IS NOT NULL;

-- Add Stripe fields to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz,
ADD COLUMN IF NOT EXISTS payout_status text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS payout_id uuid;

-- Create index for Stripe session lookups
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session ON bookings(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment ON bookings(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount decimal(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded')),
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_charge_id text,
  payment_method text,
  refunded_amount decimal(10, 2) DEFAULT 0,
  refunded_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for payments
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- RLS for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Create payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  amount decimal(10, 2) NOT NULL,
  platform_fee decimal(10, 2) NOT NULL,
  currency text DEFAULT 'usd',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id text,
  stripe_payout_id text,
  failure_reason text,
  processed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for payouts
CREATE INDEX IF NOT EXISTS idx_payouts_booking ON payouts(booking_id);
CREATE INDEX IF NOT EXISTS idx_payouts_owner ON payouts(owner_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON payouts(created_at DESC);

-- RLS for payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (owner_id = (SELECT auth.uid()));

CREATE POLICY "Admins can view all payouts"
  ON payouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = (SELECT auth.uid()) 
      AND is_admin = true
    )
  );

-- Add foreign key for payout_id in bookings
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_payout
FOREIGN KEY (payout_id) REFERENCES payouts(id) ON DELETE SET NULL;

-- Create view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  date_trunc('day', p.created_at) as date,
  count(*) as transaction_count,
  sum(p.amount) as total_amount,
  sum(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as completed_amount,
  sum(CASE WHEN p.status = 'refunded' THEN p.refunded_amount ELSE 0 END) as refunded_amount,
  count(CASE WHEN p.status = 'completed' THEN 1 END) as successful_count,
  count(CASE WHEN p.status = 'failed' THEN 1 END) as failed_count
FROM payments p
GROUP BY date_trunc('day', p.created_at)
ORDER BY date DESC;

-- Grant access to the view for authenticated users
GRANT SELECT ON payment_analytics TO authenticated;

-- Create function to update booking payment status
CREATE OR REPLACE FUNCTION update_booking_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE bookings 
    SET 
      payment_status = 'paid',
      status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
      paid_at = now(),
      updated_at = now()
    WHERE id = NEW.booking_id;
  ELSIF NEW.status = 'refunded' THEN
    UPDATE bookings 
    SET 
      payment_status = 'refunded',
      updated_at = now()
    WHERE id = NEW.booking_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment status updates
DROP TRIGGER IF EXISTS on_payment_status_change ON payments;
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_payment();

-- Create function to update booking payout status
CREATE OR REPLACE FUNCTION update_booking_on_payout()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE bookings 
  SET 
    payout_status = NEW.status,
    updated_at = now()
  WHERE id = NEW.booking_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payout status updates
DROP TRIGGER IF EXISTS on_payout_status_change ON payouts;
CREATE TRIGGER on_payout_status_change
  AFTER UPDATE OF status ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_on_payout();

-- Add comments
COMMENT ON TABLE payments IS 'Records of all payment transactions';
COMMENT ON TABLE payouts IS 'Records of payouts to equipment owners';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payments';
COMMENT ON COLUMN profiles.stripe_connect_account_id IS 'Stripe Connect account ID for receiving payouts';

-- Grant necessary permissions
GRANT SELECT ON payments TO authenticated;
GRANT SELECT ON payouts TO authenticated;
