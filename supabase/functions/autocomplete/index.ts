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
    // Return empty suggestions instead of error for short queries
    return { valid: false, value: "", error: "" };
  }
  if (trimmed.length > 200) {
    return { valid: false, value: "", error: "Query must not exceed 200 characters" };
  }
  // Basic sanitization - prevent script injection
  if (/<script|javascript:|data:/i.test(trimmed)) {
    return { valid: false, value: "", error: "Invalid characters in query" };
  }
  return { valid: true, value: trimmed };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate query input
    const queryResult = validateQuery(body.query);
    if (!queryResult.valid) {
      // Return empty suggestions for validation errors (don't expose error details for security)
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const query = queryResult.value;
    console.log(`Autocomplete query: ${query.substring(0, 50)}${query.length > 50 ? '...' : ''}`);

    // Use Nominatim for autocomplete - focus on New Mexico
    const encodedQuery = encodeURIComponent(`${query}, New Mexico, USA`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=5&addressdetails=1&countrycodes=us`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RioGrandeDueDiligence/1.0'
      }
    });
    
    const data = await response.json();
    console.log(`Nominatim returned ${data.length} suggestions`);

    const suggestions = data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));

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
