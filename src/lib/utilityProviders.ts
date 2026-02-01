/**
 * New Mexico Utility Provider Directory
 * 
 * Lookup electric, gas, water, and telecom providers by county.
 * Used in reports to show "contact these providers to verify service availability"
 */

export interface UtilityProvider {
  name: string;
  type: "electric" | "gas" | "water" | "telecom" | "propane";
  phone: string;
  website?: string;
  serviceArea?: string;
}

export interface CountyUtilities {
  electric: UtilityProvider[];
  gas: UtilityProvider[];
  water: UtilityProvider[];
  propane: UtilityProvider[];
  notes?: string[];
}

// Statewide providers
const PNM: UtilityProvider = {
  name: "PNM (Public Service Company of New Mexico)",
  type: "electric",
  phone: "(888) 342-5766",
  website: "https://www.pnm.com",
};

const NEW_MEXICO_GAS: UtilityProvider = {
  name: "New Mexico Gas Company",
  type: "gas",
  phone: "(888) 664-2726",
  website: "https://www.nmgco.com",
};

const XCEL_ENERGY: UtilityProvider = {
  name: "Xcel Energy",
  type: "electric",
  phone: "(800) 895-4999",
  website: "https://www.xcelenergy.com",
};

// Regional/Rural Electric Cooperatives
const KIT_CARSON: UtilityProvider = {
  name: "Kit Carson Electric Cooperative",
  type: "electric",
  phone: "(575) 758-2258",
  website: "https://www.kitcarson.com",
  serviceArea: "Taos, Colfax, Rio Arriba counties",
};

const JEMEZ_MOUNTAINS: UtilityProvider = {
  name: "Jemez Mountains Electric Cooperative",
  type: "electric",
  phone: "(575) 829-3550",
  website: "https://www.jemezcoop.org",
  serviceArea: "Sandoval, Rio Arriba, Los Alamos counties",
};

const MORA_SAN_MIGUEL: UtilityProvider = {
  name: "Mora-San Miguel Electric Cooperative",
  type: "electric",
  phone: "(800) 545-6672",
  website: "https://www.morasanmiguel.coop",
  serviceArea: "Mora, San Miguel counties",
};

const NORTHERN_RIO_ARRIBA: UtilityProvider = {
  name: "Northern Rio Arriba Electric Cooperative",
  type: "electric",
  phone: "(575) 756-2181",
  website: "https://www.noraec.org",
  serviceArea: "Northern Rio Arriba County",
};

const CENTRAL_NM: UtilityProvider = {
  name: "Central New Mexico Electric Cooperative",
  type: "electric",
  phone: "(505) 832-4483",
  website: "https://www.cnmec.org",
  serviceArea: "Torrance, Santa Fe, Bernalillo counties",
};

const FARMERS_ELECTRIC: UtilityProvider = {
  name: "Farmers' Electric Cooperative",
  type: "electric",
  phone: "(575) 355-2291",
  website: "https://www.fecnm.org",
  serviceArea: "Curry, Quay, Roosevelt, De Baca counties",
};

const SOUTHWESTERN_ELECTRIC: UtilityProvider = {
  name: "Southwestern Electric Cooperative",
  type: "electric",
  phone: "(575) 533-6421",
  website: "https://www.swec.coop",
  serviceArea: "Grant, Catron counties",
};

const OTERO_COUNTY_ELECTRIC: UtilityProvider = {
  name: "Otero County Electric Cooperative",
  type: "electric",
  phone: "(575) 682-2521",
  website: "https://www.ocec-inc.com",
  serviceArea: "Otero, Lincoln counties",
};

const CONTINENTAL_DIVIDE: UtilityProvider = {
  name: "Continental Divide Electric Cooperative",
  type: "electric",
  phone: "(505) 285-6656",
  website: "https://www.cdec.coop",
  serviceArea: "McKinley, Cibola counties",
};

const LEA_COUNTY: UtilityProvider = {
  name: "Lea County Electric Cooperative",
  type: "electric",
  phone: "(575) 396-3631",
  website: "https://www.lcecnet.com",
  serviceArea: "Lea County",
};

const ROOSEVELT_COUNTY: UtilityProvider = {
  name: "Roosevelt County Electric Cooperative",
  type: "electric",
  phone: "(575) 356-4491",
  website: "https://www.rcec.coop",
  serviceArea: "Roosevelt, Curry counties",
};

// Propane providers (rural areas)
const AMERIGAS: UtilityProvider = {
  name: "AmeriGas",
  type: "propane",
  phone: "(800) 263-7442",
  website: "https://www.amerigas.com",
};

const FERRELLGAS: UtilityProvider = {
  name: "Ferrellgas",
  type: "propane",
  phone: "(888) 337-7355",
  website: "https://www.ferrellgas.com",
};

// County-specific lookup
export const COUNTY_UTILITIES: Record<string, CountyUtilities> = {
  "bernalillo": {
    electric: [PNM],
    gas: [NEW_MEXICO_GAS],
    water: [{
      name: "Albuquerque Bernalillo County Water Utility Authority (ABCWUA)",
      type: "water",
      phone: "(505) 842-9287",
      website: "https://www.abcwua.org",
    }],
    propane: [AMERIGAS, FERRELLGAS],
    notes: ["Municipal water widely available in metro area", "Rural East Mountains may require well"],
  },
  
  "santa fe": {
    electric: [PNM, JEMEZ_MOUNTAINS],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "City of Santa Fe Water Division",
        type: "water",
        phone: "(505) 955-4201",
        website: "https://www.santafenm.gov/water_division",
        serviceArea: "City of Santa Fe",
      },
      {
        name: "Santa Fe County Utilities",
        type: "water",
        phone: "(505) 992-3045",
        website: "https://www.santafecountynm.gov/public_works/utilities",
        serviceArea: "Select county areas",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
    notes: ["Municipal water limited to city and some county areas", "Many rural areas require domestic well"],
  },
  
  "rio arriba": {
    electric: [JEMEZ_MOUNTAINS, KIT_CARSON, NORTHERN_RIO_ARRIBA],
    gas: [], // Limited gas service
    water: [
      {
        name: "Española Municipal Water",
        type: "water",
        phone: "(505) 747-6100",
        serviceArea: "City of Española only",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS, {
      name: "Superior Propane (Española)",
      type: "propane",
      phone: "(505) 753-2657",
    }],
    notes: [
      "Limited municipal water — most areas require domestic well",
      "No natural gas service in most areas — propane common",
      "Acequia water rights may be available for irrigation",
      "Contact OSE for domestic well permit requirements",
    ],
  },
  
  "taos": {
    electric: [KIT_CARSON],
    gas: [], // No natural gas
    water: [
      {
        name: "Town of Taos Utilities",
        type: "water",
        phone: "(575) 751-2007",
        serviceArea: "Town of Taos only",
      },
      {
        name: "El Prado Water and Sanitation District",
        type: "water",
        phone: "(575) 758-5765",
        serviceArea: "El Prado area",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
    notes: [
      "No natural gas service in Taos County — propane or electric heat",
      "Municipal water limited to town and immediate surroundings",
      "Most rural areas require domestic well",
      "Strong acequia tradition — check for water rights",
    ],
  },
  
  "sandoval": {
    electric: [PNM, JEMEZ_MOUNTAINS],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "Rio Rancho Utilities",
        type: "water",
        phone: "(505) 891-5014",
        website: "https://www.rrnm.gov/197/Utilities",
        serviceArea: "City of Rio Rancho",
      },
      {
        name: "Bernalillo Water Utility",
        type: "water",
        phone: "(505) 867-3311",
        serviceArea: "Town of Bernalillo",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
    notes: ["Rio Rancho and Bernalillo have municipal water", "Jemez Springs area may require well"],
  },
  
  "valencia": {
    electric: [PNM, CENTRAL_NM],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "City of Belen Utilities",
        type: "water",
        phone: "(505) 966-2746",
        serviceArea: "City of Belen",
      },
      {
        name: "Los Lunas Utilities",
        type: "water",
        phone: "(505) 839-3840",
        serviceArea: "Village of Los Lunas",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
  },
  
  "doña ana": {
    electric: [
      {
        name: "El Paso Electric",
        type: "electric",
        phone: "(575) 526-5555",
        website: "https://www.epelectric.com",
      }
    ],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "Las Cruces Utilities",
        type: "water",
        phone: "(575) 528-3500",
        website: "https://www.las-cruces.org/590/Utilities",
        serviceArea: "City of Las Cruces",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
  },
  
  "san juan": {
    electric: [
      {
        name: "San Juan County PUD",
        type: "electric",
        phone: "(505) 566-6400",
      }
    ],
    gas: [
      {
        name: "CenterPoint Energy",
        type: "gas",
        phone: "(888) 536-2427",
      }
    ],
    water: [
      {
        name: "City of Farmington Utilities",
        type: "water",
        phone: "(505) 599-1200",
        serviceArea: "City of Farmington",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
  },
  
  "lea": {
    electric: [LEA_COUNTY, XCEL_ENERGY],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "City of Hobbs Water Dept",
        type: "water",
        phone: "(575) 397-9230",
        serviceArea: "City of Hobbs",
      },
      {
        name: "City of Lovington Utilities",
        type: "water",
        phone: "(575) 396-2884",
        serviceArea: "City of Lovington",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
  },
  
  "eddy": {
    electric: [XCEL_ENERGY],
    gas: [NEW_MEXICO_GAS],
    water: [
      {
        name: "City of Carlsbad Utilities",
        type: "water",
        phone: "(575) 887-1191",
        serviceArea: "City of Carlsbad",
      },
      {
        name: "City of Artesia Utilities",
        type: "water",
        phone: "(575) 746-8299",
        serviceArea: "City of Artesia",
      }
    ],
    propane: [AMERIGAS, FERRELLGAS],
  },
};

/**
 * Get utility providers for a county
 */
export function getUtilityProviders(county: string): CountyUtilities | null {
  const normalizedCounty = county.toLowerCase().replace(' county', '').trim();
  return COUNTY_UTILITIES[normalizedCounty] || null;
}

/**
 * Format utility info for display
 */
export function formatUtilitySection(county: string): {
  providers: { category: string; items: UtilityProvider[] }[];
  notes: string[];
  disclaimer: string;
} {
  const utilities = getUtilityProviders(county);
  
  if (!utilities) {
    return {
      providers: [],
      notes: ["Utility provider information not available for this county. Contact county offices for local provider information."],
      disclaimer: "Verify service availability directly with utility providers before purchase.",
    };
  }
  
  const providers: { category: string; items: UtilityProvider[] }[] = [];
  
  if (utilities.electric.length > 0) {
    providers.push({ category: "Electric", items: utilities.electric });
  }
  if (utilities.gas.length > 0) {
    providers.push({ category: "Natural Gas", items: utilities.gas });
  }
  if (utilities.water.length > 0) {
    providers.push({ category: "Water", items: utilities.water });
  }
  if (utilities.propane.length > 0) {
    providers.push({ category: "Propane", items: utilities.propane });
  }
  
  return {
    providers,
    notes: utilities.notes || [],
    disclaimer: "Service availability varies by location. Contact providers directly to verify service at specific address.",
  };
}
