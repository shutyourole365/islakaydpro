/*
  # Security and Performance Fixes

  1. New Indexes
    - Add missing indexes on foreign keys for better query performance:
      - `favorites.equipment_id`
      - `messages.equipment_id`
      - `messages.sender_id`
      - `reviews.booking_id`
      - `reviews.reviewee_id`
      - `reviews.reviewer_id`

  2. RLS Policy Optimizations
    - Update all RLS policies to use `(select auth.uid())` instead of `auth.uid()`
    - This prevents re-evaluation of auth functions for each row, improving performance at scale

  3. Security
    - All changes maintain existing security model
    - No data modifications
*/

-- ============================================
-- PART 1: Add Missing Foreign Key Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_favorites_equipment_id ON favorites(equipment_id);
CREATE INDEX IF NOT EXISTS idx_messages_equipment_id ON messages(equipment_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);

-- ============================================
-- PART 2: Optimize RLS Policies for Profiles
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================
-- PART 3: Optimize RLS Policies for Equipment
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own equipment" ON equipment;
CREATE POLICY "Users can insert their own equipment"
  ON equipment FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own equipment" ON equipment;
CREATE POLICY "Users can update their own equipment"
  ON equipment FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own equipment" ON equipment;
CREATE POLICY "Users can delete their own equipment"
  ON equipment FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- ============================================
-- PART 4: Optimize RLS Policies for Bookings
-- ============================================

DROP POLICY IF EXISTS "Users can view their own bookings as renter" ON bookings;
CREATE POLICY "Users can view their own bookings as renter"
  ON bookings FOR SELECT
  TO authenticated
  USING (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view their own bookings as owner" ON bookings;
CREATE POLICY "Users can view their own bookings as owner"
  ON bookings FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Renters can update their pending bookings" ON bookings;
CREATE POLICY "Renters can update their pending bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (renter_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (renter_id = (select auth.uid()));

DROP POLICY IF EXISTS "Owners can update booking status" ON bookings;
CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ============================================
-- PART 5: Optimize RLS Policies for Reviews
-- ============================================

DROP POLICY IF EXISTS "Users can create reviews for their bookings" ON reviews;
CREATE POLICY "Users can create reviews for their bookings"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (reviewer_id = (select auth.uid()))
  WITH CHECK (reviewer_id = (select auth.uid()));

-- ============================================
-- PART 6: Optimize RLS Policies for Favorites
-- ============================================

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can add favorites" ON favorites;
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can remove their favorites" ON favorites;
CREATE POLICY "Users can remove their favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- PART 7: Optimize RLS Policies for Messages
-- ============================================

DROP POLICY IF EXISTS "Users can view messages they sent" ON messages;
CREATE POLICY "Users can view messages they sent"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view messages they received" ON messages;
CREATE POLICY "Users can view messages they received"
  ON messages FOR SELECT
  TO authenticated
  USING (receiver_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = (select auth.uid()));

DROP POLICY IF EXISTS "Receivers can mark messages as read" ON messages;
CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  TO authenticated
  USING (receiver_id = (select auth.uid()))
  WITH CHECK (receiver_id = (select auth.uid()));
