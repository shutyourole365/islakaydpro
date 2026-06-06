# 🚀 Launch Now — Islakayd

The short list. Everything in the repo is done; what's left is account-side
chores only you can do. Verified live state as of 2026-06-03 below — this is
**not** the old aspirational checklist, it reflects what's actually deployed.

## Already done ✅ (verified live, don't redo)

- **Code** — complete, on `main`.
- **Database** — Supabase project `yhzmgjzshadmcgencccj` (`ACTIVE_HEALTHY`).
  All 33 tables present, RLS enabled on every one, `categories` (15 rows) and
  `platform_settings` (6 rows) seeded.
- **Edge Functions** — 5 deployed & `ACTIVE`: `ai-chat`, `create-checkout`,
  `stripe-webhook`, `payouts`, `send-email`.
- **Frontend** — **Netlify is the canonical host** (project `islakayden`).
  `netlify.toml` is already configured (build `npx vite build`, publish `dist`,
  SPA redirect, Node 20) and deploy previews build cleanly. The old Vercel
  project sprawl is being retired (Vercel team plan is paused for billing —
  irrelevant now that we're on Netlify).
- **Security audit** — clean. The one advisor warning (`increment_view_count`
  callable by anon) is an intentional design (anonymous view counter,
  minimal-scope `SECURITY DEFINER`, pinned `search_path`) — leave it.
  Performance advisors are all optimize-at-scale noise (no data yet).

---

## The 4 steps to launch

### 1. Confirm Edge Function secrets are set  ⬅ TOP BLOCKER
Supabase Dashboard → Project `yhzmgjzshadmcgencccj` → **Edge Functions →
Secrets**. These can't be read by tooling, so eyeball that each exists:

- [ ] `STRIPE_SECRET_KEY` — `sk_test_...` for a free test-mode launch
- [ ] `STRIPE_WEBHOOK_SECRET` — `whsec_...` (created in step 2)
- [ ] `ANTHROPIC_API_KEY` — for the AI assistant (`ai-chat`)
- [ ] `RESEND_API_KEY` — for transactional email (`send-email`)

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided — don't touch.

If any are missing, the related feature **fails silently**. This is the single
most likely reason something "doesn't work" after launch.

### 2. Wire Stripe (test mode — free, zero real-money risk)
- [ ] Stripe Dashboard (toggle to **Test mode**) → API Keys → copy `pk_test_...`
      and `sk_test_...`.
- [ ] Set `sk_test_...` as `STRIPE_SECRET_KEY` (step 1).
- [ ] Stripe → **Webhooks → Add endpoint**:
      `https://yhzmgjzshadmcgencccj.supabase.co/functions/v1/stripe-webhook`
      Events: `checkout.session.completed`, `payment_intent.succeeded`,
      `payment_intent.payment_failed`, `account.updated`, `transfer.created`.
      Copy the signing secret → set as `STRIPE_WEBHOOK_SECRET` (step 1).
- [ ] Netlify → site `islakayden` → Site settings → **Environment variables** →
      set `VITE_STRIPE_PUBLIC_KEY=pk_test_...` (currently **empty** — this is why
      payments aren't wired on the frontend). While here, confirm
      `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the long legacy `eyJ…` JWT,
      **not** the `sb_publishable_…` key), `VITE_APP_URL`, and `VITE_ENABLE_AI`
      are set.
- [ ] **Redeploy** the Netlify site (Deploys → Trigger deploy) — Vite bakes
      `VITE_*` in at build time, so a redeploy is required for the new key to
      take effect.

When you're ready for real money: swap the four `test` values for `live` ones
(`pk_live_`, `sk_live_`, a live-mode webhook + its secret) and redeploy. Don't
mix test and live keys.

### 3. Clean up the abandoned hosts (Netlify is canonical)
Decision made: **Netlify site `islakayden` is the production host.** The Vercel
side is being retired — that sprawl (9 Vercel projects) plus the paused Vercel
billing is no longer relevant.

- [ ] Point your real domain (`islakayd.com` or similar) at the `islakayden`
      Netlify site: Netlify → Domain management → add custom domain, then update
      DNS as instructed. Confirm SSL provisions (Netlify does Let's Encrypt
      automatically).
- [ ] Set `VITE_APP_URL` in Netlify to that domain → redeploy.
- [ ] Disconnect/delete the Vercel projects so nothing auto-deploys or confuses
      future you: `islakaydpro`, `islakaydpro-vrxb`, `islakayd`, `islakayd.`,
      `sb1-ur6rm1gb`, `islakayd-zpgm`, `islakayd-ysxn`, `islakaydpro-legal`,
      `islakad`. (Check Domains on each first — don't delete one that still
      holds the live domain until DNS is re-pointed to Netlify.)

### 4. Smoke test (test card `4242 4242 4242 4242`)
On the live site, run the happy path end-to-end:
- [ ] Sign up with a fresh email → welcome email arrives (tests `send-email` + Resend)
- [ ] List a piece of equipment (tests `equipment` insert + image upload)
- [ ] As a 2nd user, book it → complete Stripe checkout (tests `create-checkout`
      + `stripe-webhook`)
- [ ] Booking shows in both dashboards
- [ ] Send a message between the two users (tests Realtime)
- [ ] Leave a review
- [ ] Open the AI assistant, ask a question (tests `ai-chat` + `ANTHROPIC_API_KEY`)

Watch while testing: Supabase → Logs, Stripe → Events (webhook delivery),
Resend → Logs (email delivery).

---

## After it's green
- [ ] Free-tier note: the Supabase project pauses after ~7 days idle. Deploy the
      `keep-alive` function or ping the app periodically.
- [ ] Tag the release: `git tag -a v1.0.0 -m "Initial release" && git push --tags`
- [ ] Rollback path: Netlify → Deploys → previous successful deploy → Publish
      (instant frontend rollback).

That's the whole launch. Steps 1–2 are the real blockers; 3 is cleanup; 4 is
verification. One focused evening.
