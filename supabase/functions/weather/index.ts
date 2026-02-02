import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherData {
  currentTemp: number;
  currentCondition: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  // Climate averages (approximated from current + regional data)
  climate: {
    avgHighSummer: number;
    avgLowWinter: number;
    avgAnnualPrecipitation: string;
    avgSunnyDays: number;
    snowDays: string;
    climateZone: string;
  };
  seasonalNotes: string[];
  source: string;
}

// NM climate zones based on elevation and region
function getClimateData(lat: number, lng: number, elevation?: number): WeatherData["climate"] {
  // Simplified NM climate zones based on latitude and typical elevation
  // Northern NM (lat > 36): Higher elevation, more snow, cooler
  // Central NM (35-36): Mix, Albuquerque area
  // Southern NM (lat < 35): Desert, hot summers, mild winters
  
  if (lat > 36.5) {
    // Northern mountains (Taos, etc)
    return {
      avgHighSummer: 82,
      avgLowWinter: 12,
      avgAnnualPrecipitation: "12-18 inches",
      avgSunnyDays: 280,
      snowDays: "30-50 days",
      climateZone: "High Desert / Mountain",
    };
  } else if (lat > 35.5) {
    // North-central (Santa Fe, Española)
    return {
      avgHighSummer: 88,
      avgLowWinter: 18,
      avgAnnualPrecipitation: "10-14 inches",
      avgSunnyDays: 290,
      snowDays: "15-25 days",
      climateZone: "High Desert",
    };
  } else if (lat > 34.5) {
    // Central (Albuquerque area)
    return {
      avgHighSummer: 93,
      avgLowWinter: 24,
      avgAnnualPrecipitation: "9-11 inches",
      avgSunnyDays: 310,
      snowDays: "5-10 days",
      climateZone: "High Desert",
    };
  } else {
    // Southern (Las Cruces, etc)
    return {
      avgHighSummer: 98,
      avgLowWinter: 30,
      avgAnnualPrecipitation: "8-10 inches",
      avgSunnyDays: 320,
      snowDays: "1-3 days",
      climateZone: "Chihuahuan Desert",
    };
  }
}

function getSeasonalNotes(lat: number): string[] {
  const notes: string[] = [];
  
  if (lat > 36) {
    notes.push("Winter: Expect significant snowfall, 4WD recommended Nov-Mar");
    notes.push("Spring: Windy season (Mar-May), late frosts possible through May");
    notes.push("Summer: Monsoon season (Jul-Aug) brings afternoon thunderstorms");
    notes.push("Fall: Best weather, clear skies, cool nights");
  } else if (lat > 35) {
    notes.push("Winter: Occasional snow, usually melts within days");
    notes.push("Spring: High winds common, dust storms possible");
    notes.push("Summer: Monsoon rains Jul-Aug, temperatures peak in June");
    notes.push("Fall: Pleasant temperatures, low humidity");
  } else {
    notes.push("Winter: Mild, rarely below freezing");
    notes.push("Spring: Windy, very dry before monsoon");
    notes.push("Summer: Hot days (100°F+), monsoon brings relief Jul-Aug");
    notes.push("Fall: Warm days, cool nights, ideal outdoor season");
  }
  
  return notes;
}

// Input validation
function validateCoordinate(value: unknown, type: 'lat' | 'lng'): { valid: boolean; value: number; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} is required` };
  }
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (typeof num !== 'number' || isNaN(num)) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} must be a valid number` };
  }
  const [min, max] = type === 'lat' ? [-90, 90] : [-180, 180];
  if (num < min || num > max) {
    return { valid: false, value: 0, error: `${type === 'lat' ? 'Latitude' : 'Longitude'} must be between ${min} and ${max}` };
  }
  return { valid: true, value: num };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const latResult = validateCoordinate(body.lat, 'lat');
    if (!latResult.valid) {
      return new Response(
        JSON.stringify({ error: latResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const lngResult = validateCoordinate(body.lng, 'lng');
    if (!lngResult.valid) {
      return new Response(
        JSON.stringify({ error: lngResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const lat = latResult.value;
    const lng = lngResult.value;

    console.log(`Weather lookup for: ${lat}, ${lng}`);

    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      // Return climate data without current conditions
      const climate = getClimateData(lat, lng);
      const result: WeatherData = {
        currentTemp: 0,
        currentCondition: "Data unavailable",
        humidity: 0,
        windSpeed: 0,
        uvIndex: 0,
        climate,
        seasonalNotes: getSeasonalNotes(lat),
        source: "Regional Climate Data (NM)",
      };
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try Google Weather API for current conditions
    let currentTemp = 0;
    let currentCondition = "Clear";
    let humidity = 0;
    let windSpeed = 0;
    let uvIndex = 0;

    try {
      // Google Weather API endpoint
      const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}`;
      
      const weatherResponse = await fetch(weatherUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: { latitude: lat, longitude: lng }
        }),
      });

      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        console.log('Weather API response received');
        
        if (weatherData.temperature?.degrees) {
          // Convert Celsius to Fahrenheit if needed
          currentTemp = weatherData.temperature.degrees;
          if (weatherData.temperature.unit === "CELSIUS") {
            currentTemp = Math.round(currentTemp * 9/5 + 32);
          }
        }
        
        currentCondition = weatherData.weatherCondition?.description || 
                          weatherData.weatherCondition?.type || "Clear";
        humidity = weatherData.humidity?.percent || 0;
        windSpeed = weatherData.wind?.speed?.value || 0;
        uvIndex = weatherData.uvIndex || 0;
      } else {
        console.log(`Weather API returned ${weatherResponse.status}, using climate data only`);
      }
    } catch (weatherError) {
      console.log('Weather API error, using climate data only:', weatherError);
    }

    const climate = getClimateData(lat, lng);
    
    const result: WeatherData = {
      currentTemp,
      currentCondition,
      humidity,
      windSpeed,
      uvIndex,
      climate,
      seasonalNotes: getSeasonalNotes(lat),
      source: currentTemp > 0 ? "Google Weather API + Regional Climate Data" : "Regional Climate Data (NM)",
    };

    console.log(`Weather: ${result.currentTemp}°F, Climate zone: ${result.climate.climateZone}`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Weather API error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
