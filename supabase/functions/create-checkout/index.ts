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

const REPORT_PRICE_ID = Deno.env.get("STRIPE_PRICE_ID");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, coordinates, queryType, customerEmail } = await req.json();

    if (!address) {
      return new Response(
        JSON.stringify({ error: "Address is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique order reference
    const orderRef = `RGDD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Determine base URL for redirects
    const origin = req.headers.get("origin") || "https://nm-landguard.lovable.app";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: REPORT_PRICE_ID,
          quantity: 1,
        },
      ],
      ...(customerEmail && { customer_email: customerEmail }),
      
      metadata: {
        order_ref: orderRef,
        address: address.substring(0, 500),
        coordinates: coordinates ? JSON.stringify(coordinates) : "",
        query_type: queryType || "address",
      },
      
      custom_text: {
        submit: {
          message: "Your environmental due diligence report will be generated immediately after payment.",
        },
      },
      
      success_url: `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}&order=${orderRef}`,
      cancel_url: `${origin}/?payment=cancelled`,
      
      invoice_creation: {
        enabled: true,
      },
      
      allow_promotion_codes: true,
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
