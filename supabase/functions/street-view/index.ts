import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreetViewResponse {
  available: boolean;
  imageUrl: string | null;
  heading: number;
  pitch: number;
  fov: number;
  source: string;
  note: string;
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
    const heading = body.heading || 0; // Direction to look (0-360)
    const pitch = body.pitch || 0; // Up/down angle (-90 to 90)
    const fov = body.fov || 90; // Field of view (max 120)

    console.log(`Street View lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          available: false, 
          imageUrl: null, 
          heading: 0, 
          pitch: 0, 
          fov: 90,
          source: 'Google Street View',
          note: 'API key not configured' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // First check if Street View imagery is available at this location
    const metadataUrl = `https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`;
    
    const metadataResponse = await fetch(metadataUrl);
    const metadata = await metadataResponse.json();
    
    console.log(`Street View metadata status: ${metadata.status}`);
    
    if (metadata.status !== 'OK') {
      // No Street View coverage at this location
      return new Response(
        JSON.stringify({
          available: false,
          imageUrl: null,
          heading: 0,
          pitch: 0,
          fov: 90,
          source: 'Google Street View',
          note: 'No Street View coverage available at this location. This is common for rural and undeveloped areas.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Street View is available - generate the image URL
    const width = 640;
    const height = 400;
    
    // Use the pano_id if available for more accurate positioning
    let imageUrl: string;
    if (metadata.pano_id) {
      imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&pano=${metadata.pano_id}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;
    } else {
      imageUrl = `https://maps.googleapis.com/maps/api/streetview?size=${width}x${height}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;
    }

    // Calculate approximate distance from requested location
    let distanceNote = '';
    if (metadata.location) {
      const actualLat = metadata.location.lat;
      const actualLng = metadata.location.lng;
      const R = 3959; // Earth radius in miles
      const dLat = (actualLat - lat) * Math.PI / 180;
      const dLng = (actualLng - lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(actualLat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      if (distance > 0.1) {
        distanceNote = ` Nearest imagery is approximately ${distance.toFixed(1)} miles from the property.`;
      }
    }

    const result: StreetViewResponse = {
      available: true,
      imageUrl,
      heading: heading,
      pitch: pitch,
      fov: fov,
      source: 'Google Street View',
      note: `Street View imagery captured ${metadata.date || 'date unknown'}.${distanceNote}`,
    };

    console.log(`Street View available, date: ${metadata.date}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Street View error:', error);
    return new Response(
      JSON.stringify({ 
        available: false, 
        imageUrl: null, 
        heading: 0, 
        pitch: 0, 
        fov: 90,
        source: 'Google Street View',
        note: `Error: ${errorMessage}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
