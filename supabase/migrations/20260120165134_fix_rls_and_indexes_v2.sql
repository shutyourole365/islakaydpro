/*
  # Security and Performance Fixes v2

  This migration re-applies all security and performance fixes to ensure they take effect.

  1. New Indexes on Foreign Keys
    - `idx_favorites_equipment_id` on favorites(equipment_id)
    - `idx_messages_equipment_id` on messages(equipment_id)
    - `idx_messages_sender_id` on messages(sender_id)
    - `idx_reviews_booking_id` on reviews(booking_id)
    - `idx_reviews_reviewee_id` on reviews(reviewee_id)
    - `idx_reviews_reviewer_id` on reviews(reviewer_id)

  2. RLS Policy Optimizations
    - All policies updated to use `(select auth.uid())` for better performance
    - Prevents re-evaluation of auth functions for each row

  3. Security
    - No changes to security model
    - No data modifications
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

DROP INDEX IF EXISTS idx_favorites_equipment_id;
CREATE INDEX idx_favorites_equipment_id ON favorites(equipment_id);

DROP INDEX IF EXISTS idx_messages_equipment_id;
CREATE INDEX idx_messages_equipment_id ON messages(equipment_id);

DROP INDEX IF EXISTS idx_messages_sender_id;
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

DROP INDEX IF EXISTS idx_reviews_booking_id;
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);

DROP INDEX IF EXISTS idx_reviews_reviewee_id;
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);

DROP INDEX IF EXISTS idx_reviews_reviewer_id;
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- PART 2: Recreate RLS Policies for Profiles
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================
-- PART 3: Recreate RLS Policies for Equipment
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;

CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================
-- PART 4: Recreate RLS Policies for Bookings
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings as renter" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings as owner" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Renters can update their pending bookings" ON bookings;
DROP POLICY IF EXISTS "Owners can update booking status" ON bookings;

CREATE POLICY "Users can view their own bookings as renter"
  ON bookings FOR SELECT
  TO authenticated
  USING (renter_id = (select auth.uid()));

CREATE POLICY "Users can view their own bookings as owner"
  ON bookings FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = (select auth.uid()));

CREATE POLICY "Renters can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (renter_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (renter_id = (select auth.uid()));

CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================
-- PART 5: Recreate RLS Policies for Reviews
-- ============================================

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;

CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = (select auth.uid()));

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (select auth.uid()))
  WITH CHECK (reviewer_id = (select auth.uid()));

-- ============================================
-- PART 6: Recreate RLS Policies for Favorites
-- ============================================

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 7: Recreate RLS Policies for Messages
-- ============================================

DROP POLICY IF EXISTS "Users can view messages they sent" ON messages;
DROP POLICY IF EXISTS "Users can view messages they received" ON messages;
DROP POLICY IF EXISTS "Users can send messages" ON messages;
DROP POLICY IF EXISTS "Receivers can mark messages as read" ON messages;

CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()));

CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (receiver_id = (select auth.uid()));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = (select auth.uid()))
  WITH CHECK (receiver_id = (select auth.uid()));
