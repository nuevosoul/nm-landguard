import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NoiseData {
  overallRating: "very_quiet" | "quiet" | "moderate" | "noisy" | "very_noisy";
  overallLabel: string;
  estimatedDecibels: string;
  noiseSources: {
    type: string;
    name: string;
    distance: number;
    impact: "high" | "moderate" | "low" | "none";
  }[];
  nearestHighway: { name: string; distance: number } | null;
  nearestAirport: { name: string; distance: number; type: string } | null;
  nearestRailroad: { distance: number } | null;
  quietHours: string;
  recommendation: string;
  source: string;
}

// NM highways
const nmHighways = [
  { name: "I-40", points: [[35.08, -106.65], [35.08, -106.0], [35.1, -105.5], [35.1, -104.5], [35.1, -103.5]] },
  { name: "I-25", points: [[35.0, -106.65], [35.5, -106.0], [35.7, -105.95], [36.0, -105.9], [36.5, -105.5], [37.0, -104.5]] },
  { name: "I-10", points: [[32.0, -108.5], [32.3, -107.5], [32.3, -106.75], [32.0, -106.0]] },
  { name: "US-84", points: [[36.0, -106.1], [36.3, -106.3], [36.5, -106.5], [36.7, -106.8]] },
  { name: "US-64", points: [[36.4, -105.6], [36.5, -106.0], [36.6, -106.5], [36.7, -107.0]] },
  { name: "US-550", points: [[35.1, -106.6], [35.5, -106.8], [36.0, -107.0], [36.5, -107.5], [36.7, -108.0]] },
];

// NM airports
const nmAirports = [
  { name: "Albuquerque Sunport (ABQ)", lat: 35.0402, lng: -106.6093, type: "major", noiseRadius: 8 },
  { name: "Santa Fe Regional (SAF)", lat: 35.6177, lng: -106.0881, type: "regional", noiseRadius: 3 },
  { name: "El Paso Intl (ELP)", lat: 31.8073, lng: -106.3778, type: "major", noiseRadius: 8 },
  { name: "Roswell Intl (ROW)", lat: 33.3016, lng: -104.5308, type: "regional", noiseRadius: 3 },
  { name: "Farmington (FMN)", lat: 36.7412, lng: -108.2299, type: "regional", noiseRadius: 2 },
  { name: "Las Cruces Intl (LRU)", lat: 32.2894, lng: -106.9219, type: "regional", noiseRadius: 2 },
  { name: "Taos Regional (TSM)", lat: 36.4581, lng: -105.6727, type: "small", noiseRadius: 1 },
  { name: "Los Alamos (LAM)", lat: 35.8798, lng: -106.2694, type: "small", noiseRadius: 1 },
];

// Calculate distance to nearest point on a line segment
function distanceToLine(lat: number, lng: number, lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth radius in miles
  
  // Convert to radians
  const φ = lat * Math.PI / 180;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const λ = lng * Math.PI / 180;
  const λ1 = lng1 * Math.PI / 180;
  const λ2 = lng2 * Math.PI / 180;
  
  // Simple approximation using cross-track distance
  const d13 = Math.acos(Math.sin(φ1)*Math.sin(φ) + Math.cos(φ1)*Math.cos(φ)*Math.cos(λ-λ1)) * R;
  const θ13 = Math.atan2(Math.sin(λ-λ1)*Math.cos(φ), Math.cos(φ1)*Math.sin(φ)-Math.sin(φ1)*Math.cos(φ)*Math.cos(λ-λ1));
  const θ12 = Math.atan2(Math.sin(λ2-λ1)*Math.cos(φ2), Math.cos(φ1)*Math.sin(φ2)-Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1));
  
  const dxt = Math.asin(Math.sin(d13/R)*Math.sin(θ13-θ12)) * R;
  
  return Math.abs(dxt);
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

function analyzeNoise(lat: number, lng: number): NoiseData {
  const noiseSources: NoiseData["noiseSources"] = [];
  let totalNoiseScore = 0;
  
  // Check distance to highways
  let nearestHighway: { name: string; distance: number } | null = null;
  
  for (const highway of nmHighways) {
    let minDist = 999;
    for (let i = 0; i < highway.points.length - 1; i++) {
      const [lat1, lng1] = highway.points[i];
      const [lat2, lng2] = highway.points[i + 1];
      const dist = distanceToLine(lat, lng, lat1, lng1, lat2, lng2);
      if (dist < minDist) minDist = dist;
    }
    
    // Also check point distances as backup
    for (const [plat, plng] of highway.points) {
      const dist = calculateDistance(lat, lng, plat, plng);
      if (dist < minDist) minDist = dist;
    }
    
    if (!nearestHighway || minDist < nearestHighway.distance) {
      nearestHighway = { name: highway.name, distance: Math.round(minDist * 10) / 10 };
    }
    
    // Add noise impact
    if (minDist < 0.5) {
      noiseSources.push({ type: "Highway", name: highway.name, distance: minDist, impact: "high" });
      totalNoiseScore += 40;
    } else if (minDist < 1) {
      noiseSources.push({ type: "Highway", name: highway.name, distance: minDist, impact: "moderate" });
      totalNoiseScore += 20;
    } else if (minDist < 3) {
      noiseSources.push({ type: "Highway", name: highway.name, distance: minDist, impact: "low" });
      totalNoiseScore += 5;
    }
  }
  
  // Check distance to airports
  let nearestAirport: { name: string; distance: number; type: string } | null = null;
  
  for (const airport of nmAirports) {
    const dist = calculateDistance(lat, lng, airport.lat, airport.lng);
    
    if (!nearestAirport || dist < nearestAirport.distance) {
      nearestAirport = { name: airport.name, distance: dist, type: airport.type };
    }
    
    if (dist < airport.noiseRadius) {
      const impact = dist < airport.noiseRadius / 2 ? "high" : "moderate";
      noiseSources.push({ type: "Airport", name: airport.name, distance: dist, impact });
      totalNoiseScore += airport.type === "major" ? 30 : 15;
    }
  }
  
  // Estimate railroad proximity (simplified - BNSF runs along I-40)
  let nearestRailroad: { distance: number } | null = null;
  if (nearestHighway?.name === "I-40" && nearestHighway.distance < 5) {
    nearestRailroad = { distance: nearestHighway.distance + 0.2 }; // Railroad typically parallels I-40
    if (nearestRailroad.distance < 1) {
      noiseSources.push({ type: "Railroad", name: "BNSF Railway", distance: nearestRailroad.distance, impact: "moderate" });
      totalNoiseScore += 15;
    }
  }
  
  // Determine overall rating
  let overallRating: NoiseData["overallRating"];
  let overallLabel: string;
  let estimatedDecibels: string;
  
  if (totalNoiseScore < 5) {
    overallRating = "very_quiet";
    overallLabel = "Very Quiet (Rural)";
    estimatedDecibels = "20-35 dB (whisper quiet)";
  } else if (totalNoiseScore < 15) {
    overallRating = "quiet";
    overallLabel = "Quiet";
    estimatedDecibels = "35-45 dB (library quiet)";
  } else if (totalNoiseScore < 35) {
    overallRating = "moderate";
    overallLabel = "Moderate";
    estimatedDecibels = "45-55 dB (normal conversation)";
  } else if (totalNoiseScore < 60) {
    overallRating = "noisy";
    overallLabel = "Noisy";
    estimatedDecibels = "55-70 dB (busy road)";
  } else {
    overallRating = "very_noisy";
    overallLabel = "Very Noisy";
    estimatedDecibels = "70+ dB (highway adjacent)";
  }
  
  // Quiet hours note
  let quietHours = "Consistently quiet throughout day and night";
  if (totalNoiseScore > 20) {
    quietHours = "Quietest: 10 PM - 6 AM. Traffic peaks 7-9 AM, 4-7 PM";
  }
  
  // Recommendation
  let recommendation = "";
  if (overallRating === "very_quiet" || overallRating === "quiet") {
    recommendation = "Excellent for peace and quiet. No traffic noise concerns.";
  } else if (overallRating === "moderate") {
    recommendation = "Some traffic noise present. Consider orientation of living spaces away from noise source.";
  } else {
    recommendation = "Significant traffic noise. Sound barriers, triple-pane windows, or strategic landscaping recommended.";
  }
  
  return {
    overallRating,
    overallLabel,
    estimatedDecibels,
    noiseSources: noiseSources.slice(0, 3),
    nearestHighway,
    nearestAirport,
    nearestRailroad,
    quietHours,
    recommendation,
    source: "Transportation Infrastructure Analysis",
  };
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

    console.log(`Noise level analysis for: ${lat}, ${lng}`);

    const result = analyzeNoise(lat, lng);
    
    console.log(`Noise: ${result.overallLabel}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Noise level error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
