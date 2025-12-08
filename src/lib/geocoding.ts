// Enhanced geocoding with US Census Bureau (primary) + Nominatim (fallback)
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: "exact" | "approximate";
  source: "census" | "nominatim" | "fallback";
}

// US Census Bureau Geocoder - most accurate for US addresses
async function tryCensusGeocoder(address: string): Promise<GeocodingResult | null> {
  try {
    // Census geocoder requires specific format
    const response = await fetch(
      `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodeURIComponent(address)}&benchmark=Public_AR_Current&format=json`
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    if (data.result?.addressMatches && data.result.addressMatches.length > 0) {
      const match = data.result.addressMatches[0];
      return {
        lat: match.coordinates.y,
        lng: match.coordinates.x,
        displayName: match.matchedAddress,
        accuracy: "exact",
        source: "census",
      };
    }

    return null;
  } catch (error) {
    console.error("Census geocoder error:", error);
    return null;
  }
}

// Nominatim as secondary geocoder
async function tryNominatimSearch(query: string): Promise<GeocodingResult | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=us`,
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
        accuracy: "exact",
        source: "nominatim",
      };
    }

    return null;
  } catch (error) {
    console.error("Nominatim search error:", error);
    return null;
  }
}

// New Mexico zip code coordinates for last-resort fallback
const NM_ZIP_CODES: Record<string, { lat: number; lng: number; city: string }> = {
  "87566": { lat: 36.0531, lng: -106.0625, city: "Ohkay Owingeh" },
  "87501": { lat: 35.6870, lng: -105.9378, city: "Santa Fe" },
  "87102": { lat: 35.0844, lng: -106.6504, city: "Albuquerque" },
  "87104": { lat: 35.0960, lng: -106.6702, city: "Albuquerque" },
  "87106": { lat: 35.0753, lng: -106.6195, city: "Albuquerque" },
  "87107": { lat: 35.1281, lng: -106.6480, city: "Albuquerque" },
  "87108": { lat: 35.0631, lng: -106.5811, city: "Albuquerque" },
  "87109": { lat: 35.1543, lng: -106.5881, city: "Albuquerque" },
  "87110": { lat: 35.1100, lng: -106.5700, city: "Albuquerque" },
  "87111": { lat: 35.1281, lng: -106.5227, city: "Albuquerque" },
  "87112": { lat: 35.1016, lng: -106.5227, city: "Albuquerque" },
  "87113": { lat: 35.1681, lng: -106.5681, city: "Albuquerque" },
  "87114": { lat: 35.1893, lng: -106.6702, city: "Albuquerque" },
  "87120": { lat: 35.1381, lng: -106.7102, city: "Albuquerque" },
  "87121": { lat: 35.0444, lng: -106.7502, city: "Albuquerque" },
  "87122": { lat: 35.1781, lng: -106.5081, city: "Albuquerque" },
  "87123": { lat: 35.0631, lng: -106.5011, city: "Albuquerque" },
  "87124": { lat: 35.2767, lng: -106.6893, city: "Rio Rancho" },
  "87301": { lat: 35.5281, lng: -108.7426, city: "Gallup" },
  "87401": { lat: 36.7281, lng: -108.2187, city: "Farmington" },
  "88001": { lat: 32.3199, lng: -106.7637, city: "Las Cruces" },
  "88005": { lat: 32.2767, lng: -106.7837, city: "Las Cruces" },
  "88011": { lat: 32.3567, lng: -106.6637, city: "Las Cruces" },
  "88201": { lat: 33.3943, lng: -104.5228, city: "Roswell" },
  "88310": { lat: 32.8995, lng: -105.9603, city: "Alamogordo" },
};

function extractZipCode(address: string): string | null {
  const zipMatch = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[1] : null;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  console.log("Geocoding address:", address);

  // Strategy 1: US Census Bureau Geocoder (most accurate for US)
  let result = await tryCensusGeocoder(address);
  if (result) {
    console.log("Census geocoder success:", result);
    return result;
  }

  // Strategy 2: Try Census with "NM" expanded to "New Mexico"
  const expandedAddress = address.replace(/,?\s*NM\s*/i, ", New Mexico ");
  if (expandedAddress !== address) {
    result = await tryCensusGeocoder(expandedAddress);
    if (result) {
      console.log("Census geocoder success (expanded):", result);
      return result;
    }
  }

  // Strategy 3: Nominatim with full address
  const nominatimQuery = address.toLowerCase().includes("nm") || address.toLowerCase().includes("new mexico")
    ? address
    : `${address}, New Mexico, USA`;
  
  result = await tryNominatimSearch(nominatimQuery);
  if (result) {
    console.log("Nominatim success:", result);
    return result;
  }

  // Strategy 4: Zip code fallback
  const zipCode = extractZipCode(address);
  if (zipCode && NM_ZIP_CODES[zipCode]) {
    const zipData = NM_ZIP_CODES[zipCode];
    console.log("Using zip code fallback:", zipCode);
    return {
      lat: zipData.lat,
      lng: zipData.lng,
      displayName: `${zipData.city}, NM ${zipCode} (zip code area)`,
      accuracy: "approximate",
      source: "fallback",
    };
  }

  // Final fallback
  console.warn("All geocoding strategies failed for:", address);
  return {
    lat: 35.0844,
    lng: -106.6504,
    displayName: "Location could not be verified - showing Albuquerque, NM",
    accuracy: "approximate",
    source: "fallback",
  };
}
