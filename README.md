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

Devcontainer check
- The devcontainer now runs a post-create check for sandbox binaries (`ripgrep`, `bubblewrap`, `socat`). If any are missing the check will fail and print install + rebuild instructions so the Codespaces sandbox and Vitest can run locally.

AI Assistant

- The project includes an AI assistant widget (`AIAssistant` + `AIAssistantEnhanced`).
- To enable the real LLM-backed assistant set `VITE_ENABLE_AI=true` and provide an `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`.
- Users can toggle the LLM per‑device in **Settings → AI Assistant** (preference stored in localStorage). When signed-in the preference is also saved to the user's profile (`ai_assistant_enabled`) so it follows the user across devices. Run the new DB migration in `supabase/migrations/20260218120000_add_ai_assistant_pref_to_profiles.sql` to add the column.
- The AI backend is implemented as a Supabase Edge Function at `supabase/functions/ai-chat` which proxies to OpenAI/Anthropic and falls back to rule-based responses when no API key is configured. Responses are streamed back to the client allowing the assistant widget to render text in real time, emulating a typing effect.
- The frontend (`src/components/ai/AIAssistantEnhanced.tsx`) builds conversation history, sends it via the service layer, and displays incremental chunks as they arrive. Quick‑action buttons are hidden while Kayd is composing a reply and reappear once the message completes.

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
