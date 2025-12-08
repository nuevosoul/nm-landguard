// Google Maps Geocoding via Edge Function
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: "exact" | "street" | "approximate" | "area";
  source: "google" | "fallback";
  locationType?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  console.log("Geocoding address via Google Maps:", address);

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ address }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Geocoding error:", response.status, errorData);
      
      if (response.status === 404) {
        // Address not found - return fallback
        console.warn("Address not found, using fallback");
        return {
          lat: 35.0844,
          lng: -106.6504,
          displayName: "Address not found - showing Albuquerque, NM",
          accuracy: "area",
          source: "fallback",
        };
      }
      
      throw new Error(errorData.error || 'Geocoding failed');
    }

    const data = await response.json();
    
    return {
      lat: data.lat,
      lng: data.lng,
      displayName: data.displayName,
      accuracy: data.accuracy,
      source: data.source,
      locationType: data.locationType,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    
    // Fallback to Albuquerque center
    return {
      lat: 35.0844,
      lng: -106.6504,
      displayName: "Geocoding service unavailable - showing Albuquerque, NM",
      accuracy: "area",
      source: "fallback",
    };
  }
}
