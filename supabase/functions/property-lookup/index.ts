import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PropertyData {
  owner: string;
  ownerAddress: string;
  siteAddress: string;
  legalDescription: string;
  parcelId: string;
  acreage: number;
  landValue: number;
  improvementValue: number;
  totalValue: number;
  taxableValue: number;
  propertyClass: string;
  taxYear: string;
  county: string;
  source: string;
}

// Determine county from coordinates (simplified NM county boundaries)
function getCountyFromCoordinates(lat: number, lng: number): string {
  // Rough bounding boxes for major NM counties
  // Bernalillo: roughly 34.8-35.3 lat, -107.0 to -106.2 lng
  if (lat >= 34.8 && lat <= 35.3 && lng >= -107.0 && lng <= -106.2) {
    return "bernalillo";
  }
  // Rio Arriba: roughly 36.0-37.0 lat, -107.5 to -105.5 lng
  if (lat >= 35.8 && lat <= 37.0 && lng >= -107.5 && lng <= -105.5) {
    return "rio_arriba";
  }
  // Santa Fe: roughly 35.2-36.0 lat, -106.5 to -105.5 lng
  if (lat >= 35.2 && lat <= 36.2 && lng >= -106.5 && lng <= -105.0) {
    return "santa_fe";
  }
  // Default to unknown
  return "unknown";
}

// Convert WGS84 coordinates to Web Mercator (EPSG:3857)
function toWebMercator(lat: number, lng: number): { x: number; y: number } {
  const x = lng * 20037508.34 / 180;
  const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
  const yMercator = y * 20037508.34 / 180;
  return { x, y: yMercator };
}

async function queryBernalilloCounty(lat: number, lng: number): Promise<PropertyData | null> {
  console.log("Querying Bernalillo County assessor API...");
  
  try {
    const { x, y } = toWebMercator(lat, lng);
    
    // Query the parcel layer with identify operation
    const baseUrl = "https://assessormap.bernco.gov/server/rest/services/Enterprise_Assessment_And_Tax/Public_Access_Parcel_Data_EAT/MapServer/0/query";
    
    const params = new URLSearchParams({
      f: "json",
      geometry: JSON.stringify({ x, y, spatialReference: { wkid: 3857 } }),
      geometryType: "esriGeometryPoint",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "false"
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();
    
    console.log(`Bernalillo query returned ${data.features?.length || 0} features`);
    
    if (data.features && data.features.length > 0) {
      const attrs = data.features[0].attributes;
      
      return {
        owner: attrs.OWNER || "Not available",
        ownerAddress: [attrs.OWNADD, attrs.OWNADD2].filter(Boolean).join(", ") || "Not available",
        siteAddress: attrs.SITUSADD || "Not available",
        legalDescription: attrs.LEGALDESC || "Not available",
        parcelId: attrs.UPC || "Not available",
        acreage: attrs.ACREAGE || 0,
        landValue: attrs.LANDVALUE || 0,
        improvementValue: attrs.IMPTVALUE || 0,
        totalValue: attrs.TOTVALUE || 0,
        taxableValue: attrs.NETTAXABLE || 0,
        propertyClass: attrs.PROPCLASS || "Unknown",
        taxYear: attrs.TAXYR || new Date().getFullYear().toString(),
        county: "Bernalillo County",
        source: "Bernalillo County Assessor GIS"
      };
    }
    
    return null;
  } catch (error) {
    console.error("Bernalillo County query error:", error);
    return null;
  }
}

async function queryRioArribaCounty(lat: number, lng: number): Promise<PropertyData | null> {
  console.log("Querying Rio Arriba County assessor (EagleWeb)...");
  
  // Rio Arriba uses EagleWeb which requires a different approach
  // The EagleWeb system doesn't have a direct coordinate query API
  // We'd need to search by address or parcel number
  
  // For now, return null - this would require implementing EagleWeb scraping
  // or finding if they have a GIS service similar to Bernalillo
  
  console.log("Rio Arriba EagleWeb integration not yet implemented");
  return null;
}

async function querySantaFeCounty(lat: number, lng: number): Promise<PropertyData | null> {
  console.log("Querying Santa Fe County assessor...");
  
  try {
    // Santa Fe County has an ArcGIS service
    const { x, y } = toWebMercator(lat, lng);
    
    const baseUrl = "https://maps.santafecountynm.gov/arcgis/rest/services/Assessor/Parcels/MapServer/0/query";
    
    const params = new URLSearchParams({
      f: "json",
      geometry: JSON.stringify({ x, y, spatialReference: { wkid: 3857 } }),
      geometryType: "esriGeometryPoint",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "false"
    });

    const response = await fetch(`${baseUrl}?${params.toString()}`);
    const data = await response.json();
    
    console.log(`Santa Fe query returned ${data.features?.length || 0} features`);
    
    if (data.features && data.features.length > 0) {
      const attrs = data.features[0].attributes;
      
      return {
        owner: attrs.OWNER_NAME || attrs.OWNER || "Not available",
        ownerAddress: attrs.OWNER_ADDRESS || "Not available",
        siteAddress: attrs.SITUS_ADDRESS || attrs.SITUS || "Not available",
        legalDescription: attrs.LEGAL_DESC || attrs.LEGAL || "Not available",
        parcelId: attrs.PARCEL_ID || attrs.APN || "Not available",
        acreage: attrs.ACRES || attrs.ACREAGE || 0,
        landValue: attrs.LAND_VALUE || 0,
        improvementValue: attrs.IMPROVEMENT_VALUE || attrs.IMPR_VALUE || 0,
        totalValue: attrs.TOTAL_VALUE || attrs.MARKET_VALUE || 0,
        taxableValue: attrs.TAXABLE_VALUE || 0,
        propertyClass: attrs.PROPERTY_CLASS || attrs.PROP_CLASS || "Unknown",
        taxYear: attrs.TAX_YEAR || new Date().getFullYear().toString(),
        county: "Santa Fe County",
        source: "Santa Fe County Assessor GIS"
      };
    }
    
    return null;
  } catch (error) {
    console.error("Santa Fe County query error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    
    if (lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: 'Coordinates required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Property lookup for: ${lat}, ${lng}`);

    // Determine which county to query
    const county = getCountyFromCoordinates(lat, lng);
    console.log(`Detected county: ${county}`);

    let propertyData: PropertyData | null = null;

    switch (county) {
      case "bernalillo":
        propertyData = await queryBernalilloCounty(lat, lng);
        break;
      case "rio_arriba":
        propertyData = await queryRioArribaCounty(lat, lng);
        break;
      case "santa_fe":
        propertyData = await querySantaFeCounty(lat, lng);
        break;
      default:
        console.log("County not supported for property lookup");
    }

    if (propertyData) {
      console.log("Property data found:", propertyData.parcelId);
      return new Response(
        JSON.stringify({ success: true, data: propertyData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No data found
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Property data not found",
        county: county,
        message: county === "unknown" 
          ? "Property location is outside supported county boundaries" 
          : `No parcel data found at these coordinates in ${county.replace("_", " ")} county`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Property lookup error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
