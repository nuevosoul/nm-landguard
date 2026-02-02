import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PollenData {
  overallRisk: "low" | "moderate" | "high" | "very_high";
  overallRiskLabel: string;
  grassPollen: { level: string; index: number };
  treePollen: { level: string; index: number };
  weedPollen: { level: string; index: number };
  dominantType: string;
  season: string;
  healthTip?: string;
  plantDescriptions?: string[];
  source: string;
}

function getRiskLevel(index: number): { level: string; risk: PollenData["overallRisk"] } {
  if (index <= 1) return { level: "Very Low", risk: "low" };
  if (index <= 2) return { level: "Low", risk: "low" };
  if (index <= 3) return { level: "Moderate", risk: "moderate" };
  if (index <= 4) return { level: "High", risk: "high" };
  return { level: "Very High", risk: "very_high" };
}

function getSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring (Tree pollen peak)";
  if (month >= 5 && month <= 7) return "Summer (Grass pollen peak)";
  if (month >= 8 && month <= 10) return "Fall (Weed/Ragweed peak)";
  return "Winter (Low pollen)";
}

// Input validation
function validateCoordinate(value: unknown, type: 'lat' | 'lng'): { valid: boolean; value: number; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} is required` };
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} must be a valid number` };
  }
  const [min, max] = type === 'lat' ? [-90, 90] : [-180, 180];
  if (num < min || num > max) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} must be between ${min} and ${max}` };
  }
  return { valid: true, value: num };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const latResult = validateCoordinate(body.lat, 'lat');
    if (!latResult.valid) {
      return new Response(
        JSON.stringify({ error: latResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const lngResult = validateCoordinate(body.lng, 'lng');
    if (!lngResult.valid) {
      return new Response(
        JSON.stringify({ error: lngResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const lat = latResult.value;
    const lng = lngResult.value;

    console.log(`Pollen lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Pollen API - Current forecast
    const url = `https://pollen.googleapis.com/v1/forecast:lookup?key=${apiKey}&location.latitude=${lat}&location.longitude=${lng}&days=1`;
    
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pollen API error: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: `Pollen API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Pollen API response received');

    // Extract pollen data from the first day's forecast
    let grassIndex = 0, treeIndex = 0, weedIndex = 0;
    let grassLevel = "Unknown", treeLevel = "Unknown", weedLevel = "Unknown";
    let dominantType = "None";
    let maxIndex = 0;
    const plantDescriptions: string[] = [];

    if (data.dailyInfo && data.dailyInfo.length > 0) {
      const today = data.dailyInfo[0];
      
      if (today.pollenTypeInfo) {
        for (const pollen of today.pollenTypeInfo) {
          const code = pollen.code?.toUpperCase();
          const index = pollen.indexInfo?.value || 0;
          const level = pollen.indexInfo?.category || "Unknown";
          
          if (code === "GRASS") {
            grassIndex = index;
            grassLevel = level;
          } else if (code === "TREE") {
            treeIndex = index;
            treeLevel = level;
          } else if (code === "WEED") {
            weedIndex = index;
            weedLevel = level;
          }
          
          if (index > maxIndex) {
            maxIndex = index;
            dominantType = code ? code.charAt(0) + code.slice(1).toLowerCase() : "Unknown";
          }
          
          // Get plant descriptions if available
          if (pollen.healthRecommendations) {
            plantDescriptions.push(...pollen.healthRecommendations);
          }
        }
      }
      
      // Extract plant info if available
      if (today.plantInfo) {
        for (const plant of today.plantInfo.slice(0, 3)) {
          if (plant.displayName && plant.indexInfo?.category) {
            plantDescriptions.push(`${plant.displayName}: ${plant.indexInfo.category}`);
          }
        }
      }
    }

    const { level: overallLevel, risk: overallRisk } = getRiskLevel(maxIndex);

    const result: PollenData = {
      overallRisk,
      overallRiskLabel: overallLevel,
      grassPollen: { level: grassLevel, index: grassIndex },
      treePollen: { level: treeLevel, index: treeIndex },
      weedPollen: { level: weedLevel, index: weedIndex },
      dominantType: dominantType || "None detected",
      season: getSeason(),
      healthTip: maxIndex >= 3 
        ? "Consider allergy medication and limiting outdoor exposure during peak hours."
        : maxIndex >= 2 
        ? "Moderate pollen levels - sensitive individuals should take precautions."
        : "Good conditions for outdoor activities.",
      plantDescriptions: plantDescriptions.length > 0 ? plantDescriptions.slice(0, 5) : undefined,
      source: "Google Pollen API",
    };

    console.log(`Pollen: Overall ${result.overallRiskLabel}, dominant: ${result.dominantType}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Pollen API error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
