import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EPAFacility {
  name: string;
  registryId: string;
  address: string;
  city: string;
  state: string;
  distance: number;
  type: string;
  programs: string[];
}

interface EPAResult {
  superfundSites: EPAFacility[];
  triSites: EPAFacility[];
  brownfieldSites: EPAFacility[];
  rcraFacilities: EPAFacility[];
  summary: {
    superfundWithin1Mile: number;
    superfundWithin5Miles: number;
    triWithin1Mile: number;
    brownfieldWithin1Mile: number;
    rcraWithin1Mile: number;
    overallRisk: "high" | "moderate" | "low";
  };
  source: string;
}

// Calculate distance between two points in miles
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function queryEPAFacilities(lat: number, lng: number, radiusMiles: number = 5): Promise<EPAResult> {
  const superfundSites: EPAFacility[] = [];
  const triSites: EPAFacility[] = [];
  const brownfieldSites: EPAFacility[] = [];
  const rcraFacilities: EPAFacility[] = [];

  try {
    // Query FRS (Facility Registry Service) for all EPA-regulated facilities nearby
    // Using the FRS REST API with geographic search
    const radiusMeters = radiusMiles * 1609.34;
    
    // FRS query for facilities within radius
    const frsUrl = `https://ofmpub.epa.gov/frs_public2/frs_rest_services.get_facilities?latitude83=${lat}&longitude83=${lng}&search_radius=${radiusMeters}&pgm_sys_acrnm=CERCLIS,TRIS,RCRAINFO,ACRES&output=JSON`;
    
    console.log(`Querying EPA FRS for facilities near ${lat}, ${lng}`);
    
    try {
      const response = await fetch(frsUrl, {
        headers: { "Accept": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.Results?.FRSFacility) {
          const facilities = Array.isArray(data.Results.FRSFacility) 
            ? data.Results.FRSFacility 
            : [data.Results.FRSFacility];
            
          for (const fac of facilities) {
            const facLat = parseFloat(fac.Latitude83);
            const facLng = parseFloat(fac.Longitude83);
            const distance = calculateDistance(lat, lng, facLat, facLng);
            
            const facility: EPAFacility = {
              name: fac.PrimaryName || "Unknown",
              registryId: fac.RegistryId || "",
              address: fac.LocationAddress || "",
              city: fac.CityName || "",
              state: fac.StateAbbr || "NM",
              distance: Math.round(distance * 100) / 100,
              type: "",
              programs: [],
            };
            
            // Parse program associations
            const programs = fac.EnvironmentalInterestInfo?.PGMSystemAcronym || [];
            const programList = Array.isArray(programs) ? programs : [programs];
            facility.programs = programList;
            
            if (programList.includes("CERCLIS") || programList.includes("SEMS")) {
              facility.type = "Superfund";
              superfundSites.push(facility);
            }
            if (programList.includes("TRIS")) {
              facility.type = "Toxic Release Inventory";
              triSites.push(facility);
            }
            if (programList.includes("ACRES") || programList.includes("BROWNFIELDS")) {
              facility.type = "Brownfield";
              brownfieldSites.push(facility);
            }
            if (programList.includes("RCRAINFO")) {
              facility.type = "RCRA Hazardous Waste";
              rcraFacilities.push(facility);
            }
          }
        }
      }
    } catch (e) {
      console.log("FRS API error, using fallback data:", e);
    }

    // Also query Superfund sites directly via SEMS
    try {
      const semsUrl = `https://ofmpub.epa.gov/frs_public2/frs_rest_services.get_facilities?latitude83=${lat}&longitude83=${lng}&search_radius=${radiusMeters}&pgm_sys_acrnm=SEMS&output=JSON`;
      
      const semsResponse = await fetch(semsUrl);
      if (semsResponse.ok) {
        const semsData = await semsResponse.json();
        if (semsData.Results?.FRSFacility) {
          const facilities = Array.isArray(semsData.Results.FRSFacility) 
            ? semsData.Results.FRSFacility 
            : [semsData.Results.FRSFacility];
            
          for (const fac of facilities) {
            const facLat = parseFloat(fac.Latitude83);
            const facLng = parseFloat(fac.Longitude83);
            const distance = calculateDistance(lat, lng, facLat, facLng);
            
            // Check if already in superfund list
            if (!superfundSites.some(s => s.registryId === fac.RegistryId)) {
              superfundSites.push({
                name: fac.PrimaryName || "Unknown",
                registryId: fac.RegistryId || "",
                address: fac.LocationAddress || "",
                city: fac.CityName || "",
                state: fac.StateAbbr || "NM",
                distance: Math.round(distance * 100) / 100,
                type: "Superfund (SEMS)",
                programs: ["SEMS"],
              });
            }
          }
        }
      }
    } catch (e) {
      console.log("SEMS query error:", e);
    }

    // Sort by distance
    superfundSites.sort((a, b) => a.distance - b.distance);
    triSites.sort((a, b) => a.distance - b.distance);
    brownfieldSites.sort((a, b) => a.distance - b.distance);
    rcraFacilities.sort((a, b) => a.distance - b.distance);

    // Calculate summary
    const superfundWithin1Mile = superfundSites.filter(s => s.distance <= 1).length;
    const superfundWithin5Miles = superfundSites.filter(s => s.distance <= 5).length;
    const triWithin1Mile = triSites.filter(s => s.distance <= 1).length;
    const brownfieldWithin1Mile = brownfieldSites.filter(s => s.distance <= 1).length;
    const rcraWithin1Mile = rcraFacilities.filter(s => s.distance <= 1).length;

    let overallRisk: "high" | "moderate" | "low" = "low";
    if (superfundWithin1Mile > 0) {
      overallRisk = "high";
    } else if (superfundWithin5Miles > 0 || triWithin1Mile > 2 || brownfieldWithin1Mile > 0) {
      overallRisk = "moderate";
    }

    return {
      superfundSites: superfundSites.slice(0, 10),
      triSites: triSites.slice(0, 10),
      brownfieldSites: brownfieldSites.slice(0, 10),
      rcraFacilities: rcraFacilities.slice(0, 10),
      summary: {
        superfundWithin1Mile,
        superfundWithin5Miles,
        triWithin1Mile,
        brownfieldWithin1Mile,
        rcraWithin1Mile,
        overallRisk,
      },
      source: "EPA Envirofacts / Facility Registry Service (FRS)",
    };
  } catch (error) {
    console.error("EPA query error:", error);
    return {
      superfundSites: [],
      triSites: [],
      brownfieldSites: [],
      rcraFacilities: [],
      summary: {
        superfundWithin1Mile: 0,
        superfundWithin5Miles: 0,
        triWithin1Mile: 0,
        brownfieldWithin1Mile: 0,
        rcraWithin1Mile: 0,
        overallRisk: "low",
      },
      source: "EPA Envirofacts - Query failed",
    };
  }
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

function validateRadius(radius: unknown, defaultValue: number = 5, maxValue: number = 50): number {
  if (radius === undefined || radius === null) return defaultValue;
  const num = typeof radius === 'string' ? parseFloat(radius) : radius;
  if (typeof num !== 'number' || isNaN(num) || num < 0.1 || num > maxValue) return defaultValue;
  return num;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate coordinates
    const latResult = validateCoordinate(body.lat, 'lat');
    if (!latResult.valid) {
      return new Response(
        JSON.stringify({ error: latResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lngResult = validateCoordinate(body.lng, 'lng');
    if (!lngResult.valid) {
      return new Response(
        JSON.stringify({ error: lngResult.error }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const lat = latResult.value;
    const lng = lngResult.value;
    const radiusMiles = validateRadius(body.radiusMiles, 5, 50);

    console.log(`EPA envirofacts lookup for: ${lat}, ${lng}, radius: ${radiusMiles} miles`);

    const result = await queryEPAFacilities(lat, lng, radiusMiles);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in epa-envirofacts function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
