# Stripe Payment Integration Guide

**Project:** NM LandGuard / Rio Grande Due Diligence  
**Date:** January 2025  
**Price Point:** $499/report (one-time purchase)  
**Stack:** React (Vite) + Supabase Edge Functions (Deno)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Recommended Approach](#recommended-approach)
4. [Architecture Overview](#architecture-overview)
5. [Implementation Plan](#implementation-plan)
6. [Code Implementation](#code-implementation)
7. [Database Schema](#database-schema)
8. [Environment Variables](#environment-variables)
9. [Security Considerations](#security-considerations)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)

---

## Executive Summary

### Recommendation: **Stripe Checkout (Hosted Page)**

For a $499 one-time purchase with a Lovable-generated React frontend and Supabase Edge Functions, **Stripe Checkout** is the optimal choice because:

| Factor | Stripe Checkout | Custom Form + Elements |
|--------|-----------------|----------------------|
| PCI Compliance | Stripe handles 100% | Requires SAQ A-EP |
| Development Time | 2-3 hours | 8-16 hours |
| Mobile UX | Optimized by Stripe | Must build ourselves |
| Trust Signals | Stripe-branded checkout | Must design ourselves |
| Apple Pay/Google Pay | Built-in | Extra integration |
| 3D Secure | Automatic | Manual integration |
| Error Handling | Stripe handles | Custom implementation |

**Bottom line:** For a $499 high-trust transaction (land report), the polished, secure Stripe Checkout page actually *increases* conversion compared to a custom form.

---

## Current State Analysis

### Existing Payment Flow

```
User searches address → PaymentModal opens → "Pay $499" clicked → Fake setTimeout → Report generates
```

### Files to Modify

| File | Current State | Action Needed |
|------|--------------|---------------|
| `src/components/PaymentModal.tsx` | Mocked with setTimeout | Redirect to Stripe Checkout |
| `src/pages/Index.tsx` | Manages payment state | Add success/cancel URL handling |
| `supabase/functions/` | No payment function | Create `create-checkout` function |
| N/A | N/A | Create `stripe-webhook` function |
| `supabase/config.toml` | No payment functions | Add new function configs |

### Current PaymentModal Code (to replace)

```typescript
// Current mocked implementation
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setIsProcessing(true);
  
  // Simulate payment processing ← THIS GOES AWAY
  setTimeout(() => {
    setIsProcessing(false);
    onPaymentComplete();
  }, 1500);
};
```

---

## Recommended Approach

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PAYMENT FLOW                                   │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐      ┌─────────────────┐      ┌─────────────────────┐
  │  React   │      │ Supabase Edge   │      │      Stripe         │
  │ Frontend │      │   Function      │      │                     │
  └────┬─────┘      └────────┬────────┘      └──────────┬──────────┘
       │                     │                          │
       │ 1. Click "Pay $499" │                          │
       │ ──────────────────> │                          │
       │                     │ 2. Create Checkout       │
       │                     │    Session               │
       │                     │ ────────────────────────>│
       │                     │                          │
       │                     │ 3. Return session.url    │
       │                     │ <────────────────────────│
       │ 4. Redirect to URL  │                          │
       │ <────────────────── │                          │
       │                     │                          │
       │                     │                          │
  ┌────┴─────┐               │               ┌──────────┴──────────┐
  │ Customer │               │               │   Stripe Checkout   │
  │ Browser  │               │               │       Page          │
  └────┬─────┘               │               └──────────┬──────────┘
       │                     │                          │
       │ 5. Customer pays    │                          │
       │ ───────────────────────────────────────────────>│
       │                     │                          │
       │ 6. Redirect to      │                          │
       │    success_url      │                          │
       │ <───────────────────────────────────────────────│
       │                     │                          │
       │                     │ 7. Webhook: payment      │
       │                     │    successful            │
       │                     │ <────────────────────────│
       │                     │                          │
       │                     │ 8. Save order to DB      │
       │                     │                          │
       │ 9. Verify session   │                          │
       │    & show report    │                          │
       └─────────────────────┴──────────────────────────┘
```

### Why NOT Stripe Elements / Custom Form?

1. **PCI Compliance Burden**: Even with Stripe.js tokenization, you need SAQ A-EP compliance for handling card data in your UI
2. **Trust Factor**: A $499 purchase benefits from Stripe's trusted checkout
3. **Mobile Payments**: Apple Pay / Google Pay require extensive setup with Elements
4. **3D Secure**: SCA (Strong Customer Authentication) is automatic with Checkout
5. **Development Speed**: You could ship today vs. next week

---

## Architecture Overview

### New Components

```
supabase/functions/
├── create-checkout/          # Creates Stripe Checkout session
│   └── index.ts
├── stripe-webhook/           # Handles payment confirmations
│   └── index.ts
└── verify-payment/           # Verifies session for frontend (optional)
    └── index.ts

src/
├── components/
│   └── PaymentModal.tsx      # Modified to redirect to Stripe
├── pages/
│   ├── Index.tsx             # Handle success/cancel returns
│   └── PaymentSuccess.tsx    # NEW: Success landing page (optional)
└── hooks/
    └── useStripeCheckout.ts  # NEW: Checkout session hook
```

---

## Implementation Plan

### Phase 1: Backend (Edge Functions)

#### Step 1.1: Create Checkout Session Function

**File:** `supabase/functions/create-checkout/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Price ID from Stripe Dashboard (created once, reused)
const REPORT_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, coordinates, queryType, customerEmail } = await req.json();

    // Validate required fields
    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate a unique order reference
    const orderRef = `LG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Determine base URL for redirects
    const origin = req.headers.get("origin") || "https://your-domain.com";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: REPORT_PRICE_ID,
          quantity: 1,
        },
      ],
      // Pre-fill customer email if provided
      ...(customerEmail && { customer_email: customerEmail }),
      
      // Pass metadata for webhook processing
      metadata: {
        order_ref: orderRef,
        address: address.substring(0, 500), // Stripe limits metadata to 500 chars
        coordinates: coordinates ? JSON.stringify(coordinates) : "",
        query_type: queryType || "address",
      },
      
      // Customize the checkout page
      custom_text: {
        submit: {
          message: "Your environmental due diligence report will be generated immediately after payment.",
        },
      },
      
      // Success/Cancel URLs with session ID for verification
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&order=${orderRef}`,
      cancel_url: `${origin}/?payment=cancelled`,
      
      // Invoice settings for receipt
      invoice_creation: {
        enabled: true,
      },
      
      // Allow promotion codes (optional)
      allow_promotion_codes: true,
      
      // Set expiration (30 minutes)
      expires_at: Math.floor(Date.now() / 1000) + 1800,
    });

    console.log(`Created checkout session ${session.id} for order ${orderRef}`);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        orderRef,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

#### Step 1.2: Create Webhook Handler

**File:** `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Create Supabase admin client for database operations
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  
  if (!signature) {
    console.error("No Stripe signature found");
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    
    console.log(`Received Stripe event: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Only process paid sessions
        if (session.payment_status !== "paid") {
          console.log(`Session ${session.id} not yet paid, skipping`);
          break;
        }

        const metadata = session.metadata || {};
        
        // Insert order into database
        const { error: insertError } = await supabaseAdmin
          .from("orders")
          .insert({
            order_ref: metadata.order_ref,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string,
            customer_email: session.customer_details?.email,
            amount_cents: session.amount_total,
            currency: session.currency,
            address: metadata.address,
            coordinates: metadata.coordinates ? JSON.parse(metadata.coordinates) : null,
            query_type: metadata.query_type,
            status: "paid",
            paid_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Failed to insert order:", insertError);
          // Don't return error - Stripe will retry
        } else {
          console.log(`Order ${metadata.order_ref} saved successfully`);
        }
        
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`Checkout session ${session.id} expired`);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed for ${paymentIntent.id}: ${paymentIntent.last_payment_error?.message}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }
});
```

#### Step 1.3: Create Payment Verification Function (Optional but Recommended)

**File:** `supabase/functions/verify-payment/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orderRef } = await req.json();

    if (!sessionId && !orderRef) {
      return new Response(
        JSON.stringify({ error: "sessionId or orderRef required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check database first (faster, webhook may have already processed)
    if (orderRef) {
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_ref", orderRef)
        .single();

      if (order && order.status === "paid") {
        return new Response(
          JSON.stringify({
            verified: true,
            order: {
              orderRef: order.order_ref,
              address: order.address,
              coordinates: order.coordinates,
              paidAt: order.paid_at,
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fall back to checking Stripe directly
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        return new Response(
          JSON.stringify({
            verified: true,
            order: {
              orderRef: session.metadata?.order_ref,
              address: session.metadata?.address,
              coordinates: session.metadata?.coordinates ? JSON.parse(session.metadata.coordinates) : null,
              paidAt: new Date().toISOString(),
            },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ verified: false, error: "Payment not confirmed" }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Phase 2: Frontend Changes

#### Step 2.1: Update PaymentModal

**File:** `src/components/PaymentModal.tsx` (complete replacement)

```typescript
import { useState } from "react";
import { X, CreditCard, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  address: string;
  coordinates?: { lat: number; lng: number };
  queryType?: string;
}

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  address, 
  coordinates,
  queryType = "address"
}: PaymentModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: {
          address,
          coordinates,
          queryType,
        },
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to create checkout session");
      }

      if (!data?.url) {
        throw new Error("No checkout URL returned");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Payment setup failed. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-elevated animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground">Rio Grande Due Diligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            disabled={isProcessing}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order summary */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-muted-foreground">Environmental Report</span>
              <span className="font-semibold text-foreground">$499.00</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{address}</p>
          </div>

          {/* What's included */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Your report includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Water rights & well data analysis
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                FEMA flood zone assessment
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Environmental hazard screening
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Cultural resources review
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Downloadable PDF report
              </li>
            </ul>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Checkout button */}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Preparing checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
                <ExternalLink className="w-3 h-3 ml-2 opacity-60" />
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3 h-3" />
              <span>Secured by Stripe</span>
            </div>
            <div className="flex items-center gap-3 opacity-60">
              <img src="/stripe-badge.svg" alt="Stripe" className="h-5" />
              {/* Add card brand logos if desired */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
```

#### Step 2.2: Update Index.tsx for Success/Cancel Handling

**File:** `src/pages/Index.tsx` (add to existing)

Add this hook at the top of the `Index` component:

```typescript
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appState, setAppState] = useState<AppState>("landing");
  const [searchAddress, setSearchAddress] = useState("");
  // ... existing state ...

  // Handle payment return from Stripe
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const orderRef = searchParams.get("order");

    if (paymentStatus === "success" && (sessionId || orderRef)) {
      // Verify the payment
      verifyPayment(sessionId, orderRef);
    } else if (paymentStatus === "cancelled") {
      // User cancelled - just clear params and stay on landing
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string | null, orderRef: string | null) => {
    try {
      const { data, error } = await supabase.functions.invoke("verify-payment", {
        body: { sessionId, orderRef },
      });

      if (error || !data?.verified) {
        console.error("Payment verification failed:", error || data?.error);
        // Could show an error toast here
        return;
      }

      // Payment verified! Load the report
      setSearchAddress(data.order.address);
      setAppState("loading");

      // Clear URL params
      searchParams.delete("payment");
      searchParams.delete("session_id");
      searchParams.delete("order");
      setSearchParams(searchParams);
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  // ... rest of component
};
```

#### Step 2.3: Optional - Create useStripeCheckout Hook

**File:** `src/hooks/useStripeCheckout.ts`

```typescript
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CheckoutParams {
  address: string;
  coordinates?: { lat: number; lng: number };
  queryType?: string;
  customerEmail?: string;
}

interface CheckoutResult {
  sessionId: string;
  url: string;
  orderRef: string;
}

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckout = async (params: CheckoutParams): Promise<CheckoutResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: params,
      });

      if (fnError) {
        throw new Error(fnError.message || "Failed to create checkout");
      }

      return data as CheckoutResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const redirectToCheckout = async (params: CheckoutParams) => {
    const result = await createCheckout(params);
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  return {
    createCheckout,
    redirectToCheckout,
    isLoading,
    error,
  };
}
```

---

## Database Schema

### Orders Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Orders table to track payments
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT UNIQUE NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  customer_email TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  address TEXT NOT NULL,
  coordinates JSONB,
  query_type TEXT DEFAULT 'address',
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_orders_order_ref ON orders(order_ref);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/update (from webhooks)
CREATE POLICY "Service role full access" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Users can read their own orders (by email, if auth is added later)
-- For now, no public read access - verification goes through Edge Function
```

---

## Environment Variables

### Supabase Dashboard → Edge Functions → Secrets

Add these secrets in the Supabase Dashboard under **Project Settings → Edge Functions → Secrets**:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `STRIPE_PRICE_ID` | Price ID for $499 report | Create in Stripe Dashboard → Products |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for DB writes | Supabase Dashboard → Settings → API |

### Creating the Stripe Price

1. Go to [Stripe Dashboard → Products](https://dashboard.stripe.com/products)
2. Click **+ Add product**
3. Fill in:
   - **Name:** Environmental Due Diligence Report
   - **Description:** Comprehensive land assessment for New Mexico properties
   - **Pricing:** One-time, $499.00 USD
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)

### Local Development (.env.local)

For local development with `supabase functions serve`:

```env
# .env.local (do NOT commit this file)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

---

## Security Considerations

### 1. Webhook Signature Verification ✅

Always verify Stripe webhook signatures. Never trust unverified webhook payloads:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
```

### 2. Idempotency ✅

The `checkout.session.completed` webhook can fire multiple times. Handle this with:
- Unique `order_ref` constraint in database
- Check if order already exists before inserting

### 3. Price Validation ✅

Use a **fixed Price ID** created in Stripe Dashboard, not dynamic pricing. This prevents attackers from manipulating the price.

### 4. Session Expiration ✅

Set `expires_at` on checkout sessions (30 minutes) to limit replay attack window.

### 5. Return URL Verification ✅

Don't trust `success_url` alone - always verify payment server-side via:
- Webhook processing (primary)
- Session retrieval API (backup)

### 6. Metadata Limits

Stripe metadata values are limited to 500 characters. Truncate address:
```typescript
address: address.substring(0, 500)
```

### 7. Service Role Key

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS. Only use in Edge Functions, never expose to frontend.

---

## Testing Strategy

### Test Mode vs Live Mode

1. **Development:** Use Stripe test keys (`sk_test_...`, `pk_test_...`)
2. **Production:** Use Stripe live keys (`sk_live_...`, `pk_live_...`)

### Test Card Numbers

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 3220` | 3D Secure authentication |
| `4000 0000 0000 9995` | Declined (insufficient funds) |
| `4000 0000 0000 0002` | Declined (generic) |

Use any future expiry date and any 3-digit CVC.

### Webhook Testing

1. **Stripe CLI** (recommended for local development):
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   
   # Login
   stripe login
   
   # Forward webhooks to local function
   stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook
   ```

2. **Stripe Dashboard:**
   - Go to Developers → Webhooks
   - Add endpoint: `https://blljytcfahrgtksbzkuh.supabase.co/functions/v1/stripe-webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`

### End-to-End Test Checklist

- [ ] Click "Pay $499" opens checkout session
- [ ] Checkout page shows correct price and description
- [ ] Test card payment succeeds
- [ ] Webhook fires and order appears in database
- [ ] Success URL redirects to report generation
- [ ] Cancel URL returns to landing page
- [ ] 3D Secure flow works (test card 4000 0000 0000 3220)
- [ ] Declined card shows appropriate error

---

## Deployment Checklist

### Before Going Live

- [ ] **Create Stripe account** and complete verification
- [ ] **Create product & price** in Stripe Dashboard
- [ ] **Add Edge Function secrets** in Supabase Dashboard
- [ ] **Deploy Edge Functions:**
  ```bash
  supabase functions deploy create-checkout
  supabase functions deploy stripe-webhook
  supabase functions deploy verify-payment
  ```
- [ ] **Update config.toml:**
  ```toml
  [functions.create-checkout]
  verify_jwt = false
  
  [functions.stripe-webhook]
  verify_jwt = false
  
  [functions.verify-payment]
  verify_jwt = false
  ```
- [ ] **Create orders table** (run SQL migration)
- [ ] **Configure webhook endpoint** in Stripe Dashboard
- [ ] **Test full flow** with test cards
- [ ] **Switch to live keys** when ready

### Go-Live Steps

1. Switch `STRIPE_SECRET_KEY` from `sk_test_` to `sk_live_`
2. Update `STRIPE_PRICE_ID` to live price ID
3. Create production webhook endpoint with live signing secret
4. Update `STRIPE_WEBHOOK_SECRET` with live secret
5. Test with a real $1 charge (refund after)

---

## Quick Reference

### API Endpoints

| Function | URL | Method |
|----------|-----|--------|
| Create Checkout | `/functions/v1/create-checkout` | POST |
| Stripe Webhook | `/functions/v1/stripe-webhook` | POST |
| Verify Payment | `/functions/v1/verify-payment` | POST |

### Important Stripe URLs

- Dashboard: https://dashboard.stripe.com
- Test mode toggle: Top-right of Stripe Dashboard
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Products: https://dashboard.stripe.com/products

---

## Summary

This integration uses **Stripe Checkout** (hosted page) for maximum security and conversion. The flow is:

1. User clicks "Pay $499" → Edge Function creates checkout session
2. User redirected to Stripe → Completes payment on Stripe's secure page
3. Stripe webhook → Saves order to Supabase database
4. User returns to app → Verify payment → Generate report

**Estimated implementation time:** 2-4 hours

**Monthly cost:** Stripe's 2.9% + $0.30 per transaction = ~$14.80 per sale
