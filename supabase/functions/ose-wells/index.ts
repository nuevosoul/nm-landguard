import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NM OSE Points of Diversion MapServer REST endpoint
const OSE_POD_URL = 'https://mercator.env.nm.gov/server/rest/services/nmose/pod/MapServer/0/query';

interface WellData {
  objectId: number;
  lat: number;
  lng: number;
  podType: string;
  podId: string;
  waterUse: string;
  status: string;
  permitNumber: string;
  distance: number;
}

// Input validation functions
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

function validateRadius(radius: unknown, defaultValue: number = 1, maxValue: number = 10): number {
  if (radius === undefined || radius === null) return defaultValue;
  const num = typeof radius === 'string' ? parseFloat(radius) : radius;
  if (typeof num !== 'number' || isNaN(num) || num < 0.1 || num > maxValue) return defaultValue;
  return num;
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
    const radiusMiles = validateRadius(body.radiusMiles, 1, 10);

    console.log(`Querying OSE wells near: ${lat}, ${lng} within ${radiusMiles} miles`);

    // Convert radius from miles to meters (1 mile = 1609.34 meters)
    const radiusMeters = radiusMiles * 1609.34;

    // Build query params for ArcGIS REST API
    const params = new URLSearchParams({
      where: '1=1',
      geometry: JSON.stringify({
        x: lng,
        y: lat,
        spatialReference: { wkid: 4326 }
      }),
      geometryType: 'esriGeometryPoint',
      spatialRel: 'esriSpatialRelIntersects',
      distance: radiusMeters.toString(),
      units: 'esriSRUnit_Meter',
      outFields: '*',
      returnGeometry: 'true',
      outSR: '4326',
      f: 'json'
    });

    console.log(`OSE query URL: ${OSE_POD_URL}?${params.toString()}`);

    // Add timeout to prevent hanging on slow government servers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let data;
    try {
      const response = await fetch(`${OSE_POD_URL}?${params.toString()}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error(`OSE API error: ${response.status} ${response.statusText}`);
        throw new Error(`OSE API returned ${response.status}`);
      }

      data = await response.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('OSE API fetch error:', fetchError);
      
      // Return graceful fallback when OSE API is unavailable
      return new Response(
        JSON.stringify({
          wells: [],
          summary: {
            totalWells: 0,
            withinHalfMile: 0,
            withinOneMile: 0,
            byType: {},
            byUse: {}
          },
          searchRadius: radiusMiles,
          centerLat: lat,
          centerLng: lng,
          source: 'NM Office of State Engineer',
          dataDescription: 'Points of Diversion (surface water diversions and wells)',
          serviceStatus: 'temporarily_unavailable',
          message: 'OSE database is temporarily unavailable. Well data will be included when service resumes.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`OSE API response features count: ${data.features?.length || 0}`);

    // Handle OSE API error response (e.g., 503 timeout)
    if (data.error) {
      console.error('OSE API error:', data.error);
      
      // Return graceful fallback instead of 500 error
      return new Response(
        JSON.stringify({
          wells: [],
          summary: {
            totalWells: 0,
            withinHalfMile: 0,
            withinOneMile: 0,
            byType: {},
            byUse: {}
          },
          searchRadius: radiusMiles,
          centerLat: lat,
          centerLng: lng,
          source: 'NM Office of State Engineer',
          dataDescription: 'Points of Diversion (surface water diversions and wells)',
          serviceStatus: 'temporarily_unavailable',
          message: 'OSE database is experiencing high load. Well data will be included when service resumes.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and format the well data
    const wells: WellData[] = (data.features || []).map((feature: any) => {
      const attrs = feature.attributes || {};
      const geom = feature.geometry || {};
      
      // Calculate distance from search point
      const wellLat = geom.y || 0;
      const wellLng = geom.x || 0;
      const distance = calculateDistanceMiles(lat, lng, wellLat, wellLng);

      // Map use codes to descriptions
      const useCodeMap: Record<string, string> = {
        'IRR': 'Irrigation',
        'DOM': 'Domestic',
        'STK': 'Stock',
        'MUN': 'Municipal',
        'IND': 'Industrial',
        'COM': 'Commercial',
        'MIN': 'Mining',
        'REC': 'Recreation',
        'PWR': 'Power',
        'OTH': 'Other'
      };
      
      // Map basin codes to types
      const basinTypeMap: Record<string, string> = {
        'SD': 'Surface Diversion',
        'UG': 'Underground Well',
        'SP': 'Spring',
        'GW': 'Groundwater'
      };
      
      const useCode = attrs.use_ || attrs.use || '';
      const basin = attrs.basin || attrs.pod_basin || '';
      
      return {
        objectId: attrs.OBJECTID || attrs.objectid || attrs.OBJECTID_1 || 0,
        lat: wellLat,
        lng: wellLng,
        podType: basinTypeMap[basin] || basin || 'Unknown',
        podId: attrs.pod_file || attrs.db_file || attrs.POD_ID || 'N/A',
        waterUse: useCodeMap[useCode] || useCode || 'Unknown',
        status: attrs.status || attrs.STATUS || 'Unknown',
        permitNumber: attrs.pod_file || attrs.db_file || 'N/A',
        distance: Math.round(distance * 100) / 100
      };
    }).sort((a: WellData, b: WellData) => a.distance - b.distance);

    // Summary stats
    const summary = {
      totalWells: wells.length,
      withinHalfMile: wells.filter((w: WellData) => w.distance <= 0.5).length,
      withinOneMile: wells.filter((w: WellData) => w.distance <= 1).length,
      byType: {} as Record<string, number>,
      byUse: {} as Record<string, number>
    };

    wells.forEach((w: WellData) => {
      summary.byType[w.podType] = (summary.byType[w.podType] || 0) + 1;
      summary.byUse[w.waterUse] = (summary.byUse[w.waterUse] || 0) + 1;
    });

    console.log(`Found ${wells.length} PODs/wells within ${radiusMiles} miles`);

    return new Response(
      JSON.stringify({
        wells: wells.slice(0, 50), // Limit to 50 nearest
        summary,
        searchRadius: radiusMiles,
        centerLat: lat,
        centerLng: lng,
        source: 'NM Office of State Engineer',
        dataDescription: 'Points of Diversion (surface water diversions and wells)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ose-wells function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Haversine formula to calculate distance between two points in miles
function calculateDistanceMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
