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

    // Fall back to checking Stripe directly (in case webhook hasn't fired yet)
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === "paid") {
        // Try to save order if webhook hasn't done it yet
        const metadata = session.metadata || {};
        if (metadata.order_ref) {
          await supabaseAdmin
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
              ignoreDuplicates: true,
            });
        }

        return new Response(
          JSON.stringify({
            verified: true,
            order: {
              orderRef: metadata.order_ref,
              address: metadata.address,
              coordinates: metadata.coordinates ? JSON.parse(metadata.coordinates) : null,
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
