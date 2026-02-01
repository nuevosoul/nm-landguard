import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REGRID_TOKEN = Deno.env.get('REGRID_API_TOKEN');
const REGRID_BASE_URL = 'https://app.regrid.com/api/v2';

interface ParcelData {
  found: boolean;
  parcelNumber: string | null;
  accountNumber: string | null;
  owner: string | null;
  mailingAddress: string | null;
  assessedValue: number | null;
  landValue: number | null;
  improvementValue: number | null;
  acreage: number | null;
  sqft: number | null;
  zoning: string | null;
  zoningDescription: string | null;
  legalDescription: string | null;
  saleDate: string | null;
  salePrice: number | null;
  yearBuilt: number | null;
  buildingSqft: number | null;
  address: string | null;
  city: string | null;
  county: string | null;
  state: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  qoz: boolean;
  qozTract: string | null;
  censusTract: string | null;
  assessorUrl: string | null;
  geometry: any | null;
  source: string;
  lastUpdated: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { lat, lng, address } = body;

    if (!REGRID_TOKEN) {
      throw new Error('Regrid API token not configured');
    }

    let apiUrl: string;
    
    if (address) {
      // Search by address
      const encodedAddress = encodeURIComponent(address);
      apiUrl = `${REGRID_BASE_URL}/parcels/address?query=${encodedAddress}&path=/us/nm&limit=1&token=${REGRID_TOKEN}`;
    } else if (lat && lng) {
      // Search by coordinates
      apiUrl = `${REGRID_BASE_URL}/parcels/point?lat=${lat}&lon=${lng}&limit=1&token=${REGRID_TOKEN}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Either address or lat/lng required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Querying Regrid: ${address || `${lat},${lng}`}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Regrid API error:', response.status, errorText);
      throw new Error(`Regrid API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.parcels?.features?.length) {
      // No parcel found
      const result: ParcelData = {
        found: false,
        parcelNumber: null,
        accountNumber: null,
        owner: null,
        mailingAddress: null,
        assessedValue: null,
        landValue: null,
        improvementValue: null,
        acreage: null,
        sqft: null,
        zoning: null,
        zoningDescription: null,
        legalDescription: null,
        saleDate: null,
        salePrice: null,
        yearBuilt: null,
        buildingSqft: null,
        address: null,
        city: null,
        county: null,
        state: null,
        zip: null,
        latitude: null,
        longitude: null,
        qoz: false,
        qozTract: null,
        censusTract: null,
        assessorUrl: null,
        geometry: null,
        source: 'Regrid',
        lastUpdated: null,
      };
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const feature = data.parcels.features[0];
    const props = feature.properties;
    const fields = props.fields || {};

    // Build mailing address if available
    let mailingAddr = null;
    if (fields.mailadd) {
      const parts = [fields.mailadd, fields.mail_city, fields.mail_state2, fields.mail_zip].filter(Boolean);
      mailingAddr = parts.join(', ');
    }

    const result: ParcelData = {
      found: true,
      parcelNumber: fields.parcelnumb || fields.parcelnumb_no_formatting || null,
      accountNumber: fields.account_number || null,
      owner: fields.owner || null,
      mailingAddress: mailingAddr,
      assessedValue: fields.parval || null,
      landValue: fields.landval || null,
      improvementValue: fields.improvval || null,
      acreage: fields.ll_gisacre || fields.gisacre || null,
      sqft: fields.ll_gissqft || null,
      zoning: fields.zoning || null,
      zoningDescription: fields.zoning_description || null,
      legalDescription: fields.legaldesc || null,
      saleDate: fields.saledate || null,
      salePrice: fields.saleprice || null,
      yearBuilt: fields.yearbuilt || null,
      buildingSqft: fields.area_building || null,
      address: fields.address || props.headline || null,
      city: fields.scity || fields.city || null,
      county: fields.county || null,
      state: fields.state2 || 'NM',
      zip: fields.szip5 || fields.szip || null,
      latitude: parseFloat(fields.lat) || null,
      longitude: parseFloat(fields.lon) || null,
      qoz: fields.qoz === 'Yes',
      qozTract: fields.qoz_tract || null,
      censusTract: fields.census_tract || null,
      assessorUrl: fields.sourceurl || null,
      geometry: feature.geometry || null,
      source: 'Regrid Parcel Data',
      lastUpdated: fields.ll_last_refresh || fields.ll_updated_at || null,
    };

    console.log(`Regrid parcel found: ${result.parcelNumber} in ${result.county} County`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Regrid parcel error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        found: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
