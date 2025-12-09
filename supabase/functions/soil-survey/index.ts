import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SoilResult {
  mapUnitName: string;
  mapUnitSymbol: string;
  drainageClass: string;
  hydrologicGroup: string;
  floodingFrequency: string;
  pondingFrequency: string;
  slopeRange: string;
  depthToWaterTable: string;
  depthToBedrock: string;
  texturePrimary: string;
  constructionLimitations: string;
  farmlandClass: string;
  erosionHazard: string;
  buildingSuitability: "good" | "fair" | "poor" | "very_poor";
  septicsuitability: "good" | "fair" | "poor" | "very_poor";
  source: string;
}

async function querySoilSurvey(lat: number, lng: number): Promise<SoilResult> {
  try {
    // USDA NRCS Web Soil Survey (SSURGO) API
    // Using the Soil Data Access (SDA) REST endpoint
    const sdaUrl = "https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest";
    
    // First, get the map unit at the point
    const query = `
      SELECT TOP 1 
        muname, musym, mukey
      FROM mapunit mu
      INNER JOIN SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${lng} ${lat})') mk
        ON mu.mukey = mk.mukey
    `;

    console.log(`Querying USDA Soil Data Access for ${lat}, ${lng}`);

    const response = await fetch(sdaUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: `query=${encodeURIComponent(query)}&format=JSON`,
    });

    // Check response status
    if (!response.ok) {
      console.error(`USDA API returned status: ${response.status}`);
      return getDefaultSoilData("USDA API unavailable");
    }

    const text = await response.text();
    
    // Check if response is HTML/XML instead of JSON
    if (text.trim().startsWith('<') || text.trim().startsWith('<?xml')) {
      console.error('USDA API returned XML/HTML instead of JSON');
      return getDefaultSoilData("USDA API returned non-JSON response");
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse USDA response as JSON:', parseError);
      return getDefaultSoilData("Invalid response format");
    }

    if (!data.Table || data.Table.length === 0) {
      console.log("No soil data found at location");
      return getDefaultSoilData("No data at location");
    }

    const row = data.Table[0];
    const mukey = row[2];
    const mapUnitName = row[0] || "Unknown";
    const mapUnitSymbol = row[1] || "N/A";

    // Query additional soil properties using the mukey
    const propertiesQuery = `
      SELECT TOP 1
        drainagecl, hydgrp, flodfreqcl, pondfreqcl, 
        slope_l, slope_h, wtdepannmin, brockdepmin,
        desgnmaster, texcl
      FROM component c
      INNER JOIN chorizon ch ON c.cokey = ch.cokey
      WHERE c.mukey = '${mukey}'
        AND c.comppct_r >= 50
      ORDER BY ch.hzdept_r
    `;

    const propsResponse = await fetch(sdaUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: `query=${encodeURIComponent(propertiesQuery)}&format=JSON`,
    });

    let propsData = { Table: [] };
    if (propsResponse.ok) {
      const propsText = await propsResponse.text();
      if (!propsText.trim().startsWith('<') && !propsText.trim().startsWith('<?xml')) {
        try {
          propsData = JSON.parse(propsText);
        } catch {
          console.log('Could not parse properties response');
        }
      }
    }
    
    let drainageClass = "Unknown";
    let hydrologicGroup = "Unknown";
    let floodingFrequency = "None";
    let pondingFrequency = "None";
    let slopeRange = "0-2%";
    let depthToWaterTable = ">6 feet";
    let depthToBedrock = ">60 inches";
    let texturePrimary = "Unknown";

    if (propsData.Table && propsData.Table.length > 0) {
      const props = propsData.Table[0];
      drainageClass = props[0] || "Unknown";
      hydrologicGroup = props[1] || "Unknown";
      floodingFrequency = props[2] || "None";
      pondingFrequency = props[3] || "None";
      
      const slopeLow = props[4] || 0;
      const slopeHigh = props[5] || 2;
      slopeRange = `${slopeLow}-${slopeHigh}%`;
      
      const wtDepth = props[6];
      depthToWaterTable = wtDepth ? `${wtDepth} cm` : ">6 feet";
      
      const rockDepth = props[7];
      depthToBedrock = rockDepth ? `${rockDepth} cm` : ">60 inches";
      
      texturePrimary = props[9] || "Unknown";
    }

    // Determine suitability ratings based on soil properties
    const buildingSuitability = determineBuildingSuitability(drainageClass, hydrologicGroup, floodingFrequency);
    const septicSuitability = determineSepticSuitability(drainageClass, hydrologicGroup, depthToWaterTable);

    return {
      mapUnitName,
      mapUnitSymbol,
      drainageClass,
      hydrologicGroup,
      floodingFrequency,
      pondingFrequency,
      slopeRange,
      depthToWaterTable,
      depthToBedrock,
      texturePrimary,
      constructionLimitations: getConstructionLimitations(drainageClass, floodingFrequency),
      farmlandClass: determineFarmlandClass(mapUnitName),
      erosionHazard: determineErosionHazard(hydrologicGroup, slopeRange),
      buildingSuitability,
      septicsuitability: septicSuitability,
      source: "USDA NRCS Web Soil Survey (SSURGO)",
    };
  } catch (error) {
    console.error("Soil survey query error:", error);
    return getDefaultSoilData("Query failed");
  }
}

function getDefaultSoilData(reason: string = "No data at location"): SoilResult {
  console.log(`Returning default soil data: ${reason}`);
  return {
    mapUnitName: "Data unavailable for location",
    mapUnitSymbol: "N/A",
    drainageClass: "Unknown",
    hydrologicGroup: "Unknown",
    floodingFrequency: "Unknown",
    pondingFrequency: "Unknown",
    slopeRange: "Unknown",
    depthToWaterTable: "Unknown",
    depthToBedrock: "Unknown",
    texturePrimary: "Unknown",
    constructionLimitations: "Unable to determine - site survey recommended",
    farmlandClass: "Not determined",
    erosionHazard: "Unknown",
    buildingSuitability: "fair",
    septicsuitability: "fair",
    source: `USDA NRCS - ${reason}`,
  };
}

function determineBuildingSuitability(drainage: string, hydGroup: string, flooding: string): "good" | "fair" | "poor" | "very_poor" {
  if (flooding && flooding.toLowerCase() !== "none") return "very_poor";
  if (drainage.toLowerCase().includes("poor")) return "poor";
  if (hydGroup === "D") return "poor";
  if (hydGroup === "C" || drainage.toLowerCase().includes("somewhat")) return "fair";
  return "good";
}

function determineSepticSuitability(drainage: string, hydGroup: string, waterTable: string): "good" | "fair" | "poor" | "very_poor" {
  if (waterTable.includes("<") || waterTable.includes("0-")) return "very_poor";
  if (drainage.toLowerCase().includes("poor")) return "very_poor";
  if (hydGroup === "D") return "poor";
  if (hydGroup === "C") return "fair";
  return "good";
}

function getConstructionLimitations(drainage: string, flooding: string): string {
  const limitations: string[] = [];
  
  if (flooding && flooding.toLowerCase() !== "none") {
    limitations.push("flood risk");
  }
  if (drainage.toLowerCase().includes("poor")) {
    limitations.push("poor drainage requiring improvements");
  }
  if (drainage.toLowerCase().includes("somewhat")) {
    limitations.push("moderate drainage limitations");
  }
  
  if (limitations.length === 0) return "No significant limitations identified";
  return limitations.join(", ").charAt(0).toUpperCase() + limitations.join(", ").slice(1);
}

function determineFarmlandClass(mapUnitName: string): string {
  const name = mapUnitName.toLowerCase();
  if (name.includes("prime")) return "Prime Farmland";
  if (name.includes("farmland of statewide")) return "Farmland of Statewide Importance";
  if (name.includes("unique")) return "Unique Farmland";
  return "Not Prime Farmland";
}

function determineErosionHazard(hydGroup: string, slopeRange: string): string {
  const slopeMatch = slopeRange.match(/(\d+)/);
  const maxSlope = slopeMatch ? parseInt(slopeMatch[1]) : 0;
  
  if (maxSlope > 15 || hydGroup === "D") return "Severe";
  if (maxSlope > 8 || hydGroup === "C") return "Moderate";
  if (maxSlope > 3) return "Slight";
  return "Minimal";
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

    console.log(`Soil survey lookup for: ${lat}, ${lng}`);

    const result = await querySoilSurvey(lat, lng);

    // Always return a result (function now always returns default instead of null)
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in soil-survey function:", error);
    // Return default result on any error
    return new Response(
      JSON.stringify(getDefaultSoilData("Request processing error")),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
