import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FloodZoneResult {
  floodZone: string;
  floodZoneDescription: string;
  panelNumber: string;
  effectiveDate: string;
  communityName: string;
  countyFips: string;
  sfha: boolean; // Special Flood Hazard Area
  riskLevel: "high" | "moderate" | "low" | "minimal";
  source: string;
}

// FEMA flood zone descriptions
const floodZoneDescriptions: Record<string, { description: string; risk: "high" | "moderate" | "low" | "minimal" }> = {
  "A": { description: "High Risk - 1% annual chance flood (100-year)", risk: "high" },
  "AE": { description: "High Risk - 1% annual chance flood with BFE", risk: "high" },
  "AH": { description: "High Risk - Shallow flooding 1-3 feet", risk: "high" },
  "AO": { description: "High Risk - Sheet flow flooding", risk: "high" },
  "AR": { description: "High Risk - Temporary increased flood risk", risk: "high" },
  "A99": { description: "High Risk - Federal flood protection system", risk: "high" },
  "V": { description: "Coastal High Risk - Wave action", risk: "high" },
  "VE": { description: "Coastal High Risk - Wave action with BFE", risk: "high" },
  "X (SHADED)": { description: "Moderate Risk - 0.2% annual chance (500-year)", risk: "moderate" },
  "B": { description: "Moderate Risk - 0.2% annual chance (500-year)", risk: "moderate" },
  "X": { description: "Minimal Risk - Outside 500-year floodplain", risk: "minimal" },
  "C": { description: "Minimal Risk - Minimal flood hazard", risk: "minimal" },
  "D": { description: "Undetermined Risk - Possible flood hazard", risk: "low" },
};

async function queryFEMAFloodZone(lat: number, lng: number): Promise<FloodZoneResult | null> {
  try {
    // FEMA National Flood Hazard Layer (NFHL) REST API
    // Using the Flood Hazard Zones layer (layer 28)
    const baseUrl = "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28/query";
    
    const params = new URLSearchParams({
      geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
      geometryType: "esriGeometryPoint",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "FLD_ZONE,ZONE_SUBTY,SFHA_TF,STATIC_BFE,DFIRM_ID,VERSION_ID,FLD_AR_ID",
      returnGeometry: "false",
      f: "json",
    });

    console.log(`Querying FEMA flood zone for ${lat}, ${lng}`);
    
    const response = await fetch(`${baseUrl}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RioGrandeDueDiligence/1.0'
      }
    });
    
    // Check if response is ok
    if (!response.ok) {
      console.error(`FEMA API returned status: ${response.status}`);
      // Return default minimal risk instead of failing
      return getDefaultResult("FEMA API unavailable");
    }
    
    // Check content type to avoid parsing HTML as JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      console.error(`FEMA API returned non-JSON content type: ${contentType}`);
      return getDefaultResult("FEMA API returned non-JSON response");
    }
    
    const text = await response.text();
    
    // Check if response starts with HTML
    if (text.trim().startsWith('<')) {
      console.error('FEMA API returned HTML instead of JSON');
      return getDefaultResult("FEMA API temporarily unavailable");
    }
    
    const data = JSON.parse(text);

    if (data.error) {
      console.error("FEMA API error:", data.error);
      return getDefaultResult("FEMA query error");
    }

    if (data.features && data.features.length > 0) {
      const feature = data.features[0].attributes;
      const zoneCode = feature.FLD_ZONE || "X";
      const subType = feature.ZONE_SUBTY;
      
      // Determine full zone designation
      let fullZone = zoneCode;
      if (subType && subType.includes("500")) {
        fullZone = "X (SHADED)";
      }
      
      const zoneInfo = floodZoneDescriptions[fullZone] || floodZoneDescriptions[zoneCode] || {
        description: "Unknown flood zone",
        risk: "low" as const
      };

      return {
        floodZone: fullZone,
        floodZoneDescription: zoneInfo.description,
        panelNumber: feature.DFIRM_ID || "N/A",
        effectiveDate: "Current",
        communityName: "",
        countyFips: "",
        sfha: feature.SFHA_TF === "T" || zoneCode.startsWith("A") || zoneCode.startsWith("V"),
        riskLevel: zoneInfo.risk,
        source: "FEMA National Flood Hazard Layer (NFHL)",
      };
    }

    // If no data found, return minimal risk default
    return getDefaultResult("No FEMA data at location");
  } catch (error) {
    console.error("FEMA query error:", error);
    return getDefaultResult("FEMA query failed");
  }
}

function getDefaultResult(reason: string): FloodZoneResult {
  console.log(`Returning default flood zone result: ${reason}`);
  return {
    floodZone: "X",
    floodZoneDescription: "Minimal Risk - Outside mapped flood hazard area",
    panelNumber: "N/A",
    effectiveDate: "Current",
    communityName: "",
    countyFips: "",
    sfha: false,
    riskLevel: "minimal",
    source: `FEMA NFHL - ${reason}`,
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

    console.log(`FEMA flood zone lookup for: ${lat}, ${lng}`);

    const result = await queryFEMAFloodZone(lat, lng);

    // Always return a result (function now always returns default instead of null)
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fema-flood function:", error);
    // Return default result on any error
    return new Response(
      JSON.stringify(getDefaultResult("Request processing error")),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
