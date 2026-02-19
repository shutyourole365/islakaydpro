islakaydpro

Quick start

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and optional LLM keys
   ```

2. Run dev server:

   ```bash
   npm install
   npm run dev
   ```

AI Assistant

- The project includes an AI assistant widget (`AIAssistant` + `AIAssistantEnhanced`).
- To enable the real LLM-backed assistant set `VITE_ENABLE_AI=true` and provide an `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
- Users can toggle the LLM per‑device in **Settings → AI Assistant** (preference stored in localStorage). When signed-in the preference is also saved to the user's profile (`ai_assistant_enabled`) so it follows the user across devices. Run the new DB migration in `supabase/migrations/20260218120000_add_ai_assistant_pref_to_profiles.sql` to add the column.
- The AI backend is implemented as a Supabase Edge Function at `supabase/functions/ai-chat` which proxies to OpenAI/Anthropic and falls back to rule-based responses when no API key is configured.

Files to check:
- `src/components/ai/AIAssistant.tsx` — lightweight assistant (now supports streaming from the Edge Function)
- `src/components/ai/AIAssistantEnhanced.tsx` — advanced assistant (already wired to AI service)
- `supabase/functions/ai-chat` — server-side AI proxy (reads OPENAI_API_KEY / ANTHROPIC_API_KEY)
- `supabase/migrations/*_create_ai_events.sql` — telemetry table for AI assistant events

Telemetry / analytics

- The app now records AI usage and feedback in `ai_events` (events: assistant_opened, assistant_closed, toggle_llm, message_sent, response_received, feedback, image_uploaded, image_analyzed).
- Admin → Overview shows a simple card with AI events (last 7 days); **Admin → AI Telemetry** provides a detailed, filterable event log for analysis.

Security / notes

- Do NOT commit API keys to Git. Use environment variables or your deployment provider secrets.
- Edge Function requires `SUPABASE_SERVICE_ROLE_KEY` locally for some operations.

<!-- ci: trigger -->
