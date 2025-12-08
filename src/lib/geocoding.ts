// Free geocoding using OpenStreetMap Nominatim
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Add "New Mexico" context if not present
    const searchAddress = address.toLowerCase().includes("nm") || address.toLowerCase().includes("new mexico")
      ? address
      : `${address}, New Mexico, USA`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
      {
        headers: {
          "User-Agent": "RioGrandeDueDiligence/1.0",
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
