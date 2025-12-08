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
    
    const response = await fetch(`${baseUrl}?${params}`);
    const data = await response.json();

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
    return {
      floodZone: "X",
      floodZoneDescription: "Minimal Risk - Outside mapped flood hazard area",
      panelNumber: "N/A",
      effectiveDate: "Current",
      communityName: "",
      countyFips: "",
      sfha: false,
      riskLevel: "minimal",
      source: "FEMA NFHL - No data at location",
    };
  } catch (error) {
    console.error("FEMA query error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();

    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`FEMA flood zone lookup for: ${lat}, ${lng}`);

    const result = await queryFEMAFloodZone(lat, lng);

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Failed to query FEMA flood data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in fema-flood function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
