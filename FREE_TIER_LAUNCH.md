# Free-Tier Launch Guide — Islakayd

A zero-cost path to get Islakayd live, for when the paid Supabase/Vercel
plans aren't an option. The app's entire schema lives in `supabase/migrations/`,
so the database can be rebuilt for free from scratch.

> The existing `RELEASE_CHECKLIST.md` assumes the paid prod project. This guide
> replaces the hosting/database steps with free-tier equivalents. Everything
> else in that checklist (Stripe test mode, Resend, Sentry, GA) already has a
> free tier.

---

## 1. Database — Supabase Free tier

The current org (`IslaKayd`) has unpaid invoices, which blocks restoring or
creating projects under it. Use a **fresh Supabase account/org on the Free
plan** instead.

1. Create a new Supabase account (a different email works) and a **Free** project.
2. Apply the schema. Either:
   - **Dashboard:** SQL Editor → paste each file in `supabase/migrations/`
     **in filename order** (they are timestamp-prefixed), then run `SEED_DATA.sql`.
   - **CLI:** `supabase link --project-ref <new-ref>` then `supabase db push`.
3. Verify: `categories` should have ~20 rows after `SEED_DATA.sql`.

**Audited:** all 22 migrations + `SEED_DATA.sql` apply cleanly, in order, on a
fresh Postgres (35 tables). See `supabase/local-bootstrap.sql` to re-test
locally — it stands up a minimal Supabase-like environment (auth/storage
schemas, roles, `auth.uid()`), after which the migrations apply unmodified.

```bash
# local re-verification (needs a local postgres)
psql -d appdb -f supabase/local-bootstrap.sql
for f in supabase/migrations/*.sql; do psql -d appdb -v ON_ERROR_STOP=1 -f "$f" || break; done
psql -d appdb -f SEED_DATA.sql
```

Free-tier note: projects pause after ~7 days of inactivity. The repo's
`keep-alive` edge function exists to ping it; deploy it (or hit the app
periodically) to avoid pausing.

## 2. Hosting — Netlify Free

`netlify.toml` is already configured (build `npx vite build`, publish `dist`,
SPA redirect, Node 20).

1. Create a free Netlify account, "Add new site" → import this GitHub repo.
2. Set **Environment variables** (Site settings → Environment variables):
   - `VITE_SUPABASE_URL` = your new project URL
   - `VITE_SUPABASE_ANON_KEY` = the project's **legacy anon JWT** key (Project Settings → API → "Legacy anon, service_role" tab — the long `eyJ…` value). **Do not** use the `sb_publishable_…` key: the pinned `@supabase/supabase-js` (2.57.x) doesn't fully support that format and the client errors at startup.
   - `VITE_APP_URL` = your Netlify URL (e.g. `https://islakayd.netlify.app`)
   - `VITE_ENABLE_AI` = `true` (optional)
   - `VITE_STRIPE_PUBLIC_KEY` = `pk_test_...` (Stripe **test** mode for free)
3. Deploy. Vite reads `VITE_*` at build time, so redeploy after changing them.

## 3. Edge Functions (optional but needed for payments/email/AI)

Deploy from `supabase/functions/` with the CLI (free):

```bash
supabase functions deploy ai-chat create-checkout stripe-webhook send-email --project-ref <new-ref>
```

Set their secrets (Project Settings → Edge Functions → Secrets) — use **test**
keys: `STRIPE_SECRET_KEY=sk_test_...`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, etc.
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are auto-provided.

## 4. Smoke test

Follow `RELEASE_CHECKLIST.md` Phase 6 (sign up → list → book with Stripe test
card `4242 4242 4242 4242` → message → review → AI assistant), pointed at the
Netlify URL.

---

## Follow-ups that still need a backend (deferred)

- **WebAuthn** biometric auth works client-side now, but a full security
  boundary needs server-issued challenges + assertion verification (an edge
  function + a `webauthn_credentials` table).
- **PriceAlerts** UI exists but needs a `price_alerts` table before it can be
  wired in.
