import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// BLM National PLSS CadNSDI MapServer
const BLM_PLSS_BASE = 'https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer';

interface PLSSResult {
  township: string;
  range: string;
  section: string;
  principalMeridian: string;
  stateCode: string;
  legalDescription: string;
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

    console.log(`Looking up PLSS for coordinates: ${lat}, ${lng}`);

    // Query PLSS Section layer (layer 2) using identify
    const identifyUrl = `${BLM_PLSS_BASE}/identify`;
    
    // Convert lat/lng to Web Mercator for the query
    const x = lng * 20037508.34 / 180;
    const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180;
    
    const params = new URLSearchParams({
      geometry: JSON.stringify({ x: lng, y: lat, spatialReference: { wkid: 4326 } }),
      geometryType: 'esriGeometryPoint',
      sr: '4326',
      layers: 'all:1,2', // Township (1) and Section (2)
      tolerance: '0',
      mapExtent: `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`,
      imageDisplay: '400,400,96',
      returnGeometry: 'false',
      f: 'json'
    });

    console.log(`BLM PLSS Identify URL: ${identifyUrl}`);

    const response = await fetch(`${identifyUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`BLM API error: ${response.status}`);
      throw new Error(`BLM API returned ${response.status}`);
    }

    const data = await response.json();
    console.log(`BLM PLSS response: ${JSON.stringify(data).slice(0, 500)}`);

    if (data.error) {
      console.error('BLM API error:', data.error);
      return new Response(
        JSON.stringify({ error: 'BLM PLSS service error', details: data.error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse results
    let township = '';
    let range = '';
    let section = '';
    let principalMeridian = 'New Mexico Principal Meridian';
    let stateCode = 'NM';

    if (data.results && data.results.length > 0) {
      for (const result of data.results) {
        const attrs = result.attributes || {};
        
        // Layer 1 = Township
        if (result.layerId === 1) {
          // TWNSHPLAB contains township/range label like "T10N R4E"
          const twpLabel = attrs.TWNSHPLAB || attrs.PLSSID || '';
          console.log(`Township attributes: ${JSON.stringify(attrs)}`);
          
          // Parse township and range from various possible fields
          township = attrs.TWNSHPNO || attrs.PLSSTOWNSHIP || extractTownship(twpLabel);
          range = attrs.RANGENO || attrs.PLSSRANGE || extractRange(twpLabel);
          
          if (attrs.PRINMERCD) {
            principalMeridian = getPrincipalMeridianName(attrs.PRINMERCD);
          }
          if (attrs.STATECD) {
            stateCode = attrs.STATECD;
          }
        }
        
        // Layer 2 = Section
        if (result.layerId === 2) {
          console.log(`Section attributes: ${JSON.stringify(attrs)}`);
          section = attrs.FRSTDIVNO || attrs.SECDIVNO || attrs.PLSSSEC || '';
          
          // Also try to get township/range from section layer if not found
          if (!township && attrs.TWNSHPNO) township = attrs.TWNSHPNO;
          if (!range && attrs.RANGENO) range = attrs.RANGENO;
        }
      }
    }

    // Format legal description
    let legalDescription = '';
    if (township && range && section) {
      legalDescription = `Section ${section}, Township ${township}, Range ${range}, ${principalMeridian}`;
    } else if (township && range) {
      legalDescription = `Township ${township}, Range ${range}, ${principalMeridian}`;
    } else {
      // Fallback: generate from coordinates
      legalDescription = generateLegalDescriptionFromCoords(lat, lng);
    }

    const result: PLSSResult = {
      township,
      range,
      section,
      principalMeridian,
      stateCode,
      legalDescription
    };

    console.log(`PLSS result: ${JSON.stringify(result)}`);

    return new Response(
      JSON.stringify({
        ...result,
        source: 'BLM National PLSS',
        coordinates: { lat, lng }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in plss-lookup function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractTownship(label: string): string {
  const match = label.match(/T(\d+[NS]?)/i);
  return match ? match[1] : '';
}

function extractRange(label: string): string {
  const match = label.match(/R(\d+[EW]?)/i);
  return match ? match[1] : '';
}

function getPrincipalMeridianName(code: string): string {
  const meridians: Record<string, string> = {
    '23': 'New Mexico Principal Meridian',
    'NM': 'New Mexico Principal Meridian',
    '22': 'Navajo Principal Meridian',
    // Add more as needed
  };
  return meridians[code] || 'New Mexico Principal Meridian';
}

function generateLegalDescriptionFromCoords(lat: number, lng: number): string {
  // Approximate PLSS calculation for New Mexico
  // NM Principal Meridian origin: 34.2583°N, 106.8906°W
  const pmLat = 34.2583;
  const pmLng = -106.8906;
  
  // Each township is approximately 6 miles
  const milesPerDegLat = 69;
  const milesPerDegLng = 69 * Math.cos(lat * Math.PI / 180);
  
  const latDiff = lat - pmLat;
  const lngDiff = lng - pmLng;
  
  const townshipNum = Math.abs(Math.floor(latDiff * milesPerDegLat / 6)) + 1;
  const townshipDir = latDiff >= 0 ? 'N' : 'S';
  
  const rangeNum = Math.abs(Math.floor(lngDiff * milesPerDegLng / 6)) + 1;
  const rangeDir = lngDiff >= 0 ? 'E' : 'W';
  
  return `Approximate: Township ${townshipNum}${townshipDir}, Range ${rangeNum}${rangeDir}, New Mexico Principal Meridian`;
}
