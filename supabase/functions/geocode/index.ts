import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Try Google Maps first, then fall back to Nominatim
async function geocodeWithGoogle(address: string, apiKey: string) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  console.log(`Google Maps API status: ${data.status}`);

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    const result = data.results[0];
    const location = result.geometry.location;
    const locationType = result.geometry.location_type;
    
    let accuracy: 'exact' | 'street' | 'approximate' | 'area';
    switch (locationType) {
      case 'ROOFTOP':
        accuracy = 'exact';
        break;
      case 'RANGE_INTERPOLATED':
        accuracy = 'street';
        break;
      case 'GEOMETRIC_CENTER':
        accuracy = 'approximate';
        break;
      default:
        accuracy = 'area';
    }

    return {
      lat: location.lat,
      lng: location.lng,
      displayName: result.formatted_address,
      accuracy,
      source: 'google',
      locationType
    };
  }
  
  if (data.status === 'ZERO_RESULTS') {
    return { notFound: true };
  }
  
  // Any other status is an error - throw to trigger fallback
  throw new Error(`Google API error: ${data.status} - ${data.error_message || 'Unknown'}`);
}

async function geocodeWithNominatim(address: string) {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'RioGrandeDueDiligence/1.0'
    }
  });
  
  const data = await response.json();
  console.log(`Nominatim returned ${data.length} results`);

  if (data && data.length > 0) {
    const result = data[0];
    
    // Determine accuracy based on class/type
    let accuracy: 'exact' | 'street' | 'approximate' | 'area' = 'approximate';
    if (result.class === 'building' || result.type === 'house') {
      accuracy = 'exact';
    } else if (result.class === 'highway' || result.type === 'road') {
      accuracy = 'street';
    } else if (result.class === 'place' && ['city', 'town', 'village'].includes(result.type)) {
      accuracy = 'area';
    }

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      accuracy,
      source: 'nominatim',
      locationType: `${result.class}/${result.type}`
    };
  }
  
  return { notFound: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address } = await req.json();
    
    if (!address) {
      console.error('No address provided');
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding address: ${address}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let result = null;
    let usedFallback = false;

    // Try Google first if API key exists
    if (apiKey) {
      try {
        result = await geocodeWithGoogle(address, apiKey);
        console.log('Google geocoding succeeded');
      } catch (googleError) {
        console.warn(`Google geocoding failed, trying Nominatim fallback: ${googleError}`);
        usedFallback = true;
      }
    } else {
      console.log('No Google API key, using Nominatim');
      usedFallback = true;
    }

    // Fall back to Nominatim if Google failed or unavailable
    if (!result || usedFallback) {
      try {
        result = await geocodeWithNominatim(address);
        if (result && !('notFound' in result)) {
          console.log('Nominatim geocoding succeeded');
        }
      } catch (nominatimError) {
        console.error(`Nominatim also failed: ${nominatimError}`);
        return new Response(
          JSON.stringify({ error: 'All geocoding services failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Handle not found
    if (!result || 'notFound' in result) {
      console.log('No results found for address');
      return new Response(
        JSON.stringify({ error: 'Address not found', status: 'ZERO_RESULTS' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoded successfully: ${result.lat}, ${result.lng} (${result.accuracy}) via ${result.source}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in geocode function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
