import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegridParcelData {
  parcelId: string;
  apn: string;
  owner: string;
  ownerAddress: string;
  siteAddress: string;
  legalDescription: string;
  acreage: number;
  landValue: number;
  improvementValue: number;
  totalValue: number;
  zoning: string;
  landUse: string;
  yearBuilt: number | null;
  county: string;
  state: string;
  parcelGeometry: Record<string, unknown> | null;
  source: string;
}

// Validate latitude (-90 to 90)
function validateLatitude(lat: unknown): { valid: boolean; value: number; error?: string } {
  if (lat === undefined || lat === null) {
    return { valid: false, value: 0, error: "Latitude is required" };
  }
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  if (typeof latNum !== 'number' || isNaN(latNum)) {
    return { valid: false, value: 0, error: "Latitude must be a valid number" };
  }
  if (latNum < -90 || latNum > 90) {
    return { valid: false, value: 0, error: "Latitude must be between -90 and 90" };
  }
  return { valid: true, value: latNum };
}

// Validate longitude (-180 to 180)
function validateLongitude(lng: unknown): { valid: boolean; value: number; error?: string } {
  if (lng === undefined || lng === null) {
    return { valid: false, value: 0, error: "Longitude is required" };
  }
  const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
  if (typeof lngNum !== 'number' || isNaN(lngNum)) {
    return { valid: false, value: 0, error: "Longitude must be a valid number" };
  }
  if (lngNum < -180 || lngNum > 180) {
    return { valid: false, value: 0, error: "Longitude must be between -180 and 180" };
  }
  return { valid: true, value: lngNum };
}

// Validate address string
function validateAddress(address: unknown): { valid: boolean; value: string; error?: string } {
  if (address === undefined || address === null || address === '') {
    return { valid: false, value: "", error: "Address is required" };
  }
  if (typeof address !== 'string') {
    return { valid: false, value: "", error: "Address must be a string" };
  }
  const trimmed = address.trim();
  if (trimmed.length < 5) {
    return { valid: false, value: "", error: "Address must be at least 5 characters" };
  }
  if (trimmed.length > 500) {
    return { valid: false, value: "", error: "Address must not exceed 500 characters" };
  }
  return { valid: true, value: trimmed };
}

// Extract parcel data from Regrid API response
function extractParcelData(feature: any): RegridParcelData {
  const props = feature.properties || {};
  const fields = props.fields || {};
  
  return {
    parcelId: props.path || fields.parcelnumb || "Unknown",
    apn: fields.parcelnumb || fields.apn || props.parcelnumb || "Unknown",
    owner: fields.owner || fields.ownername || props.owner || "Not available",
    ownerAddress: [
      fields.mailadd,
      fields.mail_city,
      fields.mail_state2,
      fields.mail_zip
    ].filter(Boolean).join(", ") || "Not available",
    siteAddress: fields.address || fields.siteaddr || props.address || "Not available",
    legalDescription: fields.legaldesc || fields.legal1 || "Not available",
    acreage: parseFloat(fields.ll_gisacre || fields.gisacre || fields.acres || "0") || 0,
    landValue: parseFloat(fields.landval || fields.lndvalue || "0") || 0,
    improvementValue: parseFloat(fields.impval || fields.impvalue || "0") || 0,
    totalValue: parseFloat(fields.parval || fields.totalvalue || fields.totval || "0") || 0,
    zoning: fields.zoning || fields.zoning_description || fields.zone || "Not available",
    landUse: fields.usedesc || fields.landuse || fields.propclass || "Not available",
    yearBuilt: fields.yearbuilt ? parseInt(fields.yearbuilt) : null,
    county: fields.county || props.context?.county?.name || "Unknown",
    state: fields.state2 || fields.state || props.context?.state?.name || "Unknown",
    parcelGeometry: feature.geometry || null,
    source: "Regrid Parcel API"
  };
}

// Query Regrid API by address
async function queryByAddress(address: string, token: string): Promise<RegridParcelData | null> {
  console.log(`Querying Regrid API by address: ${address}`);
  
  const url = new URL("https://app.regrid.com/api/v2/parcels/address");
  url.searchParams.set("query", address);
  url.searchParams.set("limit", "1");
  
  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Regrid API error (${response.status}): ${errorText}`);
    throw new Error(`Regrid API returned ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`Regrid address query returned ${data.parcels?.features?.length || 0} parcels`);
  
  if (data.parcels?.features?.length > 0) {
    return extractParcelData(data.parcels.features[0]);
  }
  
  return null;
}

// Query Regrid API by coordinates
async function queryByPoint(lat: number, lng: number, token: string): Promise<RegridParcelData | null> {
  console.log(`Querying Regrid API by point: ${lat}, ${lng}`);
  
  const url = new URL("https://app.regrid.com/api/v2/parcels/point");
  url.searchParams.set("lat", lat.toString());
  url.searchParams.set("lon", lng.toString());
  url.searchParams.set("limit", "1");
  
  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/json"
    }
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Regrid API error (${response.status}): ${errorText}`);
    throw new Error(`Regrid API returned ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  console.log(`Regrid point query returned ${data.parcels?.features?.length || 0} parcels`);
  
  if (data.parcels?.features?.length > 0) {
    return extractParcelData(data.parcels.features[0]);
  }
  
  return null;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const REGRID_API_TOKEN = Deno.env.get("REGRID_API_TOKEN");
    if (!REGRID_API_TOKEN) {
      console.error("REGRID_API_TOKEN is not configured");
      return new Response(
        JSON.stringify({ error: "Regrid API token not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { address, lat, lng } = body;
    
    let parcelData: RegridParcelData | null = null;

    // Determine query type: address or coordinates
    if (address) {
      // Address-based query
      const addressResult = validateAddress(address);
      if (!addressResult.valid) {
        return new Response(
          JSON.stringify({ error: addressResult.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      parcelData = await queryByAddress(addressResult.value, REGRID_API_TOKEN);
      
    } else if (lat !== undefined && lng !== undefined) {
      // Coordinate-based query
      const latResult = validateLatitude(lat);
      if (!latResult.valid) {
        return new Response(
          JSON.stringify({ error: latResult.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const lngResult = validateLongitude(lng);
      if (!lngResult.valid) {
        return new Response(
          JSON.stringify({ error: lngResult.error }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      parcelData = await queryByPoint(latResult.value, lngResult.value, REGRID_API_TOKEN);
      
    } else {
      return new Response(
        JSON.stringify({ error: "Either 'address' or 'lat' and 'lng' coordinates are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (parcelData) {
      console.log(`Parcel found: ${parcelData.parcelId}`);
      return new Response(
        JSON.stringify({ success: true, data: parcelData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No parcel found
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "No parcel found",
        message: "No parcel data found for the specified location"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Regrid parcel lookup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
