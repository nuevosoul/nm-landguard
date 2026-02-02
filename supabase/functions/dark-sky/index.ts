import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DarkSkyData {
  bortleClass: number; // 1-9 scale, lower is darker
  bortleLabel: string;
  qualityRating: "exceptional" | "excellent" | "good" | "fair" | "poor" | "urban";
  milkyWayVisible: boolean;
  nakedEyeLimitingMag: number; // NELM - higher is better (6.5+ is great)
  lightPollutionLevel: string;
  nearestLightSource: string;
  distanceToNearestCity: number; // miles
  stargazingNote: string;
  bestViewingDirection: string;
  source: string;
}

// NM cities and their light pollution radii
const nmCities = [
  { name: "Albuquerque", lat: 35.0844, lng: -106.6504, population: 560000, radiusMiles: 40 },
  { name: "Las Cruces", lat: 32.3199, lng: -106.7637, population: 111000, radiusMiles: 20 },
  { name: "Rio Rancho", lat: 35.2328, lng: -106.6630, population: 104000, radiusMiles: 15 },
  { name: "Santa Fe", lat: 35.6870, lng: -105.9378, population: 88000, radiusMiles: 15 },
  { name: "Roswell", lat: 33.3943, lng: -104.5230, population: 48000, radiusMiles: 10 },
  { name: "Farmington", lat: 36.7281, lng: -108.2187, population: 46000, radiusMiles: 10 },
  { name: "Clovis", lat: 34.4048, lng: -103.2052, population: 39000, radiusMiles: 8 },
  { name: "Hobbs", lat: 32.7026, lng: -103.1360, population: 40000, radiusMiles: 10 },
  { name: "Alamogordo", lat: 32.8995, lng: -105.9603, population: 32000, radiusMiles: 8 },
  { name: "Carlsbad", lat: 32.4207, lng: -104.2288, population: 32000, radiusMiles: 8 },
  { name: "Gallup", lat: 35.5281, lng: -108.7426, population: 22000, radiusMiles: 6 },
  { name: "Los Alamos", lat: 35.8800, lng: -106.3031, population: 19000, radiusMiles: 5 },
  { name: "Española", lat: 35.9911, lng: -106.0806, population: 10000, radiusMiles: 4 },
  { name: "Taos", lat: 36.4072, lng: -105.5731, population: 6000, radiusMiles: 3 },
];

// Calculate distance between two points (miles)
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

function analyzeDarkSky(lat: number, lng: number): DarkSkyData {
  // Find nearest cities and calculate light pollution contribution
  let totalLightPollution = 0;
  let nearestCity = { name: "Unknown", distance: 999 };
  
  for (const city of nmCities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    
    if (distance < nearestCity.distance) {
      nearestCity = { name: city.name, distance };
    }
    
    // Light pollution contribution decreases with distance squared
    if (distance < city.radiusMiles * 2) {
      const contribution = (city.population / 10000) * Math.pow(1 - (distance / (city.radiusMiles * 2)), 2);
      totalLightPollution += Math.max(0, contribution);
    }
  }
  
  // Determine Bortle class based on light pollution score
  let bortleClass: number;
  let bortleLabel: string;
  let qualityRating: DarkSkyData["qualityRating"];
  let milkyWayVisible = true;
  let nakedEyeLimitingMag: number;
  let lightPollutionLevel: string;
  
  if (totalLightPollution < 0.5) {
    bortleClass = 2;
    bortleLabel = "Typical Dark Sky Site";
    qualityRating = "exceptional";
    nakedEyeLimitingMag = 7.1;
    lightPollutionLevel = "Minimal - pristine dark sky";
  } else if (totalLightPollution < 2) {
    bortleClass = 3;
    bortleLabel = "Rural Sky";
    qualityRating = "excellent";
    nakedEyeLimitingMag = 6.8;
    lightPollutionLevel = "Very Low - excellent for astronomy";
  } else if (totalLightPollution < 5) {
    bortleClass = 4;
    bortleLabel = "Rural/Suburban Transition";
    qualityRating = "good";
    nakedEyeLimitingMag = 6.3;
    lightPollutionLevel = "Low - good for stargazing";
  } else if (totalLightPollution < 15) {
    bortleClass = 5;
    bortleLabel = "Suburban Sky";
    qualityRating = "fair";
    nakedEyeLimitingMag = 5.8;
    lightPollutionLevel = "Moderate - Milky Way visible but washed out";
  } else if (totalLightPollution < 40) {
    bortleClass = 6;
    bortleLabel = "Bright Suburban Sky";
    qualityRating = "poor";
    milkyWayVisible = false;
    nakedEyeLimitingMag = 5.2;
    lightPollutionLevel = "High - limited stargazing";
  } else {
    bortleClass = 7;
    bortleLabel = "Suburban/Urban Transition";
    qualityRating = "urban";
    milkyWayVisible = false;
    nakedEyeLimitingMag = 4.5;
    lightPollutionLevel = "Very High - urban glow dominant";
  }
  
  // Determine best viewing direction (away from nearest major light source)
  let bestDirection = "All directions good";
  if (nearestCity.distance < 30) {
    const cityData = nmCities.find(c => c.name === nearestCity.name);
    if (cityData) {
      const bearing = Math.atan2(lng - cityData.lng, lat - cityData.lat) * 180 / Math.PI;
      // Best direction is opposite to city
      const oppositeBearing = (bearing + 180) % 360;
      if (oppositeBearing >= 315 || oppositeBearing < 45) bestDirection = "Look North";
      else if (oppositeBearing >= 45 && oppositeBearing < 135) bestDirection = "Look East";
      else if (oppositeBearing >= 135 && oppositeBearing < 225) bestDirection = "Look South";
      else bestDirection = "Look West";
      bestDirection += ` (away from ${nearestCity.name})`;
    }
  }
  
  // Generate stargazing note
  let stargazingNote = "";
  if (bortleClass <= 3) {
    stargazingNote = "Outstanding dark sky location. Milky Way casts shadows. Zodiacal light visible. Ideal for astrophotography.";
  } else if (bortleClass <= 4) {
    stargazingNote = "Very good for stargazing. Milky Way shows detail. Most deep-sky objects visible with binoculars.";
  } else if (bortleClass <= 5) {
    stargazingNote = "Decent for casual stargazing. Milky Way visible but faint. Best viewing after midnight when lights dim.";
  } else {
    stargazingNote = "Limited stargazing due to light pollution. Brightest stars and planets still visible.";
  }
  
  // NM has some of the best dark skies in the country - adjust note
  if (lat > 33 && lat < 37 && lng > -109 && lng < -103) {
    if (bortleClass <= 4) {
      stargazingNote += " New Mexico is home to some of the darkest skies in North America.";
    }
  }
  
  return {
    bortleClass,
    bortleLabel,
    qualityRating,
    milkyWayVisible,
    nakedEyeLimitingMag,
    lightPollutionLevel,
    nearestLightSource: `${nearestCity.name} (${nearestCity.distance} mi)`,
    distanceToNearestCity: nearestCity.distance,
    stargazingNote,
    bestViewingDirection: bestDirection,
    source: "Light Pollution Analysis (NM Regional Data)",
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

    console.log(`Dark sky analysis for: ${lat}, ${lng}`);

    const result = analyzeDarkSky(lat, lng);
    
    console.log(`Dark sky: Bortle ${result.bortleClass} (${result.bortleLabel})`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dark sky error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
