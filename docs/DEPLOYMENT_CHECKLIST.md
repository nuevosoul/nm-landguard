# RGDD Stripe Integration — Deployment Checklist

**Created:** 2026-01-29  
**Status:** Ready for deployment

---

## ✅ Code Complete

All code is written and committed:

- [x] `supabase/functions/create-checkout/index.ts` — Creates Stripe Checkout sessions
- [x] `supabase/functions/stripe-webhook/index.ts` — Handles payment confirmations
- [x] `supabase/functions/verify-payment/index.ts` — Verifies payments for frontend
- [x] `supabase/migrations/20260129_create_orders_table.sql` — Database schema
- [x] `supabase/config.toml` — Functions configured (verify_jwt = false)
- [x] `src/components/PaymentModal.tsx` — Real Stripe Checkout redirect
- [x] `src/pages/Index.tsx` — Success/cancel URL handling

---

## 🔧 Deployment Steps

### 1. Stripe Setup (Stripe Dashboard)

```
Dashboard URL: https://dashboard.stripe.com
```

- [ ] Create Stripe account (if not exists)
- [ ] Complete business verification
- [ ] Create Product:
  - Name: "Environmental Due Diligence Report"
  - Price: $499.00 USD (one-time)
  - Copy the Price ID (`price_xxx...`)

### 2. Supabase Secrets (Edge Functions)

```
Supabase Dashboard → Project Settings → Edge Functions → Secrets
```

Add these secrets:

| Secret | Description |
|--------|-------------|
| `STRIPE_SECRET_KEY` | From Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | From webhook endpoint (step 4) |
| `STRIPE_PRICE_ID` | The `price_xxx` from step 1 |

Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` should already be available.

### 3. Database Migration

Run in Supabase SQL Editor:

```sql
-- Copy contents of supabase/migrations/20260129_create_orders_table.sql
```

Or deploy via CLI:

```bash
supabase db push
```

### 4. Deploy Edge Functions

```bash
cd ~/clawd/nm-landguard
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy verify-payment
```

### 5. Configure Stripe Webhook

```
Stripe Dashboard → Developers → Webhooks → Add endpoint
```

- URL: `https://blljytcfahrgtksbzkuh.supabase.co/functions/v1/stripe-webhook`
- Events to subscribe:
  - `checkout.session.completed`
  - `checkout.session.expired`
  - `payment_intent.payment_failed`
- Copy the Signing Secret → Update `STRIPE_WEBHOOK_SECRET` in Supabase

### 6. Deploy Frontend (if using Lovable)

Push to main branch — Lovable auto-deploys.

---

## 🧪 Testing

### Test Cards (Stripe Test Mode)

| Card | Scenario |
|------|----------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 3220` | 3D Secure |
| `4000 0000 0000 9995` | Decline |

Use any future expiry, any CVC.

### Test Flow

1. [ ] Search for NM address
2. [ ] Click "Run Report" → Payment modal opens
3. [ ] Click "Continue to Payment" → Redirects to Stripe
4. [ ] Complete payment with test card
5. [ ] Verify redirect back with success
6. [ ] Check Supabase `orders` table has record
7. [ ] Report generates

---

## 🚀 Go Live

When ready for real payments:

1. Switch from `sk_test_` to `sk_live_` API keys
2. Create a production Price ID
3. Create a production webhook endpoint
4. Update all secrets in Supabase
5. Test with $1 real payment (refund after)

---

## Estimated Time

- Initial setup: 30-45 minutes
- Testing: 15-30 minutes
- Total: ~1 hour

---

*This checklist covers the minimum path to a working Stripe integration.*
