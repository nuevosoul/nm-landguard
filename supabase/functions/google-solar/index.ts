import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SolarData {
  sunlightHoursPerYear: number;
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  maxSunshineHoursPerYear: number;
  carbonOffsetFactorKgPerMwh: number;
  panelCapacityWatts: number;
  panelHeightMeters: number;
  panelWidthMeters: number;
  panelLifetimeYears: number;
  solarPotential: "excellent" | "good" | "fair" | "poor";
  annualSavingsEstimate: number;
  roofAreaSqFt: number;
  recommendedCapacityKw: number;
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate coordinates
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

    console.log(`Google Solar API lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify(getDefaultSolarData("API key not configured")),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Google Solar API - Building Insights endpoint
    const solarUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lng}&requiredQuality=HIGH&key=${apiKey}`;
    
    console.log(`Querying Google Solar API...`);
    
    const response = await fetch(solarUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Google Solar API error: ${response.status} - ${errorText}`);
      
      // Return intelligent defaults based on New Mexico's excellent solar conditions
      return new Response(
        JSON.stringify(getDefaultSolarData(`API returned ${response.status}`)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Google Solar API response received`);

    // Extract relevant solar data
    const solarPotential = data.solarPotential || {};
    const roofSegments = solarPotential.roofSegmentStats || [];
    
    // Calculate total roof area from segments
    let totalRoofAreaMeters2 = 0;
    let totalSunshineHours = 0;
    
    for (const segment of roofSegments) {
      totalRoofAreaMeters2 += segment.stats?.areaMeters2 || 0;
      totalSunshineHours += segment.stats?.sunshineQuantiles?.[5] || 0; // Use median sunshine
    }
    
    // If no segment data, use overall data
    if (totalRoofAreaMeters2 === 0) {
      totalRoofAreaMeters2 = solarPotential.maxArrayAreaMeters2 || 100;
    }
    
    const avgSunshineHours = roofSegments.length > 0 
      ? totalSunshineHours / roofSegments.length 
      : solarPotential.maxSunshineHoursPerYear || 1800;

    // Convert to sq ft
    const roofAreaSqFt = Math.round(totalRoofAreaMeters2 * 10.764);
    
    // Calculate recommended capacity (assuming 18 watts per sq ft with good sun)
    const recommendedCapacityKw = Math.round((totalRoofAreaMeters2 * 180) / 1000 * 10) / 10;
    
    // Estimate annual savings (New Mexico avg $0.13/kWh, assuming 4.5 sun hours/day avg)
    const annualKwh = recommendedCapacityKw * 4.5 * 365 * 0.85; // 85% efficiency factor
    const annualSavingsEstimate = Math.round(annualKwh * 0.13);
    
    // Determine solar potential rating
    let solarPotentialRating: "excellent" | "good" | "fair" | "poor";
    if (avgSunshineHours >= 1700) {
      solarPotentialRating = "excellent";
    } else if (avgSunshineHours >= 1400) {
      solarPotentialRating = "good";
    } else if (avgSunshineHours >= 1100) {
      solarPotentialRating = "fair";
    } else {
      solarPotentialRating = "poor";
    }

    const result: SolarData = {
      sunlightHoursPerYear: Math.round(avgSunshineHours),
      maxArrayPanelsCount: solarPotential.maxArrayPanelsCount || Math.round(totalRoofAreaMeters2 / 1.7),
      maxArrayAreaMeters2: solarPotential.maxArrayAreaMeters2 || totalRoofAreaMeters2,
      maxSunshineHoursPerYear: solarPotential.maxSunshineHoursPerYear || avgSunshineHours,
      carbonOffsetFactorKgPerMwh: solarPotential.carbonOffsetFactorKgPerMwh || 417,
      panelCapacityWatts: solarPotential.panelCapacityWatts || 400,
      panelHeightMeters: solarPotential.panelHeightMeters || 1.65,
      panelWidthMeters: solarPotential.panelWidthMeters || 0.992,
      panelLifetimeYears: solarPotential.panelLifetimeYears || 25,
      solarPotential: solarPotentialRating,
      annualSavingsEstimate,
      roofAreaSqFt,
      recommendedCapacityKw,
    };

    console.log(`Solar analysis complete: ${result.solarPotential}, ${result.sunlightHoursPerYear} hours/year`);

    return new Response(
      JSON.stringify({ ...result, source: "Google Solar API" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Google Solar API error:', error);
    return new Response(
      JSON.stringify(getDefaultSolarData(errorMessage)),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultSolarData(reason: string): SolarData & { source: string } {
  // New Mexico has excellent solar resources - use realistic defaults
  console.log(`Returning default solar data: ${reason}`);
  return {
    sunlightHoursPerYear: 3200, // NM average
    maxArrayPanelsCount: 20,
    maxArrayAreaMeters2: 34,
    maxSunshineHoursPerYear: 3200,
    carbonOffsetFactorKgPerMwh: 417,
    panelCapacityWatts: 400,
    panelHeightMeters: 1.65,
    panelWidthMeters: 0.992,
    panelLifetimeYears: 25,
    solarPotential: "excellent",
    annualSavingsEstimate: 1840,
    roofAreaSqFt: 1200,
    recommendedCapacityKw: 8.0,
    source: `Estimated - ${reason}`,
  };
}
