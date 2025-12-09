import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NearbyService {
  name: string;
  distance: number; // in miles
  address?: string;
  placeId?: string;
}

interface InfrastructureData {
  nearestFireStation: NearbyService & { isoClass?: number };
  nearestPolice: NearbyService;
  nearestHospital: NearbyService;
  nearestSchool: NearbyService;
  nearestGrocery: NearbyService;
  source: string;
}

// Calculate distance in miles between two lat/lng points
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

// Estimate ISO fire class based on distance (simplified)
function estimateIsoClass(distanceMiles: number): number {
  if (distanceMiles <= 1) return 3;
  if (distanceMiles <= 2) return 4;
  if (distanceMiles <= 3) return 5;
  if (distanceMiles <= 4) return 6;
  if (distanceMiles <= 5) return 7;
  if (distanceMiles <= 6) return 8;
  return 9;
}

async function findNearbyPlace(
  lat: number, 
  lng: number, 
  type: string, 
  apiKey: string
): Promise<NearbyService | null> {
  try {
    const radius = 16093; // 10 miles in meters
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Places API error for ${type}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      console.log(`No ${type} found nearby`);
      return null;
    }
    
    // Get the closest one
    const place = data.results[0];
    const placeLat = place.geometry.location.lat;
    const placeLng = place.geometry.location.lng;
    const distance = calculateDistance(lat, lng, placeLat, placeLng);
    
    return {
      name: place.name,
      distance,
      address: place.vicinity,
      placeId: place.place_id,
    };
  } catch (error) {
    console.error(`Error finding ${type}:`, error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng } = await req.json();
    
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Google Places infrastructure lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify(getDefaultInfrastructureData("API key not configured")),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query all place types in parallel
    console.log('Querying Google Places API for nearby services...');
    
    const [fireStation, police, hospital, school, grocery] = await Promise.all([
      findNearbyPlace(lat, lng, 'fire_station', apiKey),
      findNearbyPlace(lat, lng, 'police', apiKey),
      findNearbyPlace(lat, lng, 'hospital', apiKey),
      findNearbyPlace(lat, lng, 'school', apiKey),
      findNearbyPlace(lat, lng, 'supermarket', apiKey),
    ]);

    const result: InfrastructureData = {
      nearestFireStation: fireStation 
        ? { ...fireStation, isoClass: estimateIsoClass(fireStation.distance) }
        : { name: "Not found within 10 miles", distance: 10, isoClass: 10 },
      nearestPolice: police 
        ? police 
        : { name: "Not found within 10 miles", distance: 10 },
      nearestHospital: hospital 
        ? hospital 
        : { name: "Not found within 10 miles", distance: 10 },
      nearestSchool: school 
        ? school 
        : { name: "Not found within 10 miles", distance: 10 },
      nearestGrocery: grocery 
        ? grocery 
        : { name: "Not found within 10 miles", distance: 10 },
      source: "Google Places API",
    };

    console.log(`Infrastructure lookup complete: Fire ${result.nearestFireStation.distance} mi, Hospital ${result.nearestHospital.distance} mi`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Google Places API error:', error);
    return new Response(
      JSON.stringify(getDefaultInfrastructureData(errorMessage)),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultInfrastructureData(reason: string): InfrastructureData {
  console.log(`Returning default infrastructure data: ${reason}`);
  return {
    nearestFireStation: { name: "Data unavailable", distance: 0, isoClass: 0 },
    nearestPolice: { name: "Data unavailable", distance: 0 },
    nearestHospital: { name: "Data unavailable", distance: 0 },
    nearestSchool: { name: "Data unavailable", distance: 0 },
    nearestGrocery: { name: "Data unavailable", distance: 0 },
    source: `Unavailable - ${reason}`,
  };
}
