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
- **Frontend** — deployed on Vercel project `islakaydpro`
  (`prj_IqOmnrHsNbwjl4KmgD2Fxe8cgkiU`), auto-deploys from `main`, production
  build `READY`.
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
- [ ] Vercel → project `islakaydpro` → Settings → Environment Variables →
      set `VITE_STRIPE_PUBLIC_KEY=pk_test_...` (currently **empty** — this is why
      payments aren't wired on the frontend).
- [ ] **Redeploy** the Vercel site — Vite bakes `VITE_*` in at build time, so a
      redeploy is required for the new key to take effect.

When you're ready for real money: swap the four `test` values for `live` ones
(`pk_live_`, `sk_live_`, a live-mode webhook + its secret) and redeploy. Don't
mix test and live keys.

### 3. Pick ONE canonical project + domain, delete the rest
You have **9 Vercel projects** — this sprawl is the main source of "which one
is real?" confusion. Keep **`islakaydpro`** (it's the GitHub-connected,
auto-deploying one).

- [ ] **First**, in Vercel → each project → Settings → **Domains**, find which
      project your real domain (`islakayd.com` or similar) is attached to.
      Whichever holds the live domain is canonical — if that's not
      `islakaydpro`, re-point the domain to `islakaydpro` (or move the GitHub
      connection) **before** deleting anything.
- [ ] Verify `islakaydpro-legal` isn't separately serving your legal pages.
- [ ] Then delete the other 8: `islakaydpro-vrxb`, `islakayd`, `islakayd.`,
      `sb1-ur6rm1gb`, `islakayd-zpgm`, `islakayd-ysxn`, `islakaydpro-legal`,
      `islakad`.
- [ ] Set `VITE_APP_URL` in Vercel to your real domain → redeploy.

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
- [ ] Rollback path: Vercel → Deployments → previous `READY` → Promote (instant
      frontend rollback).

That's the whole launch. Steps 1–2 are the real blockers; 3 is cleanup; 4 is
verification. One focused evening.
