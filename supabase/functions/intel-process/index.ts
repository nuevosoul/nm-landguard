// Intel Process Edge Function
// Called by Clawdbot cron to:
// 1. Score unprocessed items
// 2. Check for alert matches
// 3. Return items ready for summarization

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Keywords for relevance scoring
const RELEVANCE_KEYWORDS: Record<string, { weight: number; topics: string[] }> = {
  // AI & Compute (high priority)
  "sovereign compute": { weight: 25, topics: ["ai", "compute"] },
  "local ai": { weight: 20, topics: ["ai", "compute"] },
  "edge ai": { weight: 15, topics: ["ai", "compute"] },
  "on-premise": { weight: 15, topics: ["ai", "compute"] },
  "anthropic": { weight: 15, topics: ["ai"] },
  "claude": { weight: 12, topics: ["ai"] },
  "openai": { weight: 10, topics: ["ai"] },
  "gpt-5": { weight: 15, topics: ["ai"] },
  "llm": { weight: 8, topics: ["ai"] },
  "large language model": { weight: 8, topics: ["ai"] },
  "fine-tuning": { weight: 10, topics: ["ai"] },
  "inference": { weight: 8, topics: ["ai", "compute"] },
  "apple silicon": { weight: 15, topics: ["ai", "compute"] },
  "mac studio": { weight: 20, topics: ["ai", "compute"] },
  "neural engine": { weight: 12, topics: ["ai", "compute"] },

  // LATAM
  "colombia": { weight: 15, topics: ["latam"] },
  "medellín": { weight: 18, topics: ["latam"] },
  "medellin": { weight: 18, topics: ["latam"] },
  "latin america": { weight: 12, topics: ["latam"] },
  "latam": { weight: 12, topics: ["latam"] },
  "mexico": { weight: 10, topics: ["latam"] },

  // NM / Policy
  "new mexico": { weight: 20, topics: ["nm", "policy"] },
  "santa fe": { weight: 15, topics: ["nm"] },
  "albuquerque": { weight: 12, topics: ["nm"] },
  "tribal": { weight: 15, topics: ["nm", "policy"] },
  "acequia": { weight: 20, topics: ["nm", "policy"] },
  "water rights": { weight: 18, topics: ["nm", "policy"] },
  "film tax credit": { weight: 15, topics: ["nm", "policy", "media"] },

  // Funding / Business
  "series a": { weight: 12, topics: ["funding"] },
  "series b": { weight: 12, topics: ["funding"] },
  "seed round": { weight: 10, topics: ["funding"] },
  "venture capital": { weight: 8, topics: ["funding"] },
  "raised": { weight: 5, topics: ["funding"] },
  "acquisition": { weight: 10, topics: ["funding"] },
  "ipo": { weight: 12, topics: ["funding"] },

  // Cannabis
  "cannabis": { weight: 15, topics: ["cannabis"] },
  "dispensary": { weight: 12, topics: ["cannabis"] },
  "cultivation": { weight: 10, topics: ["cannabis"] },

  // Energy / Sustainability
  "solar": { weight: 8, topics: ["energy"] },
  "department of energy": { weight: 15, topics: ["energy", "policy"] },
  "doe grant": { weight: 18, topics: ["energy", "funding"] },
  "clean energy": { weight: 10, topics: ["energy"] },
  "battery storage": { weight: 12, topics: ["energy"] },
};

interface IntelItem {
  id: string;
  source: string;
  title: string;
  content: string;
  url: string;
  author: string;
  published_at: string;
  collected_at: string;
  metadata: Record<string, unknown>;
}

interface IntelSource {
  name: string;
  priority: number;
  topics: string[];
}

interface IntelAlert {
  id: string;
  name: string;
  keywords: string[];
  topics: string[];
  min_score: number;
  delivery: string;
  enabled: boolean;
}

function scoreItem(
  item: IntelItem,
  sources: Map<string, IntelSource>,
  alerts: IntelAlert[]
): { score: number; topics: string[]; matchedAlerts: string[] } {
  const text = `${item.title || ""} ${item.content || ""}`.toLowerCase();
  let score = 0;
  const topics = new Set<string>();
  const matchedAlerts: string[] = [];

  // Base score from source priority
  const source = sources.get(item.source);
  if (source) {
    score += source.priority * 0.3; // Up to 30 points from source
    source.topics?.forEach((t) => topics.add(t));
  }

  // Keyword matching
  for (const [keyword, config] of Object.entries(RELEVANCE_KEYWORDS)) {
    if (text.includes(keyword.toLowerCase())) {
      score += config.weight;
      config.topics.forEach((t) => topics.add(t));
    }
  }

  // Check alerts
  for (const alert of alerts) {
    if (!alert.enabled) continue;

    let matches = false;

    // Check keyword matches
    if (alert.keywords?.length) {
      matches = alert.keywords.some((kw) => text.includes(kw.toLowerCase()));
    }

    // Check topic matches
    if (alert.topics?.length && topics.size > 0) {
      matches = matches || alert.topics.some((t) => topics.has(t));
    }

    if (matches) {
      matchedAlerts.push(alert.name);
    }
  }

  // Cap score at 100
  return {
    score: Math.min(100, Math.round(score)),
    topics: Array.from(topics),
    matchedAlerts,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional params
    const url = new URL(req.url);
    const hoursBack = parseInt(url.searchParams.get("hours") || "24");
    const minScore = parseInt(url.searchParams.get("min_score") || "0");
    const markProcessed = url.searchParams.get("mark_processed") !== "false";

    // Get sources for priority scoring
    const { data: sourcesData } = await supabase
      .from("intel_sources")
      .select("name, priority, topics")
      .eq("enabled", true);

    const sources = new Map<string, IntelSource>();
    sourcesData?.forEach((s) => sources.set(s.name, s));

    // Get alerts
    const { data: alertsData } = await supabase
      .from("intel_alerts")
      .select("*")
      .eq("enabled", true);

    const alerts = (alertsData || []) as IntelAlert[];

    // Get unprocessed items from last N hours
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data: items, error } = await supabase
      .from("intel_items")
      .select("*")
      .eq("processed", false)
      .gte("collected_at", cutoff)
      .order("collected_at", { ascending: false });

    if (error) throw error;

    const processedItems: Array<{
      id: string;
      source: string;
      title: string;
      url: string;
      author: string;
      published_at: string;
      score: number;
      topics: string[];
      matchedAlerts: string[];
      snippet: string;
    }> = [];

    const alertMatches: Array<{
      alert: string;
      item_id: string;
      title: string;
      url: string;
      score: number;
    }> = [];

    // Score each item
    for (const item of items || []) {
      const { score, topics, matchedAlerts } = scoreItem(item, sources, alerts);

      // Update the item in database
      if (markProcessed) {
        await supabase
          .from("intel_items")
          .update({
            processed: true,
            relevance_score: score,
            topics,
          })
          .eq("id", item.id);
      }

      // Only include items above min score in response
      if (score >= minScore) {
        const snippet =
          item.content?.substring(0, 200) + (item.content?.length > 200 ? "..." : "") || "";

        processedItems.push({
          id: item.id,
          source: item.source,
          title: item.title,
          url: item.url,
          author: item.author,
          published_at: item.published_at,
          score,
          topics,
          matchedAlerts,
          snippet,
        });

        // Track alert matches
        for (const alertName of matchedAlerts) {
          alertMatches.push({
            alert: alertName,
            item_id: item.id,
            title: item.title,
            url: item.url,
            score,
          });
        }
      }
    }

    // Sort by score descending
    processedItems.sort((a, b) => b.score - a.score);

    // Group by topic for easier summarization
    const byTopic: Record<string, typeof processedItems> = {};
    for (const item of processedItems) {
      for (const topic of item.topics) {
        if (!byTopic[topic]) byTopic[topic] = [];
        byTopic[topic].push(item);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: items?.length || 0,
        returned: processedItems.length,
        hoursBack,
        minScore,
        items: processedItems.slice(0, 50), // Top 50 items
        byTopic,
        alertMatches,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Intel process error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
