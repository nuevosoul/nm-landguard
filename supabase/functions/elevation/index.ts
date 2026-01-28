import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ElevationResult {
  elevation: number; // feet
  elevationMeters: number;
  slope: number; // percentage
  slopeCategory: "flat" | "gentle" | "moderate" | "steep" | "very_steep";
  aspect: string; // N, NE, E, SE, S, SW, W, NW, flat
  drainageClass: string;
  terrainDescription: string;
  source: string;
}

// Calculate slope between points
function calculateSlope(elevations: number[], distanceMeters: number): number {
  if (elevations.length < 2) return 0;
  const rise = Math.max(...elevations) - Math.min(...elevations);
  const slopePercent = (rise / distanceMeters) * 100;
  return Math.round(slopePercent * 10) / 10;
}

// Determine slope category
function getSlopeCategory(slopePercent: number): "flat" | "gentle" | "moderate" | "steep" | "very_steep" {
  if (slopePercent < 2) return "flat";
  if (slopePercent < 8) return "gentle";
  if (slopePercent < 15) return "moderate";
  if (slopePercent < 30) return "steep";
  return "very_steep";
}

// Calculate aspect (compass direction of slope)
function calculateAspect(centerElev: number, northElev: number, eastElev: number, southElev: number, westElev: number): string {
  const ns = southElev - northElev;
  const ew = westElev - eastElev;
  
  if (Math.abs(ns) < 0.5 && Math.abs(ew) < 0.5) return "Flat";
  
  const angle = Math.atan2(ew, ns) * 180 / Math.PI;
  const normalized = (angle + 360) % 360;
  
  if (normalized < 22.5 || normalized >= 337.5) return "North";
  if (normalized < 67.5) return "Northeast";
  if (normalized < 112.5) return "East";
  if (normalized < 157.5) return "Southeast";
  if (normalized < 202.5) return "South";
  if (normalized < 247.5) return "Southwest";
  if (normalized < 292.5) return "West";
  return "Northwest";
}

// Get drainage class based on slope
function getDrainageClass(slopePercent: number, aspect: string): string {
  if (slopePercent < 2) return "Poor (flat terrain - may require drainage improvements)";
  if (slopePercent < 5) return "Moderate (adequate natural drainage)";
  if (slopePercent < 10) return "Good (efficient natural drainage)";
  if (slopePercent < 20) return "Excellent (rapid drainage - erosion control needed)";
  return "Excessive (high erosion risk - significant mitigation required)";
}

// Get terrain description
function getTerrainDescription(slopePercent: number, elevationFeet: number): string {
  const elevDesc = elevationFeet < 4500 ? "low elevation" : 
                   elevationFeet < 6000 ? "mid-elevation" : 
                   elevationFeet < 7500 ? "high elevation" : "mountain elevation";
  
  const slopeDesc = slopePercent < 2 ? "flat to nearly level terrain" :
                    slopePercent < 8 ? "gently sloping terrain" :
                    slopePercent < 15 ? "moderately sloping terrain" :
                    slopePercent < 30 ? "steep terrain" : "very steep terrain";
  
  return `${elevDesc.charAt(0).toUpperCase() + elevDesc.slice(1)} (${Math.round(elevationFeet).toLocaleString()} ft) with ${slopeDesc}`;
}

async function getElevationFromGoogle(lat: number, lng: number): Promise<ElevationResult | null> {
  const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
  
  if (!apiKey) {
    console.log("No Google Maps API key, using fallback elevation service");
    return null;
  }

  try {
    // Query 5 points: center and 4 cardinal directions (~100m away)
    const offset = 0.001; // roughly 100m
    const locations = [
      `${lat},${lng}`, // center
      `${lat + offset},${lng}`, // north
      `${lat},${lng + offset}`, // east
      `${lat - offset},${lng}`, // south
      `${lat},${lng - offset}`, // west
    ];

    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations.join("|")}&key=${apiKey}`;
    
    console.log(`Querying Google Elevation API for ${lat}, ${lng}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results || data.results.length < 5) {
      console.error("Google Elevation API error:", data);
      return null;
    }

    const centerElev = data.results[0].elevation;
    const northElev = data.results[1].elevation;
    const eastElev = data.results[2].elevation;
    const southElev = data.results[3].elevation;
    const westElev = data.results[4].elevation;

    // Calculate slope (using all 4 directions)
    const allElevations = [centerElev, northElev, eastElev, southElev, westElev];
    const distanceMeters = offset * 111320; // approximate meters per degree at this latitude
    const slope = calculateSlope(allElevations, distanceMeters);

    // Calculate aspect
    const aspect = calculateAspect(centerElev, northElev, eastElev, southElev, westElev);

    // Convert to feet
    const elevationFeet = centerElev * 3.28084;

    return {
      elevation: Math.round(elevationFeet),
      elevationMeters: Math.round(centerElev * 10) / 10,
      slope: slope,
      slopeCategory: getSlopeCategory(slope),
      aspect: aspect,
      drainageClass: getDrainageClass(slope, aspect),
      terrainDescription: getTerrainDescription(slope, elevationFeet),
      source: "Google Elevation API",
    };
  } catch (error) {
    console.error("Google Elevation API error:", error);
    return null;
  }
}

async function getElevationFromOpenTopo(lat: number, lng: number): Promise<ElevationResult | null> {
  try {
    // Use Open-Elevation API as fallback
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`;
    
    console.log(`Querying Open-Elevation API for ${lat}, ${lng}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    const elevationMeters = data.results[0].elevation;
    const elevationFeet = elevationMeters * 3.28084;

    // Without multiple points, estimate slope as minimal
    return {
      elevation: Math.round(elevationFeet),
      elevationMeters: Math.round(elevationMeters * 10) / 10,
      slope: 0, // Cannot calculate without multiple points
      slopeCategory: "flat",
      aspect: "Flat",
      drainageClass: "Unable to determine (single point elevation)",
      terrainDescription: getTerrainDescription(0, elevationFeet),
      source: "Open-Elevation API (slope data unavailable)",
    };
  } catch (error) {
    console.error("Open-Elevation API error:", error);
    return null;
  }
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate coordinates
    const latResult = validateCoordinate(body.lat, 'lat');
    if (!latResult.valid) {
      return new Response(
        JSON.stringify({ error: latResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lngResult = validateCoordinate(body.lng, 'lng');
    if (!lngResult.valid) {
      return new Response(
        JSON.stringify({ error: lngResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lat = latResult.value;
    const lng = lngResult.value;

    console.log(`Elevation lookup for: ${lat}, ${lng}`);

    // Try Google first, fallback to Open-Elevation
    let result = await getElevationFromGoogle(lat, lng);
    
    if (!result) {
      result = await getElevationFromOpenTopo(lat, lng);
    }

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Failed to retrieve elevation data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in elevation function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
