// Enhanced geocoding with multiple fallback strategies
export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
  accuracy: "exact" | "approximate";
}

// New Mexico zip code coordinates for fallback
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

// NM city coordinates for additional fallback
const NM_CITIES: Record<string, { lat: number; lng: number }> = {
  "albuquerque": { lat: 35.0844, lng: -106.6504 },
  "santa fe": { lat: 35.6870, lng: -105.9378 },
  "las cruces": { lat: 32.3199, lng: -106.7637 },
  "rio rancho": { lat: 35.2334, lng: -106.6645 },
  "roswell": { lat: 33.3943, lng: -104.5228 },
  "farmington": { lat: 36.7281, lng: -108.2187 },
  "gallup": { lat: 35.5281, lng: -108.7426 },
  "alamogordo": { lat: 32.8995, lng: -105.9603 },
  "clovis": { lat: 34.4048, lng: -103.2052 },
  "hobbs": { lat: 32.7126, lng: -103.1360 },
  "carlsbad": { lat: 32.4207, lng: -104.2288 },
  "taos": { lat: 36.4072, lng: -105.5731 },
  "los alamos": { lat: 35.8814, lng: -106.2989 },
  "espanola": { lat: 35.9911, lng: -106.0806 },
  "ohkay owingeh": { lat: 36.0531, lng: -106.0625 },
  "san juan pueblo": { lat: 36.0531, lng: -106.0625 },
  "bernalillo": { lat: 35.3000, lng: -106.5517 },
  "corrales": { lat: 35.2378, lng: -106.6067 },
  "los lunas": { lat: 34.8064, lng: -106.7334 },
  "belen": { lat: 34.6628, lng: -106.7762 },
  "socorro": { lat: 34.0584, lng: -106.8914 },
  "truth or consequences": { lat: 33.1284, lng: -107.2528 },
  "silver city": { lat: 32.7701, lng: -108.2803 },
  "deming": { lat: 32.2687, lng: -107.7586 },
  "portales": { lat: 34.1862, lng: -103.3344 },
  "artesia": { lat: 32.8423, lng: -104.4033 },
  "lovington": { lat: 32.9440, lng: -103.3488 },
  "ruidoso": { lat: 33.3317, lng: -105.6731 },
};

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
      };
    }

    return null;
  } catch (error) {
    console.error("Nominatim search error:", error);
    return null;
  }
}

function extractZipCode(address: string): string | null {
  const zipMatch = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return zipMatch ? zipMatch[1] : null;
}

function extractCity(address: string): string | null {
  const lowerAddress = address.toLowerCase();
  
  for (const city of Object.keys(NM_CITIES)) {
    if (lowerAddress.includes(city)) {
      return city;
    }
  }
  
  return null;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // Strategy 1: Try full address with New Mexico context
  const fullAddressQuery = address.toLowerCase().includes("nm") || address.toLowerCase().includes("new mexico")
    ? address
    : `${address}, New Mexico, USA`;
  
  let result = await tryNominatimSearch(fullAddressQuery);
  if (result) return result;

  // Strategy 2: Try without street number (sometimes helps with rural addresses)
  const withoutStreetNumber = address.replace(/^\d+\s+/, "");
  result = await tryNominatimSearch(`${withoutStreetNumber}, New Mexico, USA`);
  if (result) return { ...result, accuracy: "approximate" };

  // Strategy 3: Try just city and state
  const city = extractCity(address);
  if (city) {
    result = await tryNominatimSearch(`${city}, New Mexico, USA`);
    if (result) return { ...result, accuracy: "approximate" };
  }

  // Strategy 4: Use zip code lookup
  const zipCode = extractZipCode(address);
  if (zipCode && NM_ZIP_CODES[zipCode]) {
    const zipData = NM_ZIP_CODES[zipCode];
    return {
      lat: zipData.lat,
      lng: zipData.lng,
      displayName: `${zipData.city}, NM ${zipCode}`,
      accuracy: "approximate",
    };
  }

  // Strategy 5: Use city lookup from our database
  if (city && NM_CITIES[city]) {
    const cityData = NM_CITIES[city];
    return {
      lat: cityData.lat,
      lng: cityData.lng,
      displayName: `${city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}, New Mexico`,
      accuracy: "approximate",
    };
  }

  // Final fallback: Albuquerque (central NM)
  console.warn("Could not geocode address, using Albuquerque as fallback:", address);
  return {
    lat: 35.0844,
    lng: -106.6504,
    displayName: "Albuquerque, New Mexico (approximate)",
    accuracy: "approximate",
  };
}
