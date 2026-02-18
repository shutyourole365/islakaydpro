-- Add ai_assistant_enabled preference to profiles

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_assistant_enabled boolean DEFAULT true;

-- Backfill existing rows to true where NULL
UPDATE profiles SET ai_assistant_enabled = true WHERE ai_assistant_enabled IS NULL;

COMMENT ON COLUMN profiles.ai_assistant_enabled IS 'User preference: enable LLM-powered AI assistant (true = enabled)';
