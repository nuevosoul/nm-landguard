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
        
        // Insert order into database (with upsert to handle retries)
        const { error: upsertError } = await supabaseAdmin
          .from("orders")
          .upsert({
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
          }, {
            onConflict: "order_ref",
            ignoreDuplicates: false,
          });

        if (upsertError) {
          console.error("Failed to upsert order:", upsertError);
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
