import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadbandData {
  overallAvailability: "excellent" | "good" | "fair" | "limited" | "none";
  overallLabel: string;
  maxDownloadSpeed: string;
  maxUploadSpeed: string;
  providers: {
    name: string;
    technology: string;
    maxDown: number;
    maxUp: number;
  }[];
  hasFiber: boolean;
  hasCable: boolean;
  hasDSL: boolean;
  hasFixedWireless: boolean;
  hasSatellite: boolean;
  starlinkNote: string;
  recommendation: string;
  source: string;
}

// FCC Broadband Map API
async function checkFCCBroadband(lat: number, lng: number): Promise<BroadbandData> {
  const fccUrl = `https://broadbandmap.fcc.gov/api/location/fixed?lat=${lat}&lon=${lng}`;
  
  try {
    const response = await fetch(fccUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RioGrandeDueDiligence/1.0'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('FCC broadband data received');
      
      const providers: BroadbandData["providers"] = [];
      let hasFiber = false, hasCable = false, hasDSL = false, hasFixedWireless = false, hasSatellite = false;
      let maxDown = 0, maxUp = 0;
      
      if (data.providers && Array.isArray(data.providers)) {
        for (const provider of data.providers) {
          const tech = provider.technology || provider.techType || 'Unknown';
          const down = provider.maxDownload || provider.downloadSpeed || 0;
          const up = provider.maxUpload || provider.uploadSpeed || 0;
          
          if (down > maxDown) maxDown = down;
          if (up > maxUp) maxUp = up;
          
          // Categorize technology
          if (tech.toLowerCase().includes('fiber')) hasFiber = true;
          if (tech.toLowerCase().includes('cable')) hasCable = true;
          if (tech.toLowerCase().includes('dsl') || tech.toLowerCase().includes('copper')) hasDSL = true;
          if (tech.toLowerCase().includes('wireless') || tech.toLowerCase().includes('fixed')) hasFixedWireless = true;
          if (tech.toLowerCase().includes('satellite')) hasSatellite = true;
          
          providers.push({
            name: provider.providerName || provider.name || 'Unknown',
            technology: tech,
            maxDown: down,
            maxUp: up,
          });
        }
      }
      
      return buildResult(providers, maxDown, maxUp, hasFiber, hasCable, hasDSL, hasFixedWireless, hasSatellite, "FCC Broadband Map");
    }
  } catch (error) {
    console.log('FCC Broadband API error, using estimation:', error);
  }
  
  // Fallback: estimate based on location
  return estimateBroadband(lat, lng);
}

function estimateBroadband(lat: number, lng: number): BroadbandData {
  // Urban areas have good broadband
  const nearAlbuquerque = lat >= 35.0 && lat <= 35.3 && lng >= -106.8 && lng <= -106.3;
  const nearSantaFe = lat >= 35.5 && lat <= 35.8 && lng >= -106.1 && lng <= -105.8;
  const nearMajorCity = nearAlbuquerque || nearSantaFe;
  
  const ruralNorth = lat > 36.0;
  const veryRural = lat > 36.5 || lng < -107.0 || lng > -104.0;
  
  if (nearMajorCity) {
    return buildResult([
      { name: "Xfinity/Comcast", technology: "Cable", maxDown: 1000, maxUp: 35 },
      { name: "CenturyLink", technology: "Fiber/DSL", maxDown: 940, maxUp: 940 },
      { name: "T-Mobile Home", technology: "Fixed Wireless", maxDown: 245, maxUp: 31 },
    ], 1000, 940, true, true, true, true, true, "Regional Estimate (Urban)");
  } else if (veryRural) {
    return buildResult([
      { name: "HughesNet", technology: "Satellite", maxDown: 25, maxUp: 3 },
      { name: "Viasat", technology: "Satellite", maxDown: 100, maxUp: 3 },
      { name: "Starlink", technology: "Satellite", maxDown: 220, maxUp: 25 },
    ], 220, 25, false, false, false, false, true, "Regional Estimate (Rural)");
  } else if (ruralNorth) {
    return buildResult([
      { name: "Kit Carson Electric Coop", technology: "Fiber", maxDown: 1000, maxUp: 1000 },
      { name: "CenturyLink", technology: "DSL", maxDown: 25, maxUp: 3 },
      { name: "Starlink", technology: "Satellite", maxDown: 220, maxUp: 25 },
    ], 1000, 1000, true, false, true, false, true, "Regional Estimate (Northern NM)");
  } else {
    return buildResult([
      { name: "CenturyLink", technology: "DSL", maxDown: 100, maxUp: 10 },
      { name: "Local WISP", technology: "Fixed Wireless", maxDown: 50, maxUp: 10 },
      { name: "Starlink", technology: "Satellite", maxDown: 220, maxUp: 25 },
    ], 100, 25, false, false, true, true, true, "Regional Estimate (NM)");
  }
}

function buildResult(
  providers: BroadbandData["providers"], 
  maxDown: number, 
  maxUp: number, 
  hasFiber: boolean, 
  hasCable: boolean, 
  hasDSL: boolean, 
  hasFixedWireless: boolean, 
  hasSatellite: boolean,
  source: string
): BroadbandData {
  // Determine overall availability
  let overallAvailability: BroadbandData["overallAvailability"] = "none";
  let overallLabel = "No Broadband";
  
  if (hasFiber && maxDown >= 500) {
    overallAvailability = "excellent";
    overallLabel = "Excellent (Fiber Available)";
  } else if ((hasCable || hasFiber) && maxDown >= 100) {
    overallAvailability = "good";
    overallLabel = "Good (High-Speed Available)";
  } else if (maxDown >= 25) {
    overallAvailability = "fair";
    overallLabel = "Fair (Basic Broadband)";
  } else if (maxDown > 0 || hasSatellite) {
    overallAvailability = "limited";
    overallLabel = "Limited (Satellite/DSL Only)";
  }
  
  const formatSpeed = (mbps: number): string => {
    if (mbps >= 1000) return `${(mbps / 1000).toFixed(1)} Gbps`;
    return `${mbps} Mbps`;
  };
  
  let recommendation = "";
  if (hasFiber) {
    recommendation = "Fiber available - best option for speed and reliability";
  } else if (hasCable) {
    recommendation = "Cable internet available - good for most uses";
  } else if (hasFixedWireless && maxDown >= 50) {
    recommendation = "Fixed wireless available - verify line of sight requirements";
  } else {
    recommendation = "Starlink recommended - best rural option with 100-220 Mbps";
  }
  
  return {
    overallAvailability,
    overallLabel,
    maxDownloadSpeed: formatSpeed(maxDown),
    maxUploadSpeed: formatSpeed(maxUp),
    providers: providers.slice(0, 4),
    hasFiber,
    hasCable,
    hasDSL,
    hasFixedWireless,
    hasSatellite,
    starlinkNote: "Starlink satellite internet available nationwide - $120/mo, 50-220 Mbps, good for rural areas",
    recommendation,
    source,
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

    console.log(`Broadband lookup for: ${lat}, ${lng}`);

    const result = await checkFCCBroadband(lat, lng);
    
    console.log(`Broadband: ${result.overallLabel}, max ${result.maxDownloadSpeed}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Broadband error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
