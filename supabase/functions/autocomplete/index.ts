import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation
function validateQuery(query: unknown): { valid: boolean; value: string; error?: string } {
  if (query === undefined || query === null || query === '') {
    return { valid: false, value: "", error: "Query is required" };
  }
  if (typeof query !== 'string') {
    return { valid: false, value: "", error: "Query must be a string" };
  }
  const trimmed = query.trim();
  if (trimmed.length < 3) {
    return { valid: false, value: "", error: "" };
  }
  if (trimmed.length > 200) {
    return { valid: false, value: "", error: "Query must not exceed 200 characters" };
  }
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, value: "", error: "Invalid characters in query" };
  }
  return { valid: true, value: trimmed };
}

// Google Places Autocomplete
async function autocompleteWithGoogle(query: string, apiKey: string) {
  // Use Places Autocomplete API - bias towards New Mexico
  const params = new URLSearchParams({
    input: query,
    key: apiKey,
    components: 'country:us',
    locationbias: 'rectangle:31.3,-109.5|37.0,-103.0', // New Mexico bounding box
    types: 'address',
  });
  
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;
  const response = await fetch(url);
  const data = await response.json();
  
  console.log(`Google Places status: ${data.status}, predictions: ${data.predictions?.length || 0}`);
  
  if (data.status === 'OK' && data.predictions) {
    return data.predictions.map((p: any) => ({
      displayName: p.description,
      placeId: p.place_id,
      mainText: p.structured_formatting?.main_text || '',
      secondaryText: p.structured_formatting?.secondary_text || '',
      types: p.types || [],
    }));
  }
  
  if (data.status === 'ZERO_RESULTS') {
    return [];
  }
  
  throw new Error(`Google Places error: ${data.status} - ${data.error_message || 'Unknown'}`);
}

// Nominatim fallback
async function autocompleteWithNominatim(query: string) {
  const encodedQuery = encodeURIComponent(`${query}, New Mexico, USA`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1&countrycodes=us`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RioGrandeDueDiligence/1.0' }
  });
  
  const data = await response.json();
  console.log(`Nominatim returned ${data.length} suggestions`);

  return data.map((item: any) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
    type: item.type,
    importance: item.importance
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const queryResult = validateQuery(body.query);
    if (!queryResult.valid) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const query = queryResult.value;
    console.log(`Autocomplete query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    let suggestions = [];

    // Try Google Places first
    if (apiKey) {
      try {
        suggestions = await autocompleteWithGoogle(query, apiKey);
        console.log('Google Places autocomplete succeeded');
      } catch (googleError) {
        console.warn(`Google Places failed, using Nominatim fallback: ${googleError}`);
        suggestions = await autocompleteWithNominatim(query);
      }
    } else {
      console.log('No Google API key, using Nominatim');
      suggestions = await autocompleteWithNominatim(query);
    }

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Autocomplete error:', error);
    return new Response(
      JSON.stringify({ suggestions: [], error: 'Autocomplete failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
