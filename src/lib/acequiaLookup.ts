/**
 * New Mexico Acequia Information
 * 
 * Acequias are community-operated irrigation ditches with water rights dating to Spanish colonial times.
 * Important for northern NM land buyers to understand acequia rights, responsibilities, and contacts.
 */

export interface AcequiaInfo {
  name: string;
  commission?: string;
  phone?: string;
  website?: string;
  notes?: string;
}

export interface CountyAcequiaInfo {
  hasAcequias: boolean;
  description: string;
  majorAcequias?: AcequiaInfo[];
  contacts: {
    name: string;
    role: string;
    phone?: string;
    website?: string;
  }[];
  considerations: string[];
}

// County-specific acequia information
export const COUNTY_ACEQUIA_INFO: Record<string, CountyAcequiaInfo> = {
  "rio arriba": {
    hasAcequias: true,
    description: "Rio Arriba County has over 100 active acequias, one of the highest concentrations in New Mexico. Many properties have associated acequia water rights for irrigation.",
    majorAcequias: [
      { name: "Acequia de Ancón", notes: "Velarde/Dixon area" },
      { name: "Acequia de Alcalde", notes: "Alcalde area" },
      { name: "Acequia de Chamita", notes: "Ohkay Owingeh area" },
      { name: "Acequia del Llano", notes: "Española area" },
      { name: "Acequia de la Plaza", notes: "Various communities" },
    ],
    contacts: [
      {
        name: "New Mexico Acequia Association",
        role: "Statewide acequia advocacy and resources",
        phone: "(505) 995-9644",
        website: "https://www.lasacequias.org",
      },
      {
        name: "Rio Arriba County Extension Office",
        role: "Agricultural resources and acequia contacts",
        phone: "(575) 753-3405",
      },
      {
        name: "NM Office of the State Engineer - Acequia & Community Ditch Fund",
        role: "Acequia infrastructure assistance",
        phone: "(505) 827-6120",
        website: "https://www.ose.state.nm.us/Acequias/",
      }
    ],
    considerations: [
      "Acequia water rights are attached to the land, not the owner — they transfer with property sale",
      "Parciantes (acequia members) have rights AND responsibilities including ditch maintenance",
      "Annual assessments and required labor (peonaje) may apply",
      "Water allocation based on historic use patterns and available flow",
      "Contact the specific acequia commission to verify water rights before purchase",
      "Acequia rights are separate from domestic well rights",
    ],
  },
  
  "taos": {
    hasAcequias: true,
    description: "Taos County has a strong acequia tradition with dozens of active community ditches. The Taos Valley Acequia Association coordinates many local acequias.",
    majorAcequias: [
      { name: "Acequia Madre del Rio Lucero" },
      { name: "Acequia del Monte", notes: "Arroyo Seco area" },
      { name: "Acequia de los Lovatos", notes: "Ranchos de Taos" },
      { name: "Tenorio Tract Acequia" },
      { name: "Acequia de la Plaza de Taos" },
    ],
    contacts: [
      {
        name: "Taos Valley Acequia Association",
        role: "Regional acequia coordination",
        phone: "(575) 758-9598",
      },
      {
        name: "New Mexico Acequia Association",
        role: "Statewide acequia advocacy and resources",
        phone: "(505) 995-9644",
        website: "https://www.lasacequias.org",
      },
      {
        name: "Taos County Extension Office",
        role: "Agricultural resources",
        phone: "(575) 758-3982",
      }
    ],
    considerations: [
      "Many Taos properties have acequia water rights for gardens and small-scale irrigation",
      "Water availability varies by season and acequia — spring runoff is typically best",
      "Some acequias allow stock watering, others are irrigation-only",
      "Verify the specific acequia and water allocation before purchase",
      "Acequia meetings and elections typically held in spring",
    ],
  },
  
  "santa fe": {
    hasAcequias: true,
    description: "Santa Fe County has active acequias particularly in the northern areas near Pojoaque, Española, and along the Santa Fe River.",
    majorAcequias: [
      { name: "Acequia Madre de Santa Fe", notes: "Historic Santa Fe acequia" },
      { name: "Acequia de la Cienega", notes: "La Cienega area" },
      { name: "Acequia de los Pinos", notes: "Agua Fria area" },
    ],
    contacts: [
      {
        name: "Santa Fe County Land Use Department",
        role: "Can provide acequia boundary information",
        phone: "(505) 986-6225",
      },
      {
        name: "New Mexico Acequia Association",
        role: "Statewide acequia advocacy and resources",
        phone: "(505) 995-9644",
        website: "https://www.lasacequias.org",
      },
    ],
    considerations: [
      "Northern Santa Fe County has more active acequias than southern areas",
      "City of Santa Fe water rights are separate from acequia rights",
      "Historic acequia rights may be valuable for agricultural use",
    ],
  },
  
  "mora": {
    hasAcequias: true,
    description: "Mora County has numerous acequias supporting traditional agricultural communities.",
    contacts: [
      {
        name: "New Mexico Acequia Association",
        role: "Statewide acequia advocacy and resources",
        phone: "(505) 995-9644",
        website: "https://www.lasacequias.org",
      },
      {
        name: "Mora County Extension Office",
        role: "Agricultural resources",
        phone: "(575) 387-2856",
      },
    ],
    considerations: [
      "Strong agricultural tradition with many active acequias",
      "Water rights are important for hay and pasture irrigation",
      "Contact local mayordomos for specific acequia information",
    ],
  },
  
  "san miguel": {
    hasAcequias: true,
    description: "San Miguel County has acequias along the Pecos River and Gallinas River watersheds.",
    contacts: [
      {
        name: "New Mexico Acequia Association",
        role: "Statewide acequia advocacy and resources",
        phone: "(505) 995-9644",
        website: "https://www.lasacequias.org",
      },
    ],
    considerations: [
      "Pecos River acequias have different water availability than northern acequias",
      "Las Vegas area has both municipal water and acequia options",
    ],
  },
};

// Default for counties without significant acequia presence
const DEFAULT_ACEQUIA_INFO: CountyAcequiaInfo = {
  hasAcequias: false,
  description: "This county does not have significant acequia infrastructure. Water for irrigation typically comes from wells or surface water permits.",
  contacts: [
    {
      name: "NM Office of the State Engineer",
      role: "Water rights and permits",
      phone: "(505) 827-6120",
      website: "https://www.ose.state.nm.us",
    },
  ],
  considerations: [
    "Irrigation water typically requires OSE permit or existing water right",
    "Contact OSE for information on water availability in your area",
  ],
};

/**
 * Get acequia information for a county
 */
export function getAcequiaInfo(county: string): CountyAcequiaInfo {
  const normalizedCounty = county.toLowerCase().replace(' county', '').trim();
  return COUNTY_ACEQUIA_INFO[normalizedCounty] || DEFAULT_ACEQUIA_INFO;
}

/**
 * Check if a county has significant acequia presence
 */
export function hasAcequias(county: string): boolean {
  const info = getAcequiaInfo(county);
  return info.hasAcequias;
}
