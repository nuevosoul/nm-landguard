import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lng, parcelGeometry, zoom = 18, width = 640, height = 400 } = await req.json();
    
    if (lat === undefined || lng === undefined) {
      return new Response(
        JSON.stringify({ error: 'Coordinates required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating static map for: ${lat}, ${lng}`);

    // Build the static map URL
    let url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&scale=2&key=${apiKey}`;
    
    // Add parcel boundary as a polygon path if available
    if (parcelGeometry && Array.isArray(parcelGeometry) && parcelGeometry.length > 0 && parcelGeometry[0].length > 0) {
      const ring = parcelGeometry[0];
      // Simplify polygon if it has too many points (Google has URL length limits)
      let simplifiedRing = ring;
      if (ring.length > 50) {
        // Take every Nth point to reduce complexity
        const step = Math.ceil(ring.length / 50);
        simplifiedRing = ring.filter((_: number[], i: number) => i % step === 0 || i === ring.length - 1);
        console.log(`Simplified polygon from ${ring.length} to ${simplifiedRing.length} points`);
      }
      
      // Google Static Maps path format: lat,lng|lat,lng|...
      const pathPoints = simplifiedRing.map((coord: number[]) => `${coord[0].toFixed(5)},${coord[1].toFixed(5)}`).join('|');
      url += `&path=color:0xFFD700FF|weight:4|fillcolor:0xFFD70040|${pathPoints}`;
      console.log(`Added parcel boundary with ${simplifiedRing.length} points`);
    } else {
      // If no parcel geometry, add a simple marker
      url += `&markers=color:blue|${lat},${lng}`;
    }

    // Check URL length (Google limit is ~8192 characters)
    if (url.length > 8000) {
      console.warn(`URL too long (${url.length} chars), using marker only`);
      url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&scale=2&key=${apiKey}&markers=color:yellow|${lat},${lng}`;
    }

    // Fetch the image from Google
    console.log(`Fetching static map image (URL length: ${url.length})...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Maps API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate map image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the image as base64 using Deno's built-in encoder (avoids stack overflow)
    const imageBuffer = await response.arrayBuffer();
    const base64Image = base64Encode(imageBuffer);
    const dataUrl = `data:image/png;base64,${base64Image}`;

    console.log(`Static map generated successfully (${Math.round(imageBuffer.byteLength / 1024)}KB)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        imageUrl: dataUrl,
        dimensions: { width: width * 2, height: height * 2 } // scale=2 doubles resolution
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Static map error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
