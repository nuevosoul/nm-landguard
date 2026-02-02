import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CellCoverageData {
  overallCoverage: "excellent" | "good" | "fair" | "poor" | "none";
  overallLabel: string;
  carriers: {
    name: string;
    has4G: boolean;
    has5G: boolean;
    signalStrength: "strong" | "moderate" | "weak" | "none";
  }[];
  ruralNote: string;
  recommendation: string;
  source: string;
}

// FCC Broadband Map API for mobile coverage
async function checkFCCCoverage(lat: number, lng: number): Promise<CellCoverageData> {
  // FCC Area API endpoint
  const fccUrl = `https://broadbandmap.fcc.gov/api/location/mobile?lat=${lat}&lon=${lng}`;
  
  try {
    const response = await fetch(fccUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RioGrandeDueDiligence/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('FCC mobile coverage data received');
      
      // Parse FCC response
      const carriers: CellCoverageData["carriers"] = [];
      let hasAny4G = false;
      let hasAny5G = false;
      
      if (data.providers && Array.isArray(data.providers)) {
        for (const provider of data.providers) {
          const has4G = provider.technologies?.includes('4G LTE') || provider.lte === true;
          const has5G = provider.technologies?.includes('5G') || provider['5g'] === true;
          
          if (has4G) hasAny4G = true;
          if (has5G) hasAny5G = true;
          
          carriers.push({
            name: provider.providerName || provider.name || 'Unknown',
            has4G,
            has5G,
            signalStrength: has5G ? "strong" : has4G ? "moderate" : "weak",
          });
        }
      }
      
      // Determine overall coverage
      let overallCoverage: CellCoverageData["overallCoverage"] = "none";
      let overallLabel = "No Coverage";
      
      if (hasAny5G && carriers.length >= 2) {
        overallCoverage = "excellent";
        overallLabel = "Excellent (5G Available)";
      } else if (hasAny5G) {
        overallCoverage = "good";
        overallLabel = "Good (5G Limited)";
      } else if (hasAny4G && carriers.length >= 2) {
        overallCoverage = "good";
        overallLabel = "Good (4G LTE)";
      } else if (hasAny4G) {
        overallCoverage = "fair";
        overallLabel = "Fair (Limited 4G)";
      } else if (carriers.length > 0) {
        overallCoverage = "poor";
        overallLabel = "Poor (3G/Voice Only)";
      }
      
      return {
        overallCoverage,
        overallLabel,
        carriers: carriers.slice(0, 4), // Top 4 carriers
        ruralNote: carriers.length < 2 
          ? "Limited carrier options - consider signal boosters or satellite options" 
          : "Multiple carriers available",
        recommendation: getRecommendation(overallCoverage),
        source: "FCC Broadband Map",
      };
    }
  } catch (error) {
    console.log('FCC API error, using estimation:', error);
  }
  
  // Fallback: estimate based on location (rural NM has spotty coverage)
  return estimateCoverage(lat, lng);
}

function estimateCoverage(lat: number, lng: number): CellCoverageData {
  // Major NM cities have good coverage
  // Albuquerque area: 35.0-35.2 lat, -106.4 to -106.8 lng
  // Santa Fe: 35.6-35.7 lat, -105.9 to -106.0 lng
  
  const nearAlbuquerque = lat >= 35.0 && lat <= 35.3 && lng >= -106.8 && lng <= -106.3;
  const nearSantaFe = lat >= 35.5 && lat <= 35.8 && lng >= -106.1 && lng <= -105.8;
  const nearMajorCity = nearAlbuquerque || nearSantaFe;
  
  // Northern rural areas (your farm area) have less coverage
  const ruralNorth = lat > 36.0;
  const veryRural = lat > 36.5 || lng < -107.0 || lng > -104.0;
  
  if (nearMajorCity) {
    return {
      overallCoverage: "excellent",
      overallLabel: "Excellent (Urban Area)",
      carriers: [
        { name: "Verizon", has4G: true, has5G: true, signalStrength: "strong" },
        { name: "AT&T", has4G: true, has5G: true, signalStrength: "strong" },
        { name: "T-Mobile", has4G: true, has5G: true, signalStrength: "strong" },
      ],
      ruralNote: "Full coverage from major carriers",
      recommendation: "Standard cell service, no special equipment needed",
      source: "Regional Estimate (Urban)",
    };
  } else if (veryRural) {
    return {
      overallCoverage: "poor",
      overallLabel: "Poor (Very Rural)",
      carriers: [
        { name: "Verizon", has4G: true, has5G: false, signalStrength: "weak" },
        { name: "AT&T", has4G: false, has5G: false, signalStrength: "none" },
      ],
      ruralNote: "Very limited coverage - satellite phone or Starlink recommended",
      recommendation: "Consider Starlink for internet, satellite phone for emergencies",
      source: "Regional Estimate (Rural NM)",
    };
  } else if (ruralNorth) {
    return {
      overallCoverage: "fair",
      overallLabel: "Fair (Rural)",
      carriers: [
        { name: "Verizon", has4G: true, has5G: false, signalStrength: "moderate" },
        { name: "AT&T", has4G: true, has5G: false, signalStrength: "weak" },
        { name: "T-Mobile", has4G: false, has5G: false, signalStrength: "weak" },
      ],
      ruralNote: "Spotty coverage - signal boosters recommended for indoor use",
      recommendation: "Cell signal booster recommended, verify coverage before purchase",
      source: "Regional Estimate (Rural NM)",
    };
  } else {
    return {
      overallCoverage: "good",
      overallLabel: "Good (Suburban/Rural)",
      carriers: [
        { name: "Verizon", has4G: true, has5G: false, signalStrength: "strong" },
        { name: "AT&T", has4G: true, has5G: false, signalStrength: "moderate" },
        { name: "T-Mobile", has4G: true, has5G: false, signalStrength: "moderate" },
      ],
      ruralNote: "Reasonable coverage from most carriers",
      recommendation: "Standard cell service should work, test before committing",
      source: "Regional Estimate (NM)",
    };
  }
}

function getRecommendation(coverage: CellCoverageData["overallCoverage"]): string {
  switch (coverage) {
    case "excellent":
      return "Full cell service available, standard plans work well";
    case "good":
      return "Good coverage, may want signal booster for indoor use";
    case "fair":
      return "Consider signal booster, verify coverage with carrier before purchase";
    case "poor":
      return "Recommend signal booster or Starlink/satellite backup";
    case "none":
      return "No cell coverage - Starlink or satellite phone required";
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

    console.log(`Cell coverage lookup for: ${lat}, ${lng}`);

    const result = await checkFCCCoverage(lat, lng);
    
    console.log(`Cell coverage: ${result.overallLabel}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cell coverage error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
