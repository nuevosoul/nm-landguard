import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirQualityData {
  aqi: number; // Air Quality Index (US EPA scale)
  category: "good" | "moderate" | "unhealthy_sensitive" | "unhealthy" | "very_unhealthy" | "hazardous";
  categoryLabel: string;
  dominantPollutant: string;
  pollutants: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    co?: number;
    so2?: number;
  };
  healthRecommendations?: string;
  source: string;
}

function getAqiCategory(aqi: number): { category: AirQualityData["category"]; label: string } {
  if (aqi <= 50) return { category: "good", label: "Good" };
  if (aqi <= 100) return { category: "moderate", label: "Moderate" };
  if (aqi <= 150) return { category: "unhealthy_sensitive", label: "Unhealthy for Sensitive Groups" };
  if (aqi <= 200) return { category: "unhealthy", label: "Unhealthy" };
  if (aqi <= 300) return { category: "very_unhealthy", label: "Very Unhealthy" };
  return { category: "hazardous", label: "Hazardous" };
}

function getPollutantName(code: string): string {
  const names: Record<string, string> = {
    "pm25": "PM2.5",
    "pm10": "PM10", 
    "o3": "Ozone",
    "no2": "Nitrogen Dioxide",
    "co": "Carbon Monoxide",
    "so2": "Sulfur Dioxide",
  };
  return names[code.toLowerCase()] || code;
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

    console.log(`Air Quality lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Air Quality API - Current Conditions
    const url = 'https://airquality.googleapis.com/v1/currentConditions:lookup';
    
    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: { latitude: lat, longitude: lng },
        extraComputations: [
          "HEALTH_RECOMMENDATIONS",
          "DOMINANT_POLLUTANT_CONCENTRATION",
          "POLLUTANT_CONCENTRATION",
          "LOCAL_AQI"
        ],
        languageCode: "en"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Air Quality API error: ${response.status}`, errorText);
      return new Response(
        JSON.stringify({ error: `Air Quality API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Air Quality API response received');

    // Find US EPA AQI (or use universal if not available)
    let aqiValue = 50; // default
    let dominantPollutant = "Unknown";
    
    if (data.indexes && data.indexes.length > 0) {
      // Prefer US EPA AQI
      const usaqi = data.indexes.find((idx: any) => idx.code === "usa_epa");
      const uaqi = data.indexes.find((idx: any) => idx.code === "uaqi");
      const selectedIndex = usaqi || uaqi || data.indexes[0];
      
      aqiValue = selectedIndex.aqi || 50;
      dominantPollutant = selectedIndex.dominantPollutant 
        ? getPollutantName(selectedIndex.dominantPollutant) 
        : "Unknown";
    }

    const { category, label } = getAqiCategory(aqiValue);

    // Extract pollutant concentrations
    const pollutants: AirQualityData["pollutants"] = {};
    if (data.pollutants) {
      for (const p of data.pollutants) {
        const code = p.code?.toLowerCase();
        if (code && p.concentration?.value) {
          if (code === "pm25" || code === "pm2_5") pollutants.pm25 = Math.round(p.concentration.value * 10) / 10;
          else if (code === "pm10") pollutants.pm10 = Math.round(p.concentration.value * 10) / 10;
          else if (code === "o3") pollutants.o3 = Math.round(p.concentration.value * 10) / 10;
          else if (code === "no2") pollutants.no2 = Math.round(p.concentration.value * 10) / 10;
          else if (code === "co") pollutants.co = Math.round(p.concentration.value * 10) / 10;
          else if (code === "so2") pollutants.so2 = Math.round(p.concentration.value * 10) / 10;
        }
      }
    }

    // Extract health recommendations
    let healthRecommendations = "";
    if (data.healthRecommendations) {
      // Get general population recommendation
      healthRecommendations = data.healthRecommendations.generalPopulation || 
                             data.healthRecommendations.elderly || 
                             "";
    }

    const result: AirQualityData = {
      aqi: aqiValue,
      category,
      categoryLabel: label,
      dominantPollutant,
      pollutants,
      healthRecommendations: healthRecommendations || undefined,
      source: "Google Air Quality API",
    };

    console.log(`Air Quality: AQI ${result.aqi} (${result.categoryLabel}), dominant: ${result.dominantPollutant}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Air Quality API error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
