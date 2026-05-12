-- Fix conversations table: add 'participants' uuid[] column
-- MessagingPage.tsx uses .contains('participants', [user.id])
-- but old migration added 'participant_ids' - add both for compatibility

ALTER TABLE conversations ADD COLUMN IF NOT EXISTS participants uuid[] DEFAULT '{}';

-- Backfill participants from conversation_participants join table
UPDATE conversations c
SET participants = (
  SELECT ARRAY_AGG(cp.user_id)
  FROM conversation_participants cp
  WHERE cp.conversation_id = c.id
)
WHERE participants = '{}' OR participants IS NULL;

-- RLS: users can only see conversations they're in
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = ANY(participants));

DROP POLICY IF EXISTS "Users can update their conversations" ON conversations;
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = ANY(participants));

-- Messages: ensure RLS allows participants to see messages
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
CREATE POLICY "Participants can insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

DROP POLICY IF EXISTS "Participants can update message read status" ON messages;
CREATE POLICY "Participants can update message read status"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participants)
    )
  );

-- Index for fast participant lookups
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
-- Note: messages uses 'is_read' not 'read' — partial index omitted to avoid column-not-found error

-- Notifications RLS (ensure user can see their own)
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
