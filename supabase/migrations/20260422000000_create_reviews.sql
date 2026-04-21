-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  response TEXT,
  is_equipment_review BOOLEAN DEFAULT true,
  equipment_condition INTEGER CHECK (equipment_condition >= 1 AND equipment_condition <= 5),
  communication INTEGER CHECK (communication >= 1 AND communication <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_equipment_id ON reviews(equipment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Prevent duplicate reviews per booking per reviewer
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_booking_reviewer 
  ON reviews(booking_id, reviewer_id) 
  WHERE booking_id IS NOT NULL;

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Reviewers can update their own reviews (within 48 hours)
CREATE POLICY "Reviewers can update own reviews" ON reviews
  FOR UPDATE USING (
    auth.uid() = reviewer_id 
    AND created_at > NOW() - INTERVAL '48 hours'
  );

-- Equipment owners can add a response (update response field only)
CREATE POLICY "Equipment owners can respond to reviews" ON reviews
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT owner_id FROM equipment WHERE id = reviews.equipment_id
    )
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_reviews_updated_at();

-- Function to recalculate equipment rating after review insert/update/delete
CREATE OR REPLACE FUNCTION update_equipment_rating()
RETURNS TRIGGER AS $$
DECLARE
  eq_id UUID;
BEGIN
  eq_id := COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  IF eq_id IS NOT NULL THEN
    UPDATE equipment SET
      rating = (
        SELECT ROUND(AVG(rating)::numeric, 2)
        FROM reviews
        WHERE equipment_id = eq_id AND is_equipment_review = true
      ),
      total_reviews = (
        SELECT COUNT(*)
        FROM reviews
        WHERE equipment_id = eq_id AND is_equipment_review = true
      )
    WHERE id = eq_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_equipment_rating
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_equipment_rating();
