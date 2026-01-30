/**
 * Location-Aware Regulatory Contacts for New Mexico
 * 
 * Returns appropriate agency contacts based on property location (county/city).
 * Used in report generation to provide relevant permitting contacts.
 */

export interface RegulatoryContact {
  agency: string;
  phone: string;
  email?: string;
  website?: string;
  purpose: string;
  jurisdiction: "federal" | "state" | "county" | "city" | "tribal" | "special_district";
  category: "cultural" | "water" | "environmental" | "planning" | "fire" | "utilities" | "general";
}

// ============================================================================
// STATEWIDE CONTACTS (Always included)
// ============================================================================

export const STATEWIDE_CONTACTS: RegulatoryContact[] = [
  // Cultural Resources
  {
    agency: "NM State Historic Preservation Office (SHPO)",
    phone: "(505) 827-6320",
    email: "nm.shpo@dca.nm.gov",
    website: "https://www.nmhistoricpreservation.org/",
    purpose: "Cultural resource surveys, NMCRIS, Section 106 compliance",
    jurisdiction: "state",
    category: "cultural",
  },
  {
    agency: "NM Office of Archaeological Studies (OAS)",
    phone: "(505) 827-6343",
    email: "oas@dca.nm.gov",
    website: "https://www.nmarchaeology.org/",
    purpose: "Archaeological surveys and excavations",
    jurisdiction: "state",
    category: "cultural",
  },
  
  // Water
  {
    agency: "NM Office of the State Engineer (OSE)",
    phone: "(505) 827-6120",
    email: "ose.webmaster@ose.nm.gov",
    website: "https://www.ose.state.nm.us/",
    purpose: "Water permits, rights transfers, well permits",
    jurisdiction: "state",
    category: "water",
  },
  {
    agency: "NM Interstate Stream Commission",
    phone: "(505) 827-6160",
    website: "https://www.ose.state.nm.us/ISC/",
    purpose: "Interstate water compacts, water planning",
    jurisdiction: "state",
    category: "water",
  },
  
  // Environmental
  {
    agency: "NM Environment Department (NMED)",
    phone: "(505) 827-2855",
    email: "nmed.webmaster@env.nm.gov",
    website: "https://www.env.nm.gov/",
    purpose: "Environmental permits, air quality, hazardous waste",
    jurisdiction: "state",
    category: "environmental",
  },
  {
    agency: "NM Energy, Minerals & Natural Resources (EMNRD)",
    phone: "(505) 476-3200",
    website: "https://www.emnrd.nm.gov/",
    purpose: "Mining permits, oil & gas, forestry",
    jurisdiction: "state",
    category: "environmental",
  },
  {
    agency: "NM Oil Conservation Division (OCD)",
    phone: "(505) 476-3440",
    website: "https://www.emnrd.nm.gov/ocd/",
    purpose: "Oil & gas well permits, pipeline setbacks",
    jurisdiction: "state",
    category: "environmental",
  },
  
  // Federal Agencies
  {
    agency: "USFWS NM Ecological Services",
    phone: "(505) 346-2525",
    email: "nmesfo@fws.gov",
    website: "https://www.fws.gov/office/new-mexico-ecological-services",
    purpose: "ESA consultations, critical habitat, species permits",
    jurisdiction: "federal",
    category: "environmental",
  },
  {
    agency: "EPA Region 6 (Dallas)",
    phone: "(214) 665-2200",
    website: "https://www.epa.gov/aboutepa/epa-region-6-south-central",
    purpose: "NPDES permits, Superfund, RCRA compliance",
    jurisdiction: "federal",
    category: "environmental",
  },
  {
    agency: "US Army Corps of Engineers - Albuquerque District",
    phone: "(505) 342-3100",
    website: "https://www.spa.usace.army.mil/",
    purpose: "Section 404 wetland permits, Waters of the US",
    jurisdiction: "federal",
    category: "environmental",
  },
  {
    agency: "Bureau of Land Management - NM State Office",
    phone: "(505) 954-2000",
    website: "https://www.blm.gov/new-mexico",
    purpose: "Federal land access, rights-of-way, NEPA",
    jurisdiction: "federal",
    category: "general",
  },
  {
    agency: "Bureau of Indian Affairs - Southwest Region",
    phone: "(505) 563-3100",
    website: "https://www.bia.gov/regional-offices/southwest",
    purpose: "Tribal land development, trust land permits",
    jurisdiction: "federal",
    category: "cultural",
  },
  
  // State Planning
  {
    agency: "NM Construction Industries Division",
    phone: "(505) 476-4700",
    website: "https://www.rld.nm.gov/construction-industries/",
    purpose: "Building permits, contractor licensing (statewide codes)",
    jurisdiction: "state",
    category: "planning",
  },
];

// ============================================================================
// COUNTY-SPECIFIC CONTACTS
// ============================================================================

export const COUNTY_CONTACTS: Record<string, RegulatoryContact[]> = {
  "Bernalillo": [
    {
      agency: "Bernalillo County Planning & Development",
      phone: "(505) 314-0350",
      email: "planning@bernco.gov",
      website: "https://www.bernco.gov/planning/",
      purpose: "Zoning, subdivisions, land use permits (unincorporated areas)",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Bernalillo County Assessor",
      phone: "(505) 222-3700",
      email: "assessor@bernco.gov",
      website: "https://www.bernco.gov/assessor/",
      purpose: "Property valuations, parcel data, ownership records",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "Bernalillo County Fire Department",
      phone: "(505) 468-1310",
      website: "https://www.bernco.gov/fire/",
      purpose: "Fire permits, defensible space, wildfire risk",
      jurisdiction: "county",
      category: "fire",
    },
    {
      agency: "Middle Rio Grande Conservancy District (MRGCD)",
      phone: "(505) 247-0234",
      email: "mrgcd@mrgcd.com",
      website: "https://www.mrgcd.com/",
      purpose: "Irrigation water rights, acequia systems, drainage",
      jurisdiction: "special_district",
      category: "water",
    },
  ],
  
  "Santa Fe": [
    {
      agency: "Santa Fe County Land Use Department",
      phone: "(505) 986-6225",
      email: "landuse@santafecountynm.gov",
      website: "https://www.santafecountynm.gov/growth_management",
      purpose: "Zoning, subdivisions, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Santa Fe County Assessor",
      phone: "(505) 986-6300",
      website: "https://www.santafecountynm.gov/assessor",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "Santa Fe County Fire Department",
      phone: "(505) 992-3070",
      website: "https://www.santafecountynm.gov/fire",
      purpose: "Fire permits, WUI compliance",
      jurisdiction: "county",
      category: "fire",
    },
  ],
  
  "Doña Ana": [
    {
      agency: "Doña Ana County Community Development",
      phone: "(575) 647-7237",
      email: "planning@donaanacounty.org",
      website: "https://www.donaanacounty.org/planning",
      purpose: "Zoning, permits, code enforcement",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Doña Ana County Assessor",
      phone: "(575) 647-7400",
      website: "https://www.donaanacounty.org/assessor",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "Elephant Butte Irrigation District (EBID)",
      phone: "(575) 526-6671",
      website: "https://www.ebid-nm.org/",
      purpose: "Surface water rights, irrigation delivery",
      jurisdiction: "special_district",
      category: "water",
    },
  ],
  
  "Sandoval": [
    {
      agency: "Sandoval County Planning & Zoning",
      phone: "(505) 867-7574",
      email: "planning@sandovalcountynm.gov",
      website: "https://www.sandovalcountynm.gov/planning/",
      purpose: "Zoning, subdivisions, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Sandoval County Assessor",
      phone: "(505) 867-7509",
      website: "https://www.sandovalcountynm.gov/assessor/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
  ],
  
  "Rio Arriba": [
    {
      agency: "Rio Arriba County Planning Office",
      phone: "(575) 588-7254",
      website: "https://www.rio-arriba.org/departments/planning.html",
      purpose: "Zoning, land use permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Rio Arriba County Assessor",
      phone: "(575) 588-7278",
      website: "https://www.rio-arriba.org/departments/assessor.html",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
  ],
  
  "Taos": [
    {
      agency: "Taos County Planning Department",
      phone: "(575) 737-6440",
      website: "https://taoscounty.org/planning/",
      purpose: "Zoning, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Taos County Assessor",
      phone: "(575) 737-6340",
      website: "https://taoscounty.org/assessor/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
  ],
  
  "Valencia": [
    {
      agency: "Valencia County Planning & Zoning",
      phone: "(505) 866-2018",
      website: "https://www.valenciacountynm.gov/",
      purpose: "Zoning, subdivisions, permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Valencia County Assessor",
      phone: "(505) 866-2060",
      website: "https://www.valenciacountynm.gov/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "Middle Rio Grande Conservancy District (MRGCD)",
      phone: "(505) 247-0234",
      email: "mrgcd@mrgcd.com",
      website: "https://www.mrgcd.com/",
      purpose: "Irrigation water rights, acequia systems",
      jurisdiction: "special_district",
      category: "water",
    },
  ],
  
  "San Juan": [
    {
      agency: "San Juan County Community Development",
      phone: "(505) 334-9461",
      website: "https://www.sjcounty.net/",
      purpose: "Zoning, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "San Juan County Assessor",
      phone: "(505) 334-9471",
      website: "https://www.sjcounty.net/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "NM Oil Conservation Division - Farmington",
      phone: "(505) 599-9057",
      website: "https://www.emnrd.nm.gov/ocd/",
      purpose: "Oil & gas permits, well spacing (major production area)",
      jurisdiction: "state",
      category: "environmental",
    },
  ],
  
  "Lea": [
    {
      agency: "Lea County Planning & Zoning",
      phone: "(575) 396-8521",
      website: "https://www.leacounty.net/",
      purpose: "Zoning, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Lea County Assessor",
      phone: "(575) 396-8521",
      website: "https://www.leacounty.net/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "NM Oil Conservation Division - Hobbs",
      phone: "(575) 393-6161",
      website: "https://www.emnrd.nm.gov/ocd/",
      purpose: "Oil & gas permits (Permian Basin)",
      jurisdiction: "state",
      category: "environmental",
    },
  ],
  
  "Eddy": [
    {
      agency: "Eddy County Planning Office",
      phone: "(575) 885-3383",
      website: "https://www.eddycounty.org/",
      purpose: "Zoning, development permits",
      jurisdiction: "county",
      category: "planning",
    },
    {
      agency: "Eddy County Assessor",
      phone: "(575) 885-3383",
      website: "https://www.eddycounty.org/",
      purpose: "Property valuations, parcel data",
      jurisdiction: "county",
      category: "general",
    },
    {
      agency: "Carlsbad Irrigation District",
      phone: "(575) 885-4265",
      purpose: "Pecos River water rights, irrigation delivery",
      jurisdiction: "special_district",
      category: "water",
    },
  ],
};

// ============================================================================
// CITY-SPECIFIC CONTACTS
// ============================================================================

export const CITY_CONTACTS: Record<string, RegulatoryContact[]> = {
  "Albuquerque": [
    {
      agency: "City of Albuquerque Planning Department",
      phone: "(505) 924-3860",
      email: "abcplanning@cabq.gov",
      website: "https://www.cabq.gov/planning",
      purpose: "Zoning, subdivisions, IDO compliance, site plans",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "City of Albuquerque Building & Safety",
      phone: "(505) 924-3320",
      website: "https://www.cabq.gov/planning/building-safety-permits",
      purpose: "Building permits, inspections, code compliance",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "Albuquerque Bernalillo County Water Utility Authority (ABCWUA)",
      phone: "(505) 842-9287",
      email: "customerservice@abcwua.org",
      website: "https://www.abcwua.org/",
      purpose: "Water/sewer connections, utility availability",
      jurisdiction: "special_district",
      category: "utilities",
    },
    {
      agency: "Albuquerque Fire Rescue - Prevention",
      phone: "(505) 764-6300",
      website: "https://www.cabq.gov/fire",
      purpose: "Fire permits, commercial fire code compliance",
      jurisdiction: "city",
      category: "fire",
    },
    {
      agency: "City of Albuquerque Environmental Health",
      phone: "(505) 768-2600",
      website: "https://www.cabq.gov/environmentalhealth",
      purpose: "Septic permits, food service, environmental compliance",
      jurisdiction: "city",
      category: "environmental",
    },
  ],
  
  "Santa Fe": [
    {
      agency: "City of Santa Fe Land Use Department",
      phone: "(505) 955-6605",
      email: "landuse@santafenm.gov",
      website: "https://www.santafenm.gov/land_use",
      purpose: "Zoning, permits, historic district compliance",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "City of Santa Fe Historic Preservation",
      phone: "(505) 955-6605",
      website: "https://www.santafenm.gov/historic_preservation",
      purpose: "Historic district reviews, design standards",
      jurisdiction: "city",
      category: "cultural",
    },
    {
      agency: "City of Santa Fe Utilities",
      phone: "(505) 955-4350",
      website: "https://www.santafenm.gov/water_division",
      purpose: "Water/sewer connections, water budget allocation",
      jurisdiction: "city",
      category: "utilities",
    },
    {
      agency: "City of Santa Fe Fire Prevention",
      phone: "(505) 955-3110",
      purpose: "Fire permits, WUI compliance within city limits",
      jurisdiction: "city",
      category: "fire",
    },
  ],
  
  "Las Cruces": [
    {
      agency: "City of Las Cruces Community Development",
      phone: "(575) 528-3043",
      email: "planning@las-cruces.org",
      website: "https://www.las-cruces.org/",
      purpose: "Zoning, subdivisions, development permits",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "City of Las Cruces Building Permits",
      phone: "(575) 528-3033",
      website: "https://www.las-cruces.org/",
      purpose: "Building permits, inspections",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "Las Cruces Utilities",
      phone: "(575) 528-3500",
      website: "https://www.las-cruces.org/",
      purpose: "Water/sewer/gas connections",
      jurisdiction: "city",
      category: "utilities",
    },
  ],
  
  "Rio Rancho": [
    {
      agency: "City of Rio Rancho Development Services",
      phone: "(505) 891-5064",
      email: "development@rrnm.gov",
      website: "https://www.rrnm.gov/",
      purpose: "Zoning, permits, code compliance",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "City of Rio Rancho Utilities",
      phone: "(505) 891-5000",
      website: "https://www.rrnm.gov/",
      purpose: "Water/sewer connections",
      jurisdiction: "city",
      category: "utilities",
    },
  ],
  
  "Española": [
    {
      agency: "City of Española Planning & Zoning",
      phone: "(505) 747-6100",
      website: "https://www.cityofespanola.org/",
      purpose: "Zoning, development permits",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "Española Valley Utilities",
      phone: "(505) 747-6100",
      purpose: "Water/sewer availability",
      jurisdiction: "city",
      category: "utilities",
    },
  ],
  
  "Farmington": [
    {
      agency: "City of Farmington Community Development",
      phone: "(505) 599-1143",
      website: "https://www.fmtn.org/",
      purpose: "Zoning, permits, development review",
      jurisdiction: "city",
      category: "planning",
    },
    {
      agency: "Farmington Utilities",
      phone: "(505) 599-1222",
      purpose: "Electric, water, sewer, gas connections",
      jurisdiction: "city",
      category: "utilities",
    },
  ],
  
  "Roswell": [
    {
      agency: "City of Roswell Planning & Zoning",
      phone: "(575) 624-6700",
      website: "https://www.roswell-nm.gov/",
      purpose: "Zoning, development permits",
      jurisdiction: "city",
      category: "planning",
    },
  ],
  
  "Carlsbad": [
    {
      agency: "City of Carlsbad Planning",
      phone: "(575) 887-1191",
      website: "https://www.cityofcarlsbadnm.com/",
      purpose: "Zoning, development permits",
      jurisdiction: "city",
      category: "planning",
    },
  ],
  
  "Hobbs": [
    {
      agency: "City of Hobbs Planning",
      phone: "(575) 397-9200",
      website: "https://www.hobbsnm.org/",
      purpose: "Zoning, permits (oil & gas development area)",
      jurisdiction: "city",
      category: "planning",
    },
  ],
  
  "Taos": [
    {
      agency: "Town of Taos Planning",
      phone: "(575) 751-2016",
      website: "https://www.taosgov.com/",
      purpose: "Zoning, permits, historic district compliance",
      jurisdiction: "city",
      category: "planning",
    },
  ],
};

// ============================================================================
// TRIBAL CONTACTS (for properties near/on tribal lands)
// ============================================================================

export const TRIBAL_CONTACTS: Record<string, RegulatoryContact[]> = {
  "Pueblo of Sandia": [
    {
      agency: "Pueblo of Sandia Environment Department",
      phone: "(505) 867-3317",
      website: "https://www.sandiapueblo.nsn.us/",
      purpose: "Environmental compliance near tribal boundaries",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
  "Pueblo of Santa Ana": [
    {
      agency: "Pueblo of Santa Ana Planning",
      phone: "(505) 867-3301",
      website: "https://www.santaana-nsn.gov/",
      purpose: "Development near tribal boundaries",
      jurisdiction: "tribal",
      category: "planning",
    },
  ],
  "Ohkay Owingeh": [
    {
      agency: "Ohkay Owingeh Environment Department",
      phone: "(505) 852-4400",
      website: "https://www.ohkay.org/",
      purpose: "Tribal consultation for nearby development",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
  "Santa Clara Pueblo": [
    {
      agency: "Santa Clara Pueblo Office of Environmental Affairs",
      phone: "(505) 753-7326",
      website: "https://www.santaclarapueblo.org/",
      purpose: "Environmental and cultural consultation",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
  "Pojoaque Pueblo": [
    {
      agency: "Pueblo of Pojoaque Environment Department",
      phone: "(505) 455-2278",
      website: "https://www.pojoaque.org/",
      purpose: "Tribal consultation",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
  "Taos Pueblo": [
    {
      agency: "Taos Pueblo Governor's Office",
      phone: "(575) 758-1028",
      website: "https://taospueblo.com/",
      purpose: "Consultation for development near Pueblo lands (UNESCO site)",
      jurisdiction: "tribal",
      category: "cultural",
    },
  ],
  "Navajo Nation": [
    {
      agency: "Navajo Nation EPA",
      phone: "(928) 871-7692",
      website: "https://www.navajoepa.org/",
      purpose: "Environmental permits on/near Navajo lands",
      jurisdiction: "tribal",
      category: "environmental",
    },
    {
      agency: "Navajo Nation Land Department",
      phone: "(928) 871-6478",
      purpose: "Land use, rights-of-way on Navajo lands",
      jurisdiction: "tribal",
      category: "planning",
    },
  ],
  "Jicarilla Apache Nation": [
    {
      agency: "Jicarilla Apache Nation Environmental Protection",
      phone: "(575) 759-4238",
      purpose: "Environmental permits near Jicarilla lands",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
  "Mescalero Apache Tribe": [
    {
      agency: "Mescalero Apache Environmental Office",
      phone: "(575) 464-4494",
      website: "https://mescaleroapachetribe.com/",
      purpose: "Environmental consultation",
      jurisdiction: "tribal",
      category: "environmental",
    },
  ],
};

// ============================================================================
// MAIN LOOKUP FUNCTIONS
// ============================================================================

/**
 * Normalize county name for lookup (handles variations)
 */
function normalizeCountyName(county: string): string {
  return county
    .replace(/ County$/i, "")
    .replace(/^County of /i, "")
    .replace(/ñ/g, "n")  // Doña Ana → Dona Ana fallback
    .trim();
}

/**
 * Normalize city name for lookup
 */
function normalizeCityName(city: string): string {
  return city
    .replace(/^City of /i, "")
    .replace(/^Town of /i, "")
    .trim();
}

/**
 * Get all regulatory contacts for a location
 * 
 * @param county - County name (e.g., "Bernalillo", "Bernalillo County")
 * @param city - Optional city name (e.g., "Albuquerque", "Santa Fe")
 * @param nearbyTribalLands - Optional array of nearby tribal land names
 * @returns Array of relevant contacts, sorted by jurisdiction priority
 */
export function getContactsForLocation(
  county: string,
  city?: string | null,
  nearbyTribalLands?: string[]
): RegulatoryContact[] {
  const contacts: RegulatoryContact[] = [];
  
  // Always include statewide contacts
  contacts.push(...STATEWIDE_CONTACTS);
  
  // Add county-specific contacts
  const normalizedCounty = normalizeCountyName(county);
  const countyContacts = COUNTY_CONTACTS[normalizedCounty];
  if (countyContacts) {
    contacts.push(...countyContacts);
  }
  
  // Add city-specific contacts if provided
  if (city) {
    const normalizedCity = normalizeCityName(city);
    const cityContacts = CITY_CONTACTS[normalizedCity];
    if (cityContacts) {
      contacts.push(...cityContacts);
    }
  }
  
  // Add tribal contacts if near tribal lands
  if (nearbyTribalLands && nearbyTribalLands.length > 0) {
    for (const tribalLand of nearbyTribalLands) {
      // Try to match tribal land name to our contacts
      const tribalContacts = TRIBAL_CONTACTS[tribalLand];
      if (tribalContacts) {
        contacts.push(...tribalContacts);
      }
    }
    // Always include BIA for tribal proximity
    const biaContact = STATEWIDE_CONTACTS.find(c => c.agency.includes("Bureau of Indian Affairs"));
    if (biaContact && !contacts.includes(biaContact)) {
      contacts.push(biaContact);
    }
  }
  
  // Sort by jurisdiction priority: federal → state → county → city → tribal → special_district
  const jurisdictionOrder: Record<string, number> = {
    federal: 1,
    state: 2,
    county: 3,
    city: 4,
    tribal: 5,
    special_district: 6,
  };
  
  return contacts.sort((a, b) => 
    (jurisdictionOrder[a.jurisdiction] || 99) - (jurisdictionOrder[b.jurisdiction] || 99)
  );
}

/**
 * Get contacts filtered by category
 */
export function getContactsByCategory(
  contacts: RegulatoryContact[],
  category: RegulatoryContact["category"]
): RegulatoryContact[] {
  return contacts.filter(c => c.category === category);
}

/**
 * Get the most relevant planning contact for a location
 * Prioritizes city > county > state
 */
export function getPrimaryPlanningContact(
  county: string,
  city?: string | null
): RegulatoryContact | null {
  // Check city first
  if (city) {
    const normalizedCity = normalizeCityName(city);
    const cityContacts = CITY_CONTACTS[normalizedCity];
    if (cityContacts) {
      const planningContact = cityContacts.find(c => c.category === "planning");
      if (planningContact) return planningContact;
    }
  }
  
  // Check county
  const normalizedCounty = normalizeCountyName(county);
  const countyContacts = COUNTY_CONTACTS[normalizedCounty];
  if (countyContacts) {
    const planningContact = countyContacts.find(c => c.category === "planning");
    if (planningContact) return planningContact;
  }
  
  // Fallback to state
  return STATEWIDE_CONTACTS.find(c => c.agency.includes("Construction Industries")) || null;
}

/**
 * Format contact for display in reports
 */
export function formatContactForDisplay(contact: RegulatoryContact): {
  agency: string;
  phone: string;
  purpose: string;
} {
  return {
    agency: contact.agency,
    phone: contact.phone,
    purpose: contact.purpose,
  };
}

/**
 * Get essential contacts for report display (abbreviated list)
 * Returns 4-6 most relevant contacts based on location
 */
export function getEssentialContacts(
  county: string,
  city?: string | null,
  nearbyTribalLands?: string[]
): RegulatoryContact[] {
  const allContacts = getContactsForLocation(county, city, nearbyTribalLands);
  
  // Build essential list with priority selections
  const essential: RegulatoryContact[] = [];
  
  // 1. SHPO (always)
  const shpo = allContacts.find(c => c.agency.includes("SHPO"));
  if (shpo) essential.push(shpo);
  
  // 2. OSE (always for water)
  const ose = allContacts.find(c => c.agency.includes("State Engineer"));
  if (ose) essential.push(ose);
  
  // 3. USFWS (ESA)
  const fws = allContacts.find(c => c.agency.includes("USFWS"));
  if (fws) essential.push(fws);
  
  // 4. Primary planning contact (city or county)
  const planning = getPrimaryPlanningContact(county, city);
  if (planning && !essential.find(c => c.agency === planning.agency)) {
    essential.push(planning);
  }
  
  // 5. Water utility if city has one
  if (city) {
    const normalizedCity = normalizeCityName(city);
    const cityContacts = CITY_CONTACTS[normalizedCity];
    if (cityContacts) {
      const utility = cityContacts.find(c => c.category === "utilities");
      if (utility) essential.push(utility);
    }
  }
  
  // 6. Special district if applicable (MRGCD, EBID, etc.)
  const specialDistrict = allContacts.find(c => c.jurisdiction === "special_district");
  if (specialDistrict && !essential.includes(specialDistrict)) {
    essential.push(specialDistrict);
  }
  
  return essential.slice(0, 6);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { RegulatoryContact };
