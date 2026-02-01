// Geocoding via Edge Function (supports address, legal description, and coordinates)
import { supabase } from "@/lib/supabaseClient";

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: "exact" | "street" | "approximate" | "area";
  source: "google" | "coordinates" | "fallback";
  locationType?: string;
  error?: string;
  isError?: boolean;
}

export interface PLSSResult {
  township: string;
  range: string;
  section: string;
  principalMeridian: string;
  stateCode: string;
  legalDescription: string;
  source: string;
  coordinates: { lat: number; lng: number };
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
    const { data, error } = await supabase.functions.invoke('geocode', {
      body: { address: searchQuery },
    });

    if (error) {
      console.error("Geocoding error:", error);
      return {
        lat: 35.0844,
        lng: -106.6504,
        displayName: query,
        accuracy: "area",
        source: "fallback",
        isError: true,
        error: error.message || "Geocoding service error. Please try again.",
      };
    }

    if (!data) {
      return {
        lat: 35.0844,
        lng: -106.6504,
        displayName: query,
        accuracy: "area",
        source: "fallback",
        isError: true,
        error: "Address not found. Please verify the address and try again.",
      };
    }

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

    return {
      lat: 35.0844,
      lng: -106.6504,
      displayName: query,
      accuracy: "area",
      source: "fallback",
      isError: true,
      error: "Geocoding service unavailable. Please check your connection and try again.",
    };
  }
}

export async function lookupPLSS(lat: number, lng: number): Promise<PLSSResult | null> {
  console.log(`Looking up PLSS for: ${lat}, ${lng}`);

  try {
    const { data, error } = await supabase.functions.invoke('plss-lookup', {
      body: { lat, lng },
    });

    if (error) {
      console.error("PLSS lookup error:", error);
      return null;
    }

    console.log("PLSS result:", data);
    return data as PLSSResult;
  } catch (error) {
    console.error("PLSS lookup error:", error);
    return null;
  }
}
