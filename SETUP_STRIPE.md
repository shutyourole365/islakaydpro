# Setting Up Stripe Payments for Islakayd

This guide gets Stripe fully working: renters pay → you collect a fee → owners get paid out to their Australian bank.

---

## 1. Create a Stripe account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up and complete identity verification (required for AU payouts)
3. Enable **live mode** when you're ready for real payments (use test mode to start)

---

## 2. Get your API keys

In Stripe Dashboard → Developers → API keys:

| Key | Where to put it |
|-----|----------------|
| **Publishable key** (`pk_test_...`) | `VITE_STRIPE_PUBLIC_KEY` in Netlify env vars |
| **Secret key** (`sk_test_...`) | `STRIPE_SECRET_KEY` in Supabase Edge Function secrets |

---

## 3. Set keys in Supabase Edge Functions

In your Supabase project → Edge Functions → Secrets:

```
STRIPE_SECRET_KEY = sk_test_your_key_here
STRIPE_WEBHOOK_SECRET = whsec_your_webhook_secret (set this in step 4)
```

---

## 4. Set up the Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
3. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

---

## 5. Enable Stripe Connect (owner payouts)

Stripe Connect lets you split payments between your platform and equipment owners.

1. Stripe Dashboard → Connect → Get started
2. Choose **Express** accounts (simplest for AU individuals)
3. Complete your platform profile

No extra code needed — the `payouts` edge function handles Connect automatically.

---

## 6. Set publishable key in Netlify

Netlify Dashboard → Site → Environment Variables → Add:

```
VITE_STRIPE_PUBLIC_KEY = pk_test_your_publishable_key
```

Redeploy after adding.

---

## 7. Test it

1. Use test card `4242 4242 4242 4242` (any future date, any CVC)
2. For AU BECS debit: BSB `000-000`, account `000123456`
3. Check Stripe Dashboard → Payments to see the test charge

---

## Platform fee

Islakayd charges renters a **10% service fee** on top of the rental subtotal. This is handled in the checkout edge function.

Owners receive the **subtotal** (daily rate × days) minus nothing — the fee is added on top for the renter.

---

## Currency

All amounts are in **AUD**. The checkout and payout functions are configured for `aud` currency and Australian bank accounts.
