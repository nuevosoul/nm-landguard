import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
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

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      console.error('GOOGLE_MAPS_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Geocoding service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding address: ${address}`);

    // Call Google Maps Geocoding API
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    console.log(`Google Maps API status: ${data.status}`);

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;
      const locationType = result.geometry.location_type;
      
      // Determine accuracy based on location_type
      // ROOFTOP = exact, RANGE_INTERPOLATED = good, GEOMETRIC_CENTER = approximate, APPROXIMATE = rough
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

      console.log(`Geocoded successfully: ${location.lat}, ${location.lng} (${accuracy})`);

      return new Response(
        JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          displayName: result.formatted_address,
          accuracy,
          source: 'google',
          locationType
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (data.status === 'ZERO_RESULTS') {
      console.log('No results found for address');
      return new Response(
        JSON.stringify({ error: 'Address not found', status: 'ZERO_RESULTS' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`Google Maps API error: ${data.status}`, data.error_message);
      return new Response(
        JSON.stringify({ error: `Geocoding failed: ${data.status}`, details: data.error_message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in geocode function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
