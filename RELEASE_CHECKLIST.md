# Release Checklist — Islakayd

Pre-launch punch list. Walk top-to-bottom. Anything marked **YOU** needs you to log into the platform; anything marked **CLAUDE** I can do via MCP once you say "go" on that section.

**Prod environments confirmed via MCP:**
- Supabase project: `ialxlykysbqyiejepzkx` (pro.1)
- GitHub repo: `shutyourole365/islakaydpro`
- Netlify projects: `islakaydpro` + `islakayd1` (two deploys, unclear which is canonical — confirm)
- Edge Functions on prod: 12 deployed; last refresh ~Mar 2026 (may be stale)

---

## Phase 0 — MVP scope decisions (15 min, **YOU**)

Before touching any config, decide what's IN the launch. The unwired-features inventory found 4 features that look complete in the UI but are pure mockware:

- [ ] **`PriceNegotiator`** — owner never actually receives or responds. Either build the workflow (~M effort) or remove the entry points.
- [ ] **`BlockchainContract`** — generates random hex strings, no chain integration. Either remove or label as "Coming soon" in UI.
- [ ] **`AdvancedPayments`** non-Stripe tabs (Apple Pay, Google Pay, crypto, PayPal, bank) — only the Card path has real Stripe wiring. Remove the other tabs until they have gateways.
- [ ] **`AIDamageDetection.analyzePhotos`** — sleeps 3s and returns hardcoded mock damage. Either wire to a vision API (Claude vision, AWS Rekognition) or remove the feature.

Also confirm:
- [ ] Which Netlify project (`islakaydpro` vs `islakayd1`) is canonical for the production domain? The other should be deleted or relegated to staging.

When you've decided, tell me which to keep and I'll write a "MVP scope tightening" PR that removes the rest.

---

## Phase 1 — Supabase Edge Function secrets (30 min, **YOU**)

Set these via the Supabase dashboard (Project Settings → Edge Functions → Secrets) OR via the CLI:

```bash
supabase secrets set --project-ref ialxlykysbqyiejepzkx \
  STRIPE_SECRET_KEY=sk_live_... \
  STRIPE_WEBHOOK_SECRET=whsec_... \
  ANTHROPIC_API_KEY=sk-ant-... \
  RESEND_API_KEY=re_... \
  VAPID_PUBLIC_KEY=BJ... \
  VAPID_PRIVATE_KEY=... \
  VAPID_SUBJECT=mailto:support@islakayd.com
```

**Auto-set by Supabase** (don't touch):
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**You'll need from upstream:**

| Secret | Where to get it | Required by |
|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys → live `sk_live_...` | `create-checkout`, `stripe-webhook` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → Add endpoint → see below | `stripe-webhook` |
| `ANTHROPIC_API_KEY` *and/or* `OPENAI_API_KEY` | console.anthropic.com or platform.openai.com | `ai-chat` |
| `RESEND_API_KEY` | resend.com → API Keys | `send-email` |
| `FROM_EMAIL` (optional) | Defaults to `'Islakayd <noreply@islakayd.com>'` | `send-email` |
| `VAPID_PUBLIC_KEY` + `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` (run locally, paste both) | `push-notification` |
| `VAPID_SUBJECT` | A `mailto:` you own | `push-notification` |

**Stripe webhook endpoint setup:**
1. In Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://ialxlykysbqyiejepzkx.supabase.co/functions/v1/stripe-webhook`
3. Events to send: at minimum `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`, `transfer.created`
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` above.

---

## Phase 2 — Netlify build env vars (15 min, **YOU**)

Site Settings → Environment Variables → Set for "Same value for all deploy contexts" unless noted.

Required:
- [ ] `VITE_SUPABASE_URL=https://ialxlykysbqyiejepzkx.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY=eyJ...` (Supabase Dashboard → Project Settings → API → `anon` `public` key)
- [ ] `VITE_STRIPE_PUBLIC_KEY=pk_live_...` (live publishable)
- [ ] `VITE_APP_URL=https://islakayd.com` (your real prod domain)
- [ ] `VITE_ENABLE_AI=true`

Strongly recommended:
- [ ] `VITE_SENTRY_DSN=https://...@sentry.io/...`
- [ ] `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
- [ ] `VITE_ENABLE_ANALYTICS=true`
- [ ] `VITE_APP_VERSION` — set per-deploy. In `netlify.toml` add: `VITE_APP_VERSION = "$COMMIT_REF"` so Sentry events tag the git SHA.
- [ ] `VITE_VAPID_PUBLIC_KEY` — same value as server-side `VAPID_PUBLIC_KEY` from Phase 1.

Social links (only the ones you actually have — empty values render no icon, that's intentional):
- [ ] `VITE_FACEBOOK_URL`, `VITE_TWITTER_URL`, `VITE_INSTAGRAM_URL`, `VITE_LINKEDIN_URL`, `VITE_YOUTUBE_URL`

After setting all of these: **redeploy the site** (Netlify → Deploys → Trigger deploy). Vite reads env vars at build time, not runtime.

---

## Phase 3 — External service setup (1-2 hrs, **YOU**)

### Stripe Connect (for owners to receive payouts)
- [ ] Enable Connect in Stripe Dashboard → Settings → Connect
- [ ] Set Connect platform settings (branding, redirect URL, etc.)
- [ ] The frontend already has the Connect onboarding flow — once you complete your platform setup, real owners can complete onboarding through the app and be paid

### Domain + DNS
- [ ] In Netlify → Domain Management, add custom domain (e.g. `islakayd.com`)
- [ ] At your DNS provider, point the A record / CNAME at Netlify as instructed
- [ ] Confirm SSL is provisioned (Netlify does Let's Encrypt automatically)
- [ ] Set `VITE_APP_URL` to match (Phase 2)

### Email deliverability (Resend)
- [ ] Add and verify your domain in Resend (DKIM + SPF DNS records)
- [ ] If you set `FROM_EMAIL=Islakayd <noreply@islakayd.com>`, the `islakayd.com` domain must be the one verified

### Sentry
- [ ] Create Sentry project → JavaScript / React platform
- [ ] Copy DSN to `VITE_SENTRY_DSN`
- [ ] Set up Slack or email alert rules — e.g. alert when error rate > 5/min, or any new issue

### GA4
- [ ] Create GA4 property
- [ ] Copy Measurement ID to `VITE_GA_MEASUREMENT_ID`

### Mobile (Android only — iOS is separate scope)
- [ ] Generate a release keystore: `keytool -genkey -v -keystore islakayd-release.keystore -alias islakayd -keyalg RSA -keysize 2048 -validity 10000`
- [ ] Base64 encode: `base64 -w 0 islakayd-release.keystore > keystore.base64`
- [ ] Set in GitHub → Settings → Secrets and variables → Actions:
  - `ANDROID_KEYSTORE_BASE64` (contents of `keystore.base64`)
  - `ANDROID_KEYSTORE_PASSWORD`
  - `ANDROID_KEY_ALIAS=islakayd`
  - `ANDROID_KEY_PASSWORD`
- [ ] Run `.github/workflows/build-android.yml` to produce a signed AAB
- [ ] Upload to Play Store internal testing track

---

## Phase 4 — Security fixes (CLAUDE, after you authorize)

Supabase advisor flagged **22+ WARN-level issues** on prod. The highest-impact:

- [ ] **`equipment-images` public bucket allows file listing** — anyone can enumerate every uploaded image. Tighten the SELECT policy.
- [ ] **Materialized view `equipment_owner_counts` exposed to anon** — likely a data leak.
- [ ] **22 SECURITY DEFINER functions callable as `anon`** — most are trigger functions (e.g. `handle_new_user`, `notify_booking_changes`, `update_booking_on_payment`) that should NEVER be exposed as REST RPCs. Need to `REVOKE EXECUTE` from `anon` and `authenticated` where they're not meant to be called directly.
- [ ] **2 functions have mutable `search_path`** — search_path injection risk; pin to `public, pg_temp`.

I'll write this as a single security-tightening migration. Will share the migration text for your review BEFORE I apply it to prod (this is the kind of migration that could break things if a function relied on its elevated privilege).

---

## Phase 5 — Code-level launch polish (CLAUDE, when ready)

- [ ] MVP scope tightening PR per Phase 0 decisions
- [ ] Replace the 5 demo-data fallbacks (`GroupBookingCoordinator.demoBooking`, `RentalContractViewer.demoContract`, `EquipmentRecommendations.demoEquipment`, `QRCheckInOut.generateQRValue` random string, `VoiceSearch` random waveform) with empty states or real backend data
- [ ] Audit `supabase/policies/*.md` — legal pages (Terms, Privacy, Cookies). Are these real or placeholder text?
- [ ] Edge Function drift: diff the 9 repo-tracked functions against deployed versions; redeploy any that have drifted
- [ ] Decide: delete or deploy `supabase/functions/run-migration` (in repo, not deployed)
- [ ] Decide: pull the 4 dashboard-only functions (`analytics-conn`, `keep-alive`, `refresh-notification-analytics`, `refresh_equipment_owner_counts`) into the repo so they're version-controlled

---

## Phase 6 — End-to-end smoke test (1 hr, **YOU** + **CLAUDE**)

Run AFTER Phases 1-3 complete and security migration applied. Test on **production**, not preview, because some integrations (Stripe webhooks, push, emails) only work against the real endpoints.

Happy path (do as a test user with a Stripe test card `4242 4242 4242 4242`):

1. [ ] Sign up with a fresh email; receive welcome email (tests Resend)
2. [ ] Verify email
3. [ ] List a piece of equipment (tests `equipment` insert + storage upload)
4. [ ] As a second test user, find and book the listing
5. [ ] Complete Stripe checkout (tests `create-checkout` + `stripe-webhook`)
6. [ ] Confirm booking shows up in both users' dashboards
7. [ ] Send a message between the two users (tests `messages` table + Realtime)
8. [ ] Owner: complete Stripe Connect onboarding
9. [ ] Owner: receive payout for the booking (tests `payouts` function)
10. [ ] Both: leave reviews
11. [ ] Open the AI assistant; ask a question (tests `ai-chat` + LLM key)

While running this, watch:
- [ ] Sentry for any new issues
- [ ] Supabase Dashboard → Logs for errors
- [ ] Stripe Dashboard → Events for webhook delivery
- [ ] Resend Dashboard → Logs for email delivery

Use real test cards (Stripe lists them) but **switch to live mode in Stripe** before this — otherwise the Connect / webhook flow won't be in the configuration you'll ship.

---

## Phase 7 — Day-of launch (**YOU**)

- [ ] Tag the release: `git tag -a v1.0.0 -m "Initial release" && git push --tags`
- [ ] Confirm Sentry alert rules are armed and point at a channel you'll see
- [ ] Have a rollback path ready:
  - Netlify → Deploys → previous successful deploy → Publish (instant rollback for frontend)
  - Edge Functions: redeploy previous version via `supabase functions deploy <slug> --no-verify-jwt` from a previous commit
  - Database: migrations don't auto-rollback. Have a hand-written DOWN migration for any risky change (the security migration in Phase 4 should ship with one)
- [ ] First 24h: check Sentry every couple of hours
- [ ] Set a calendar reminder for 7-day post-launch review

---

## What I (Claude) cannot do — confirming the boundaries

Per session policy and platform reality, I can't:
- Log into Netlify / Supabase / Stripe / GA4 / Resend dashboards for you (they're auth-walled to you)
- Read any actual secret value (no MCP tool exposes that)
- Type your domain registrar credentials
- Sign your Android keystore on your behalf

I CAN, with your approval per action:
- Apply migrations to prod via Supabase MCP
- Deploy Edge Functions to prod via Supabase MCP
- Update Netlify project settings via Netlify MCP (haven't confirmed the updater tool supports env vars yet — may still need you for those)
- Open / merge PRs via GitHub MCP

When you're ready to start Phase 4, tell me and I'll draft the security-tightening migration for review.
