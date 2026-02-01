import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricPlace {
  name: string;
  refNumber: string;
  address: string;
  city: string;
  dateAdded: string;
  resourceType: string;
  distance: number;
}

interface TribalLand {
  name: string;
  type: string; // Pueblo, Reservation, etc.
  distance: number;
  landAreaName: string;
}

interface CulturalResourcesResult {
  // Tribal Lands Analysis
  nearestTribalLand: TribalLand | null;
  tribalLandsWithin5Miles: TribalLand[];
  onTribalLand: boolean;
  tribalConsultationRequired: boolean;
  tribalConsultationReason: string;
  
  // Historic Places Analysis
  nrhpPropertiesWithin1Mile: HistoricPlace[];
  nearestNRHPProperty: HistoricPlace | null;
  inHistoricDistrict: boolean;
  historicDistrictName: string | null;
  
  // Overall Assessment
  riskLevel: "high" | "moderate" | "low";
  section106Required: boolean;
  recommendedActions: string[];
  
  source: string;
  queryDate: string;
}

// Calculate distance between two points in miles
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100;
}

async function queryTribalLands(lat: number, lng: number): Promise<{ nearest: TribalLand | null; within5Miles: TribalLand[]; onTribalLand: boolean }> {
  // Try Census TIGER API first (more reliable), then fall back to BIA
  const sources = [
    {
      name: "Census TIGER",
      baseUrl: "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2023/MapServer/36/query",
      nameField: "NAME",
      idField: "GEOID"
    },
    {
      name: "BIA National LAR",
      baseUrl: "https://biamaps.geoplatform.gov/server/rest/services/DivLTR/BIA_AIAN_National_LAR/MapServer/0/query",
      nameField: "LARName",
      idField: "LARID"
    }
  ];

  let onTribalLand = false;
  let containingLandName = "";
  const tribalLands: TribalLand[] = [];

  for (const source of sources) {
    try {
      console.log(`Trying ${source.name} for tribal land query...`);
      
      // First check if point is WITHIN any tribal land
      const containsParams = new URLSearchParams({
        f: "json",
        geometry: `${lng},${lat}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelWithin",
        outFields: source.nameField,
        returnGeometry: "false"
      });

      const containsResponse = await fetch(`${source.baseUrl}?${containsParams}`);
      
      if (containsResponse.ok) {
        const containsText = await containsResponse.text();
        if (!containsText.includes("error") && !containsText.trim().startsWith('<')) {
          try {
            const containsData = JSON.parse(containsText);
            if (containsData.features && containsData.features.length > 0) {
              onTribalLand = true;
              containingLandName = containsData.features[0].attributes[source.nameField] || "Tribal Land";
              console.log(`Property is WITHIN tribal land: ${containingLandName}`);
            }
          } catch { console.log("Could not parse contains response"); }
        }
      }

      // Query nearby tribal lands (10 mile buffer for better coverage)
      const bufferParams = new URLSearchParams({
        f: "json",
        geometry: `${lng},${lat}`,
        geometryType: "esriGeometryPoint",
        inSR: "4326",
        spatialRel: "esriSpatialRelIntersects",
        distance: "16093", // ~10 miles in meters
        units: "esriSRUnit_Meter",
        outFields: source.nameField,
        returnGeometry: "true",
        outSR: "4326"
      });

      console.log(`Querying nearby tribal lands from ${source.name}...`);
      const response = await fetch(`${source.baseUrl}?${bufferParams}`);
      
      if (!response.ok) {
        console.error(`${source.name} API returned error:`, response.status);
        continue;
      }

      const text = await response.text();
      if (text.includes("error") || text.trim().startsWith('<')) {
        console.error(`${source.name} API returned error response`);
        continue;
      }

      const data = JSON.parse(text);
      
      if (data.features && data.features.length > 0) {
        console.log(`Found ${data.features.length} tribal lands from ${source.name}`);
        
        for (const feature of data.features) {
          const attrs = feature.attributes;
          const name = attrs[source.nameField] || "Unknown";
          
          // Calculate distance to nearest point of the geometry
          let minDistance = Infinity;
          if (feature.geometry?.rings) {
            for (const ring of feature.geometry.rings) {
              for (const coord of ring) {
                const dist = calculateDistance(lat, lng, coord[1], coord[0]);
                if (dist < minDistance) minDistance = dist;
              }
            }
          } else if (feature.geometry?.x !== undefined && feature.geometry?.y !== undefined) {
            minDistance = calculateDistance(lat, lng, feature.geometry.y, feature.geometry.x);
          }

          // Determine type based on name
          let type = "Tribal Land";
          const nameLower = name.toLowerCase();
          if (nameLower.includes("pueblo")) type = "Pueblo";
          else if (nameLower.includes("reservation")) type = "Reservation";
          else if (nameLower.includes("navajo")) type = "Navajo Nation";
          else if (nameLower.includes("apache")) type = "Apache";
          else if (nameLower.includes("ute")) type = "Ute";

          // Avoid duplicates
          if (!tribalLands.find(t => t.name === name)) {
            tribalLands.push({
              name,
              type,
              distance: onTribalLand && name === containingLandName ? 0 : minDistance,
              landAreaName: name
            });
          }
        }
        
        // If we got good data, don't try other sources
        if (tribalLands.length > 0) break;
      }

    } catch (error) {
      console.error(`${source.name} query error:`, error);
      continue;
    }
  }

  // Sort by distance
  tribalLands.sort((a, b) => a.distance - b.distance);

  return {
    nearest: tribalLands.length > 0 ? tribalLands[0] : null,
    within5Miles: tribalLands.filter(t => t.distance <= 5),
    onTribalLand
  };
}

async function queryNRHPProperties(lat: number, lng: number): Promise<{ properties: HistoricPlace[]; inDistrict: boolean; districtName: string | null }> {
  try {
    // Query National Register of Historic Places from NPS ArcGIS service
    const baseUrl = "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/National_Register_of_Historic_Places_Boundaries/FeatureServer/0/query";
    
    // First check if point is within a historic district
    const districtParams = new URLSearchParams({
      f: "json",
      geometry: `${lng},${lat}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelWithin",
      outFields: "ResourceName,RefNum,Address,City,DateAdded,ResourceType",
      returnGeometry: "false"
    });

    let inDistrict = false;
    let districtName: string | null = null;

    console.log("Checking if point is within NRHP district...");
    const districtResponse = await fetch(`${baseUrl}?${districtParams}`);
    
    if (districtResponse.ok) {
      const districtText = await districtResponse.text();
      if (!districtText.trim().startsWith('<')) {
        try {
          const districtData = JSON.parse(districtText);
          if (districtData.features && districtData.features.length > 0) {
            const feature = districtData.features[0].attributes;
            if (feature.ResourceType?.toLowerCase().includes("district")) {
              inDistrict = true;
              districtName = feature.ResourceName;
              console.log(`Property is within historic district: ${districtName}`);
            }
          }
        } catch { console.log("Could not parse district response"); }
      }
    }

    // Query nearby NRHP properties (1 mile radius)
    const nearbyParams = new URLSearchParams({
      f: "json",
      geometry: `${lng},${lat}`,
      geometryType: "esriGeometryPoint",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      distance: "1609", // 1 mile in meters
      units: "esriSRUnit_Meter",
      outFields: "ResourceName,RefNum,Address,City,DateAdded,ResourceType",
      returnGeometry: "true",
      outSR: "4326"
    });

    console.log("Querying NRHP properties within 1 mile...");
    const response = await fetch(`${baseUrl}?${nearbyParams}`);
    
    if (!response.ok) {
      console.error("NRHP API returned error:", response.status);
      return { properties: [], inDistrict, districtName };
    }

    const text = await response.text();
    if (text.trim().startsWith('<')) {
      console.error("NRHP API returned HTML");
      return { properties: [], inDistrict, districtName };
    }

    const data = JSON.parse(text);
    const properties: HistoricPlace[] = [];

    if (data.features && data.features.length > 0) {
      for (const feature of data.features) {
        const attrs = feature.attributes;
        
        // Calculate distance to centroid or nearest point
        let distance = 1;
        if (feature.geometry) {
          if (feature.geometry.x !== undefined && feature.geometry.y !== undefined) {
            distance = calculateDistance(lat, lng, feature.geometry.y, feature.geometry.x);
          } else if (feature.geometry.rings) {
            // For polygons, find nearest point
            let minDist = Infinity;
            for (const ring of feature.geometry.rings) {
              for (const coord of ring) {
                const d = calculateDistance(lat, lng, coord[1], coord[0]);
                if (d < minDist) minDist = d;
              }
            }
            distance = minDist;
          }
        }

        properties.push({
          name: attrs.ResourceName || "Unknown Property",
          refNumber: attrs.RefNum || "N/A",
          address: attrs.Address || "",
          city: attrs.City || "",
          dateAdded: attrs.DateAdded || "",
          resourceType: attrs.ResourceType || "Historic",
          distance: Math.round(distance * 100) / 100
        });
      }
    }

    // Sort by distance
    properties.sort((a, b) => a.distance - b.distance);

    return { properties, inDistrict, districtName };

  } catch (error) {
    console.error("NRHP query error:", error);
    return { properties: [], inDistrict: false, districtName: null };
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate coordinates
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

    console.log(`Cultural resources lookup for: ${lat}, ${lng}`);

    // Query both data sources in parallel
    const [tribalData, nrhpData] = await Promise.all([
      queryTribalLands(lat, lng),
      queryNRHPProperties(lat, lng)
    ]);

    // Determine consultation requirements
    let tribalConsultationRequired = false;
    let tribalConsultationReason = "No tribal consultation anticipated for private development";
    
    if (tribalData.onTribalLand) {
      tribalConsultationRequired = true;
      tribalConsultationReason = `Property is located on ${tribalData.nearest?.name || 'tribal'} land - formal tribal consultation required`;
    } else if (tribalData.nearest && tribalData.nearest.distance < 0.5) {
      // Flag if very close (< 0.5 mi) - more conservative than before
      tribalConsultationRequired = true;
      tribalConsultationReason = `Property is adjacent to ${tribalData.nearest.name} (${tribalData.nearest.distance.toFixed(2)} mi) - consultation recommended`;
    } else if (tribalData.nearest && tribalData.nearest.distance < 3) {
      // Proximity warning for nearby tribal lands
      tribalConsultationReason = `Nearest tribal land: ${tribalData.nearest.name} (${tribalData.nearest.distance.toFixed(1)} mi) - consultation may be needed for federal undertakings`;
    } else if (tribalData.nearest && tribalData.nearest.distance < 5) {
      tribalConsultationReason = `Nearest tribal land: ${tribalData.nearest.name} (${tribalData.nearest.distance.toFixed(1)} mi away)`;
    }

    // Determine risk level
    let riskLevel: "high" | "moderate" | "low" = "low";
    
    if (tribalData.onTribalLand || nrhpData.inDistrict) {
      riskLevel = "high";
    } else if (tribalData.nearest && tribalData.nearest.distance < 0.5) {
      // Adjacent to tribal land
      riskLevel = "moderate";
    } else if (nrhpData.properties.some(p => p.distance < 0.1)) {
      // NRHP property directly adjacent
      riskLevel = "moderate";
    } else if (tribalData.nearest && tribalData.nearest.distance < 3) {
      // Close to tribal land - worth noting
      riskLevel = "moderate";
    }

    // Section 106 only applies to federal undertakings
    const section106Required = tribalData.onTribalLand || nrhpData.inDistrict;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (tribalData.onTribalLand) {
      recommendations.push(`Initiate formal consultation with ${tribalData.nearest?.name} tribal government before any ground disturbance`);
      recommendations.push("Phase I Archaeological Survey required before development");
    } else if (tribalData.nearest && tribalData.nearest.distance < 3) {
      recommendations.push(`Property is near ${tribalData.nearest.name} (${tribalData.nearest.distance.toFixed(1)} mi) - consider contacting THPO for guidance`);
    }
    
    if (nrhpData.inDistrict) {
      recommendations.push(`Property is within ${nrhpData.districtName} Historic District - SHPO review required for exterior modifications`);
      recommendations.push("Phase I Archaeological Survey likely required");
    }
    
    if (nrhpData.properties.length > 0 && nrhpData.properties[0].distance < 0.25) {
      recommendations.push("Consider ARMS records check due to nearby historic property");
    }
    
    // Default recommendation
    if (recommendations.length === 0) {
      recommendations.push("Standard archaeological monitoring recommended during initial ground disturbance");
    }

    const result: CulturalResourcesResult = {
      nearestTribalLand: tribalData.nearest,
      tribalLandsWithin5Miles: tribalData.within5Miles,
      onTribalLand: tribalData.onTribalLand,
      tribalConsultationRequired,
      tribalConsultationReason,
      
      nrhpPropertiesWithin1Mile: nrhpData.properties.slice(0, 10),
      nearestNRHPProperty: nrhpData.properties.length > 0 ? nrhpData.properties[0] : null,
      inHistoricDistrict: nrhpData.inDistrict,
      historicDistrictName: nrhpData.districtName,
      
      riskLevel,
      section106Required,
      recommendedActions: recommendations,
      
      source: "Census TIGER AIAN, BIA National LAR, NPS NRHP",
      queryDate: new Date().toISOString().split('T')[0]
    };

    console.log(`Cultural resources assessment complete: ${riskLevel} risk, ${tribalData.within5Miles.length} tribal lands within 5mi, ${nrhpData.properties.length} NRHP properties`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Cultural resources error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        nearestTribalLand: null,
        tribalLandsWithin5Miles: [],
        onTribalLand: false,
        tribalConsultationRequired: false,
        tribalConsultationReason: "Unable to query - manual review recommended",
        nrhpPropertiesWithin1Mile: [],
        nearestNRHPProperty: null,
        inHistoricDistrict: false,
        historicDistrictName: null,
        riskLevel: "moderate",
        section106Required: true,
        recommendedActions: ["Request ARMS records check from NM HPD due to data query failure"],
        source: "Query failed - manual verification needed",
        queryDate: new Date().toISOString().split('T')[0]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
