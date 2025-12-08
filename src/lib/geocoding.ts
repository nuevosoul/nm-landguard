// Geocoding via Edge Function (supports address, legal description, and coordinates)
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: "exact" | "street" | "approximate" | "area";
  source: "google" | "coordinates" | "fallback";
  locationType?: string;
}

export type QueryType = "address" | "legal" | "coordinates";

export async function geocodeAddress(
  query: string,
  queryType: QueryType = "address"
): Promise<GeocodingResult | null> {
  console.log(`Geocoding ${queryType}:`, query);

  // Handle direct coordinates
  if (queryType === "coordinates") {
    const coords = query.split(",").map((s) => parseFloat(s.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      const [lat, lng] = coords;
      
      // Validate coordinates are in New Mexico range (roughly)
      if (lat >= 31 && lat <= 37 && lng >= -109.5 && lng <= -103) {
        return {
          lat,
          lng,
          displayName: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          accuracy: "exact",
          source: "coordinates",
        };
      } else {
        console.warn("Coordinates outside New Mexico range");
        return {
          lat,
          lng,
          displayName: `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)} (outside NM)`,
          accuracy: "approximate",
          source: "coordinates",
        };
      }
    }
  }

  // For legal descriptions, we'll add "New Mexico" context
  let searchQuery = query;
  if (queryType === "legal") {
    searchQuery = `${query}, New Mexico`;
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ address: searchQuery }),
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
          displayName: "Location not found - showing Albuquerque, NM",
          accuracy: "area",
          source: "fallback",
        };
      }

      throw new Error(errorData.error || "Geocoding failed");
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