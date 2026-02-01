// Intel Ingest Edge Function
// Receives items from RSS collectors, Apify webhooks, or direct API calls
// Dedupes and stores in intel_items table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IntelItem {
  source: string;
  source_id?: string;
  url?: string;
  title?: string;
  content?: string;
  author?: string;
  published_at?: string;
  metadata?: Record<string, unknown>;
}

interface IngestPayload {
  source: string;
  items: IntelItem[];
  api_key?: string;
}

// Generate a stable ID from URL or content
async function generateSourceId(item: IntelItem): Promise<string> {
  const data = new TextEncoder().encode(item.url || item.title || item.content || Date.now().toString());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ingestApiKey = Deno.env.get("INTEL_INGEST_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse payload
    const payload: IngestPayload = await req.json();

    // Optional API key validation
    if (ingestApiKey && payload.api_key !== ingestApiKey) {
      // Check authorization header as fallback
      const authHeader = req.headers.get("authorization");
      if (!authHeader?.includes(ingestApiKey)) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    if (!payload.source || !Array.isArray(payload.items)) {
      return new Response(
        JSON.stringify({ error: "Invalid payload: requires source and items array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      inserted: 0,
      skipped: 0,
      errors: 0,
      items: [] as { source_id: string; status: string }[],
    };

    // Process each item
    for (const item of payload.items) {
      const sourceId = item.source_id || await generateSourceId(item);

      try {
        const { error } = await supabase
          .from("intel_items")
          .upsert(
            {
              source: payload.source,
              source_id: sourceId,
              url: item.url,
              title: item.title,
              content: item.content,
              author: item.author,
              published_at: item.published_at,
              metadata: item.metadata || {},
            },
            { onConflict: "source,source_id", ignoreDuplicates: true }
          );

        if (error) {
          if (error.code === "23505") {
            // Duplicate - already exists
            results.skipped++;
            results.items.push({ source_id: sourceId, status: "skipped" });
          } else {
            console.error(`Error inserting item ${sourceId}:`, error);
            results.errors++;
            results.items.push({ source_id: sourceId, status: "error" });
          }
        } else {
          results.inserted++;
          results.items.push({ source_id: sourceId, status: "inserted" });
        }
      } catch (err) {
        console.error(`Exception processing item:`, err);
        results.errors++;
        results.items.push({ source_id: sourceId, status: "error" });
      }
    }

    // Log the ingest
    console.log(
      `Intel ingest from ${payload.source}: ${results.inserted} inserted, ${results.skipped} skipped, ${results.errors} errors`
    );

    return new Response(
      JSON.stringify({
        success: true,
        source: payload.source,
        total: payload.items.length,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Intel ingest error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
