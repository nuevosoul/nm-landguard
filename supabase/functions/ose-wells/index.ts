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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, radiusMiles = 1 } = await req.json();
    
    if (!lat || !lng) {
      console.error('No coordinates provided');
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Querying OSE wells near: ${lat}, ${lng} within ${radiusMiles} miles`);

    // Convert radius from miles to meters (1 mile = 1609.34 meters)
    const radiusMeters = radiusMiles * 1609.34;

    // Build query params for ArcGIS REST API
    // We'll query with a geometry buffer around the point
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

    const response = await fetch(`${OSE_POD_URL}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`OSE API error: ${response.status} ${response.statusText}`);
      throw new Error(`OSE API returned ${response.status}`);
    }

    const data = await response.json();

    console.log(`OSE API response features count: ${data.features?.length || 0}`);

    if (data.error) {
      console.error('OSE API error:', data.error);
      return new Response(
        JSON.stringify({ 
          error: 'OSE service error', 
          details: data.error.message || data.error
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      return {
        objectId: attrs.OBJECTID || attrs.objectid || 0,
        lat: wellLat,
        lng: wellLng,
        podType: attrs.POD_TYPE || attrs.pod_type || 'Unknown',
        podId: attrs.POD_ID || attrs.pod_id || 'N/A',
        waterUse: attrs.USE_DESC || attrs.use_desc || attrs.USE || attrs.use || 'Unknown',
        status: attrs.STATUS || attrs.status || 'Unknown',
        permitNumber: attrs.FILE_NUMBER || attrs.file_number || attrs.PERMIT_NO || 'N/A',
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
