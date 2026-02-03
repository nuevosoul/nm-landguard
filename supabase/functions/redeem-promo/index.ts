import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Valid promo codes - add more as needed
// Format: CODE -> { maxUses: number | null, description: string }
const PROMO_CODES: Record<string, { maxUses: number | null; description: string }> = {
  "BETATEST": { maxUses: null, description: "Beta tester - unlimited" },
  "SKYPITCH25": { maxUses: 50, description: "Ski Lift Pitch 2025 attendee" },
  "MATEO": { maxUses: null, description: "Founder code" },
  "FRIEND": { maxUses: 100, description: "Friends & family" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { promoCode, address, coordinates, queryType } = await req.json();

    if (!promoCode || !address) {
      return new Response(
        JSON.stringify({ error: "Promo code and address are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize code (uppercase, trim)
    const code = promoCode.trim().toUpperCase();

    // Check if code is valid
    const promoConfig = PROMO_CODES[code];
    if (!promoConfig) {
      return new Response(
        JSON.stringify({ error: "Invalid promo code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check usage limits if applicable
    if (promoConfig.maxUses !== null) {
      const { count, error: countError } = await supabaseAdmin
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("promo_code", code);

      if (countError) {
        console.error("Error checking promo usage:", countError);
      } else if (count !== null && count >= promoConfig.maxUses) {
        return new Response(
          JSON.stringify({ error: "Promo code has reached its usage limit" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate order reference
    const orderRef = `RGD-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_ref: orderRef,
        address: address.substring(0, 500),
        coordinates: coordinates || null,
        query_type: queryType || "address",
        status: "paid",
        payment_type: "promo",
        promo_code: code,
        promo_description: promoConfig.description,
        amount_cents: 0,
        currency: "usd",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Promo order created: ${orderRef} with code ${code}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderRef,
        message: `Promo code applied: ${promoConfig.description}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Promo redemption error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
