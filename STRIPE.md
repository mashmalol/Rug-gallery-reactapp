# Stripe Payments Setup

## Overview

This project uses **Stripe** for payment processing. The flow is:

1. User clicks "Buy" on a rug
2. Frontend calls backend to create a **PaymentIntent**
3. Backend creates the PaymentIntent via Stripe API
4. Frontend renders Stripe payment form using the `clientSecret`
5. Stripe webhook notifies backend of payment success
6. Backend updates order status to `paid`

---

## Step 1: Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Activate your account (provide business details)
3. Navigate to **Developers > API keys**

---

## Step 2: Get API Keys

| Key | Where to Use |
|-----|-------------|
| **Publishable key** (`pk_test_...`) | `VITE_STRIPE_PUBLISHABLE_KEY` in `.env` (client) |
| **Secret key** (`sk_test_...`) | `STRIPE_SECRET_KEY` in `.env` (server only) |

---

## Step 3: Set Up Webhook (Required for Production)

Webhooks tell your backend when a payment succeeds.

### Local Development

Use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

This prints a webhook signing secret (`whsec_...`). Add it to your `.env`:

```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Production

1. Go to **Developers > Webhooks** in Stripe dashboard
2. Click **"Add endpoint"**
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** to `STRIPE_WEBHOOK_SECRET` in `.env`

---

## Payment Flow Diagram

```
Client (React)                    Backend (Express)              Stripe
     │                                 │                          │
     │  POST /api/stripe/              │                          │
     │  create-payment-intent          │                          │
     │ ──────────────────────────────► │                          │
     │                                 │  paymentIntents.create() │
     │                                 │ ────────────────────────►│
     │                                 │  ◄──────────────────────│
     │  ◄───────────────────────────── │  { clientSecret }        │
     │                                 │                          │
     │  Stripe Payment Element         │                          │
     │  (card input form)              │                          │
     │ ─────────────────────────────────────────────────────────►│
     │  (user enters card details)     │                          │
     │ ◄────────────────────────────────────────────────────────►│
     │  { payment result }             │                          │
     │                                 │                          │
     │                                 │  POST /api/stripe/       │
     │                                 │  webhook                 │
     │                                 │ ◄────────────────────────│
     │                                 │  (payment_intent.        │
     │                                 │   succeeded)             │
     │                                 │  → update order status   │
     │                                 │    to 'paid'             │
```

---

## Testing Cards

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure auth |

Use any future expiry date and any CVC in test mode.

---

## Environment Variables

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Order Status Flow

```
pending → awaiting_payment → paid
                            ↘ failed
                            ↘ refunded
```

| Status | Meaning |
|--------|---------|
| `pending` | Order created, no payment attempted |
| `awaiting_payment` | PaymentIntent created, waiting for user |
| `paid` | Payment confirmed via webhook |
| `failed` | Payment was declined |
| `refunded` | Payment was refunded |

---

## Going Live

1. Replace all `pk_test_` keys with `pk_live_` keys
2. Replace `sk_test_` keys with `sk_live_` keys
3. Update Stripe dashboard to **Live mode**
4. Set up production webhook URL
5. Update Supabase RLS policies if needed for production
