import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NearbyService {
  name: string;
  distance: number; // in miles (straight-line)
  driveTime?: number; // in minutes
  driveDistance?: number; // in miles (road distance)
  address?: string;
  placeId?: string;
  lat?: number;
  lng?: number;
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

// Get drive times for multiple destinations using Distance Matrix API
async function getDriveTimes(
  originLat: number,
  originLng: number,
  destinations: { lat: number; lng: number; key: string }[],
  apiKey: string
): Promise<Map<string, { driveTime: number; driveDistance: number }>> {
  const results = new Map<string, { driveTime: number; driveDistance: number }>();
  
  if (destinations.length === 0) return results;
  
  try {
    const origin = `${originLat},${originLng}`;
    const destStr = destinations.map(d => `${d.lat},${d.lng}`).join('|');
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destStr}&units=imperial&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Distance Matrix API error: ${response.status}`);
      return results;
    }
    
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.rows || !data.rows[0]?.elements) {
      console.log('Distance Matrix returned no results');
      return results;
    }
    
    const elements = data.rows[0].elements;
    destinations.forEach((dest, idx) => {
      const element = elements[idx];
      if (element.status === 'OK') {
        results.set(dest.key, {
          driveTime: Math.round(element.duration.value / 60), // seconds to minutes
          driveDistance: Math.round(element.distance.value / 1609.34 * 10) / 10, // meters to miles
        });
      }
    });
    
    console.log(`Distance Matrix returned ${results.size} drive times`);
  } catch (error) {
    console.error('Distance Matrix API error:', error);
  }
  
  return results;
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
      lat: placeLat,
      lng: placeLng,
    };
  } catch (error) {
    console.error(`Error finding ${type}:`, error);
    return null;
  }
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

    // Build list of destinations for Distance Matrix API
    const destinations: { lat: number; lng: number; key: string }[] = [];
    if (fireStation?.lat && fireStation?.lng) destinations.push({ lat: fireStation.lat, lng: fireStation.lng, key: 'fire' });
    if (police?.lat && police?.lng) destinations.push({ lat: police.lat, lng: police.lng, key: 'police' });
    if (hospital?.lat && hospital?.lng) destinations.push({ lat: hospital.lat, lng: hospital.lng, key: 'hospital' });
    if (school?.lat && school?.lng) destinations.push({ lat: school.lat, lng: school.lng, key: 'school' });
    if (grocery?.lat && grocery?.lng) destinations.push({ lat: grocery.lat, lng: grocery.lng, key: 'grocery' });

    // Get drive times for all destinations in a single API call
    const driveTimes = await getDriveTimes(lat, lng, destinations, apiKey);

    // Merge drive times into results
    const addDriveTime = (service: NearbyService | null, key: string): NearbyService => {
      if (!service) return { name: "Not found within 10 miles", distance: 10 };
      const dt = driveTimes.get(key);
      if (dt) {
        return { ...service, driveTime: dt.driveTime, driveDistance: dt.driveDistance };
      }
      return service;
    };

    const result: InfrastructureData = {
      nearestFireStation: fireStation 
        ? { ...addDriveTime(fireStation, 'fire'), isoClass: estimateIsoClass(fireStation.distance) }
        : { name: "Not found within 10 miles", distance: 10, isoClass: 10 },
      nearestPolice: addDriveTime(police, 'police'),
      nearestHospital: addDriveTime(hospital, 'hospital'),
      nearestSchool: addDriveTime(school, 'school'),
      nearestGrocery: addDriveTime(grocery, 'grocery'),
      source: "Google Places API + Distance Matrix",
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
