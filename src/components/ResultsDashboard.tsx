import { useState, useEffect } from "react";
import { 
  AlertTriangle, AlertCircle, CheckCircle, Download, MapPin, Calendar, 
  FileText, Map, Scale, Shield, Building, Droplets, TreePine, Landmark,
  FileCheck, Clock, Hash, Users, Phone, ExternalLink, ChevronRight,
  Gauge, BookOpen, AlertOctagon, Info, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import GISMap from "./GISMap";
import { downloadPDF, type ReportData, type WellData, type WellDataSummary, type CulturalResourcesData as PDFCulturalData, type SolarData as PDFSolarData, type InfrastructureData as PDFInfraData, type FloodData as PDFFloodData, type EPAData as PDFEPAData } from "@/lib/pdfExport";
import { toast } from "sonner";
import logoImage from "@/assets/logo-dark.png";
import { lookupPLSS, geocodeAddress, type PLSSResult } from "@/lib/geocoding";
import { getEssentialContacts, formatContactForDisplay } from "@/lib/regulatoryContacts";
import { invokeFunction } from "@/lib/supabaseApi";
import RiskRadarChart from "./RiskRadarChart";
import ExportPackage from "./ExportPackage";
import MapLayerControl from "./MapLayerControl";
import SystemStatusTicker from "./SystemStatusTicker";

interface StatusCardProps {
  title: string;
  status: "safe" | "caution" | "danger";
  statusText: string;
  statusTooltip?: string;
  description: string;
  details: string[];
  dataSource: string;
  lastUpdated: string;
  findings: FindingItem[];
  recommendations: string[];
}

interface FindingItem {
  label: string;
  value: string;
  status?: "safe" | "caution" | "danger" | "neutral";
}

const StatusCard = ({ title, status, statusText, statusTooltip, description, details, dataSource, lastUpdated, findings, recommendations }: StatusCardProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const statusConfig = {
    safe: {
      icon: CheckCircle,
      bgClass: "status-safe",
      borderClass: "border-[hsl(var(--status-safe)/0.3)]",
    },
    caution: {
      icon: AlertCircle,
      bgClass: "status-caution",
      borderClass: "border-[hsl(var(--status-caution)/0.3)]",
    },
    danger: {
      icon: AlertTriangle,
      bgClass: "status-danger",
      borderClass: "border-[hsl(var(--status-danger)/0.3)]",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`relative p-5 rounded-xl border border-white/10 bg-card/90 backdrop-blur-[10px] ${config.borderClass}`} style={{ boxShadow: '0 0 20px rgba(56, 189, 248, 0.1), 0 4px 20px -4px rgba(0, 0, 0, 0.5)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="relative">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${config.bgClass} border`}>
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{statusText}</span>
            {statusTooltip && (
              <button
                type="button"
                className="ml-1 text-current opacity-70 hover:opacity-100 transition-opacity"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
              >
                <Info className="w-3 h-3" />
              </button>
            )}
          </div>
          {/* Tooltip */}
          {showTooltip && statusTooltip && (
            <div className="absolute top-full left-0 mt-2 z-50 w-64 p-3 rounded-lg bg-foreground text-background text-[11px] leading-relaxed shadow-lg">
              <div className="absolute -top-1 left-4 w-2 h-2 bg-foreground rotate-45" />
              {statusTooltip}
            </div>
          )}
        </div>
        <div className="text-right text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1 justify-end">
            <Clock className="w-2.5 h-2.5" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>

      <h3 className="font-display text-lg font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>

      {/* Key Findings Table */}
      <div className="bg-muted/30 rounded-lg p-3 mb-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Key Findings</h4>
        <div className="space-y-1.5">
          {findings.map((finding, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs py-0.5 border-b border-border/50 last:border-0">
              <span className="text-muted-foreground">{finding.label}</span>
              <span className={`font-medium ${
                finding.status === 'danger' ? 'text-[hsl(var(--status-danger))]' :
                finding.status === 'caution' ? 'text-[hsl(var(--status-caution))]' :
                finding.status === 'safe' ? 'text-[hsl(var(--status-safe))]' :
                'text-foreground'
              }`}>{finding.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mb-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Analysis Details</h4>
        <ul className="space-y-1">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <ChevronRight className="w-2.5 h-2.5 mt-0.5 text-primary flex-shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5 flex items-center gap-1">
          <FileCheck className="w-2.5 h-2.5" />
          Recommended Actions
        </h4>
        <ul className="space-y-0.5">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="text-xs text-foreground flex items-start gap-1.5">
              <span className="text-primary font-medium">{idx + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Source */}
      <div className="mt-3 pt-2 border-t border-border flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <BookOpen className="w-2.5 h-2.5" />
        <span>Source: {dataSource}</span>
      </div>
    </div>
  );
};

interface ResultsDashboardProps {
  address: string;
  onReset: () => void;
  isSample?: boolean;
}

interface PropertyData {
  owner: string;
  ownerAddress: string;
  siteAddress: string;
  legalDescription: string;
  parcelId: string;
  acreage: number;
  landValue: number;
  improvementValue: number;
  totalValue: number;
  taxableValue: number;
  propertyClass: string;
  taxYear: string;
  county: string;
  source: string;
  parcelGeometry?: number[][][] | null;
}

interface FloodData {
  floodZone: string;
  floodZoneDescription: string;
  sfha: boolean;
  riskLevel: "high" | "moderate" | "low" | "minimal";
  source: string;
}

interface EPAData {
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

interface ElevationData {
  elevation: number;
  slope: number;
  slopeCategory: string;
  aspect: string;
  drainageClass: string;
  terrainDescription: string;
  source: string;
}

interface SoilData {
  mapUnitName: string;
  mapUnitSymbol: string;
  drainageClass: string;
  hydrologicGroup: string;
  floodingFrequency: string;
  slopeRange: string;
  depthToWaterTable: string;
  texturePrimary: string;
  constructionLimitations: string;
  buildingSuitability: string;
  septicsuitability: string;
  erosionHazard: string;
  source: string;
}

interface CulturalResourcesData {
  nearestTribalLand: { name: string; type: string; distance: number } | null;
  tribalLandsWithin5Miles: { name: string; type: string; distance: number }[];
  onTribalLand: boolean;
  tribalConsultationRequired: boolean;
  tribalConsultationReason: string;
  nrhpPropertiesWithin1Mile: { name: string; refNumber: string; distance: number; resourceType: string }[];
  nearestNRHPProperty: { name: string; distance: number } | null;
  inHistoricDistrict: boolean;
  historicDistrictName: string | null;
  riskLevel: "high" | "moderate" | "low";
  section106Required: boolean;
  recommendedActions: string[];
  source: string;
}

interface SolarData {
  sunlightHoursPerYear: number;
  maxArrayPanelsCount: number;
  maxArrayAreaMeters2: number;
  solarPotential: "excellent" | "good" | "fair" | "poor";
  annualSavingsEstimate: number;
  roofAreaSqFt: number;
  recommendedCapacityKw: number;
  source: string;
}

interface InfrastructureData {
  nearestFireStation: { name: string; distance: number; isoClass?: number };
  nearestPolice: { name: string; distance: number };
  nearestHospital: { name: string; distance: number };
  nearestSchool: { name: string; distance: number };
  nearestGrocery: { name: string; distance: number };
  source: string;
}

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

const ResultsDashboard = ({ address, onReset, isSample = false }: ResultsDashboardProps) => {
  const [plssData, setPlssData] = useState<PLSSResult | null>(null);
  const [isLoadingPLSS, setIsLoadingPLSS] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [wellData, setWellData] = useState<{ wells: WellData[]; summary: WellDataSummary } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>(address);
  const [countyName, setCountyName] = useState<string>("Loading...");
  const [cityName, setCityName] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [isLoadingProperty, setIsLoadingProperty] = useState(false);
  
  // New data states
  const [floodData, setFloodData] = useState<FloodData | null>(null);
  const [epaData, setEpaData] = useState<EPAData | null>(null);
  const [elevationData, setElevationData] = useState<ElevationData | null>(null);
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [culturalData, setCulturalData] = useState<CulturalResourcesData | null>(null);
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [infrastructureData, setInfrastructureData] = useState<InfrastructureData | null>(null);
  const [isLoadingEnvironmental, setIsLoadingEnvironmental] = useState(false);
  const [isLoadingCultural, setIsLoadingCultural] = useState(false);
  const [isLoadingSolar, setIsLoadingSolar] = useState(false);
  const [isLoadingInfrastructure, setIsLoadingInfrastructure] = useState(false);
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [isLoadingParcel, setIsLoadingParcel] = useState(false);

  // Extract county from geocoded display name
  const extractCounty = (displayName: string): string => {
    // Google format: "597 County Rd 57, Ohkay Owingeh, NM 87566, USA"
    // Try to find county in the address - look for "County" in the name
    const countyMatch = displayName.match(/([A-Za-z\s]+County)/i);
    if (countyMatch) {
      return countyMatch[1];
    }
    // Fallback: try to parse from structured address
    const parts = displayName.split(',').map(p => p.trim());
    // Usually county is before state in Google addresses
    for (const part of parts) {
      if (part.toLowerCase().includes('county')) {
        return part;
      }
    }
    return "New Mexico";
  };

  // Extract city from geocoded display name
  const extractCity = (displayName: string): string | null => {
    // Google format: "123 Main St, Albuquerque, NM 87102, USA"
    // Known NM cities to look for
    const knownCities = [
      "Albuquerque", "Santa Fe", "Las Cruces", "Rio Rancho", "Roswell",
      "Farmington", "Carlsbad", "Hobbs", "Clovis", "Alamogordo",
      "Española", "Taos", "Los Alamos", "Gallup", "Deming", "Artesia",
      "Lovington", "Portales", "Silver City", "Ruidoso"
    ];
    
    const parts = displayName.split(',').map(p => p.trim());
    for (const part of parts) {
      for (const city of knownCities) {
        if (part.toLowerCase() === city.toLowerCase()) {
          return city;
        }
      }
    }
    return null;
  };

  // Fetch property data from county assessor
  const fetchPropertyLookup = async (lat: number, lng: number) => {
    setIsLoadingProperty(true);
    try {
      const result = await invokeFunction('property-lookup', { lat, lng });

      if (result?.success && result.data) {
        setPropertyData(result.data);
        console.log('Property data loaded:', result.data);
      } else {
        console.log('Property lookup failed:', result?.error || result?.message);
      }
    } catch (error) {
      console.error('Property lookup error:', error);
    } finally {
      setIsLoadingProperty(false);
    }
  };

  // Fetch environmental data (FEMA, EPA, Elevation, Soil)
  const fetchEnvironmentalData = async (lat: number, lng: number) => {
    setIsLoadingEnvironmental(true);
    
    try {
      // Fetch all environmental data in parallel using direct API calls
      const [floodRes, epaRes, elevRes, soilRes] = await Promise.allSettled([
        invokeFunction('fema-flood', { lat, lng }),
        invokeFunction('epa-envirofacts', { lat, lng, radiusMiles: 5 }),
        invokeFunction('elevation', { lat, lng }),
        invokeFunction('soil-survey', { lat, lng }),
      ]);

      // Process FEMA flood data
      if (floodRes.status === "fulfilled" && floodRes.value) {
        const data = floodRes.value;
        if (!data.error) {
          setFloodData(data);
          console.log("Flood data loaded:", data);
        }
      }

      // Process EPA data
      if (epaRes.status === "fulfilled" && epaRes.value) {
        const data = epaRes.value;
        if (!data.error) {
          setEpaData(data);
          console.log("EPA data loaded:", data.summary);
        }
      }

      // Process elevation data
      if (elevRes.status === "fulfilled" && elevRes.value) {
        const data = elevRes.value;
        if (!data.error) {
          setElevationData(data);
          console.log("Elevation data loaded:", data);
        }
      }

      // Process soil data
      if (soilRes.status === "fulfilled" && soilRes.value) {
        const data = soilRes.value;
        if (!data.error) {
          setSoilData(data);
          console.log("Soil data loaded:", data);
        }
      }
    } catch (error) {
      console.error("Error fetching environmental data:", error);
    } finally {
      setIsLoadingEnvironmental(false);
    }
  };

  // Fetch cultural resources data (Tribal lands, NRHP)
  const fetchCulturalData = async (lat: number, lng: number) => {
    setIsLoadingCultural(true);
    
    try {
      const data = await invokeFunction('cultural-resources', { lat, lng });

      if (data && !data.error) {
        setCulturalData(data);
        console.log("Cultural resources data loaded:", data);
      }
    } catch (error) {
      console.error("Error fetching cultural data:", error);
    } finally {
      setIsLoadingCultural(false);
    }
  };

  // Fetch Google Solar API data
  const fetchSolarData = async (lat: number, lng: number) => {
    setIsLoadingSolar(true);
    
    try {
      const data = await invokeFunction('google-solar', { lat, lng });

      if (data && !data.error) {
        setSolarData(data);
        console.log("Solar data loaded:", data);
      }
    } catch (error) {
      console.error("Error fetching solar data:", error);
    } finally {
      setIsLoadingSolar(false);
    }
  };

  // Fetch Google Places infrastructure data
  const fetchInfrastructureData = async (lat: number, lng: number) => {
    setIsLoadingInfrastructure(true);
    
    try {
      const data = await invokeFunction('google-places', { lat, lng });

      if (data && !data.error) {
        setInfrastructureData(data);
        console.log("Infrastructure data loaded:", data);
      }
    } catch (error) {
      console.error("Error fetching infrastructure data:", error);
    } finally {
      setIsLoadingInfrastructure(false);
    }
  };

  // Fetch Regrid parcel data
  const fetchParcelData = async (lat: number, lng: number, addr: string) => {
    setIsLoadingParcel(true);
    
    try {
      const data = await invokeFunction('regrid-parcel', { lat, lng, address: addr });

      if (data?.found) {
        setParcelData(data);
        console.log("Parcel data loaded:", data);
      } else {
        console.log("No parcel found for address");
      }
    } catch (error) {
      console.error("Error fetching parcel data:", error);
    } finally {
      setIsLoadingParcel(false);
    }
  };

  // Fetch PLSS/legal description when component mounts
  useEffect(() => {
    const fetchAllPropertyData = async () => {
      setIsLoadingPLSS(true);
      try {
        // First geocode to get coordinates
        const geocodeResult = await geocodeAddress(address, "address");
        if (geocodeResult && !geocodeResult.isError) {
          setCoordinates({ lat: geocodeResult.lat, lng: geocodeResult.lng });
          setDisplayAddress(geocodeResult.displayName);
          
          // Extract county and city from display name
          const county = extractCounty(geocodeResult.displayName);
          setCountyName(county);
          const city = extractCity(geocodeResult.displayName);
          setCityName(city);
          
          // Fetch all data in parallel
          fetchPropertyLookup(geocodeResult.lat, geocodeResult.lng);
          fetchEnvironmentalData(geocodeResult.lat, geocodeResult.lng);
          fetchCulturalData(geocodeResult.lat, geocodeResult.lng);
          fetchSolarData(geocodeResult.lat, geocodeResult.lng);
          fetchInfrastructureData(geocodeResult.lat, geocodeResult.lng);
          fetchParcelData(geocodeResult.lat, geocodeResult.lng, address);
          
          // Then lookup PLSS
          const plss = await lookupPLSS(geocodeResult.lat, geocodeResult.lng);
          if (plss) {
            setPlssData(plss);
            console.log('PLSS data loaded:', plss);
          }
        }
      } catch (error) {
        console.error('Error fetching property data:', error);
      } finally {
        setIsLoadingPLSS(false);
      }
    };

    fetchAllPropertyData();
  }, [address]);

  // Handle well data callback from GISMap
  const handleWellDataLoaded = (data: { wells: WellData[]; summary: WellDataSummary } | null) => {
    if (data) {
      setWellData(data);
      console.log('Well data loaded:', data.summary);
    }
  };

  // Use property data from county assessor if available, then Regrid, then PLSS
  // Regrid returns county like "rio-arriba", need to format it
  const formatCounty = (county: string | null | undefined): string => {
    if (!county) return "";
    // Convert "rio-arriba" to "Rio Arriba County"
    const formatted = county.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    return formatted.includes('County') ? formatted : `${formatted} County`;
  };
  const effectiveCounty = propertyData?.county || formatCounty(parcelData?.county) || countyName;
  const effectiveLegalDesc = propertyData?.legalDescription || parcelData?.legalDescription || plssData?.legalDescription || "Loading...";
  const effectiveParcelId = propertyData?.parcelId || parcelData?.parcelNumber || "Not available";
  const effectiveAcreage = propertyData?.acreage 
    ? `${propertyData.acreage.toFixed(2)} acres` 
    : parcelData?.acreage 
    ? `${parcelData.acreage.toFixed(2)} acres`
    : "Not available";

  const reportData = {
    address: propertyData?.siteAddress || address || "1234 Rio Grande Blvd, Albuquerque, NM",
    reportId: "RGD-2024-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    generatedAt: new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long", 
      day: "numeric"
    }),
    parcelId: effectiveParcelId,
    legalDescription: effectiveLegalDesc,
    acreage: effectiveAcreage,
    zoning: propertyData?.propertyClass || parcelData?.zoning || "R-1 Residential",
    jurisdiction: effectiveCounty.includes("County") ? effectiveCounty.replace(" County", "") : "New Mexico",
    county: effectiveCounty,
    // Owner info
    owner: propertyData?.owner || "Not available",
    ownerAddress: propertyData?.ownerAddress || "Not available",
    // Value info
    landValue: propertyData?.landValue || 0,
    improvementValue: propertyData?.improvementValue || 0,
    totalValue: propertyData?.totalValue || 0,
    taxableValue: propertyData?.taxableValue || 0,
    taxYear: propertyData?.taxYear || new Date().getFullYear().toString(),
    dataSource: propertyData?.source || "BLM PLSS / Geocoding",
  };

  // Calculate overall risk score dynamically based on findings
  const calculateRiskScore = (): number => {
    let score = 30; // Base score (low risk)
    
    // Cultural resources risk
    if (culturalData?.onTribalLand) score += 40;
    else if (culturalData?.inHistoricDistrict) score += 35;
    else if (culturalData?.tribalConsultationRequired) score += 20;
    else if (culturalData?.nearestTribalLand && culturalData.nearestTribalLand.distance < 3) score += 10;
    
    // Flood risk
    if (floodData?.sfha) score += 25;
    else if (floodData?.riskLevel === "moderate") score += 10;
    
    // EPA risk
    if (epaData?.summary?.overallRisk === "high") score += 25;
    else if (epaData?.summary?.overallRisk === "moderate") score += 10;
    
    // Cap at 100
    return Math.min(score, 100);
  };
  const riskScore = calculateRiskScore();

  // Build Cultural Resources status card based on real data
  const getCulturalResourcesCard = (): StatusCardProps => {
    const cd = culturalData;
    
    // Determine status based on real data
    let status: "safe" | "caution" | "danger" = "safe";
    let statusText = "No Recorded Conflict";
    
    if (cd?.riskLevel === "high" || cd?.onTribalLand || cd?.inHistoricDistrict) {
      status = "danger";
      statusText = "High Risk";
    } else if (cd?.riskLevel === "moderate" || cd?.tribalConsultationRequired || (cd?.nrhpPropertiesWithin1Mile?.length ?? 0) > 0) {
      status = "caution";
      statusText = "Caution";
    }

    // Build findings from real data
    const findings: FindingItem[] = [];
    
    // Tribal land findings - explicit ON or OFF
    if (cd?.onTribalLand && cd?.nearestTribalLand) {
      findings.push({ label: "Tribal Land Status", value: `ON ${cd.nearestTribalLand.name}`, status: "danger" });
    } else if (cd?.nearestTribalLand) {
      // Explicitly OFF tribal land
      const dist = cd.nearestTribalLand.distance;
      findings.push({ label: "Tribal Land Status", value: "OFF tribal boundaries", status: "safe" });
      findings.push({ 
        label: `Nearest ${cd.nearestTribalLand.type || "Tribal Land"}`, 
        value: `${cd.nearestTribalLand.name} (${dist.toFixed(1)} mi)`, 
        status: dist < 1 ? "caution" : dist < 3 ? "caution" : "safe" 
      });
    } else {
      // No tribal lands detected within range
      findings.push({ label: "Tribal Land Status", value: "OFF tribal boundaries", status: "safe" });
      findings.push({ label: "Nearest Tribal Land", value: "None within 10 miles", status: "safe" });
    }
    
    // Tribal consultation
    findings.push({ 
      label: "Tribal Consultation Required", 
      value: cd?.tribalConsultationRequired ? "Yes" : "No", 
      status: cd?.tribalConsultationRequired ? "danger" : "safe" 
    });
    
    // Historic district
    if (cd?.inHistoricDistrict) {
      findings.push({ label: "In Historic District", value: cd.historicDistrictName || "Yes", status: "danger" });
    }
    
    // NRHP properties
    const nrhpCount = cd?.nrhpPropertiesWithin1Mile?.length ?? 0;
    findings.push({ 
      label: "NRHP Properties (1 mi)", 
      value: nrhpCount > 0 ? `${nrhpCount} listed` : "None found", 
      status: nrhpCount > 0 ? "caution" : "safe" 
    });
    
    // Nearest NRHP property
    if (cd?.nearestNRHPProperty) {
      findings.push({ 
        label: "Nearest NRHP Property", 
        value: `${cd.nearestNRHPProperty.distance.toFixed(2)} mi`, 
        status: cd.nearestNRHPProperty.distance < 0.25 ? "danger" : "caution" 
      });
    }
    
    // Section 106
    findings.push({ 
      label: "Section 106 Review", 
      value: cd?.section106Required ? "Required" : "Not Required", 
      status: cd?.section106Required ? "caution" : "safe" 
    });

    // Build details
    const details: string[] = [];
    
    if (cd?.onTribalLand) {
      details.push(`Property is located ON ${cd.nearestTribalLand?.name || "tribal"} land - development requires tribal government approval`);
    } else if (cd?.nearestTribalLand) {
      details.push(`Nearest tribal land: ${cd.nearestTribalLand.name} (${cd.nearestTribalLand.type}) - ${cd.nearestTribalLand.distance.toFixed(2)} miles away`);
    }
    
    if ((cd?.tribalLandsWithin5Miles?.length ?? 0) > 1) {
      const names = cd!.tribalLandsWithin5Miles.slice(0, 3).map(t => t.name).join(", ");
      details.push(`${cd!.tribalLandsWithin5Miles.length} tribal lands within 5 miles: ${names}`);
    }
    
    if (cd?.inHistoricDistrict) {
      details.push(`Property is within ${cd.historicDistrictName} - SHPO review required for any exterior modifications`);
    }
    
    if (cd?.nrhpPropertiesWithin1Mile && cd.nrhpPropertiesWithin1Mile.length > 0) {
      const nearest = cd.nrhpPropertiesWithin1Mile[0];
      details.push(`Nearest NRHP property: ${nearest.name} (Ref: ${nearest.refNumber}) - ${nearest.distance.toFixed(2)} miles`);
      
      if (cd.nrhpPropertiesWithin1Mile.length > 1) {
        details.push(`${cd.nrhpPropertiesWithin1Mile.length - 1} additional NRHP properties within 1 mile`);
      }
    }
    
    if (cd?.tribalConsultationReason) {
      details.push(cd.tribalConsultationReason);
    }

    // Default details if no data
    if (details.length === 0) {
      details.push("Cultural resources data is being loaded or unavailable for this location");
      details.push("Recommend requesting ARMS records check from NM Historic Preservation Division");
    }

    // Use real recommendations or defaults
    const recommendations = cd?.recommendedActions && cd.recommendedActions.length > 0 
      ? cd.recommendedActions 
      : [
          "Request ARMS records check from NM Historic Preservation Division",
          "Consider Phase I Archaeological Survey if any ground disturbance planned",
        ];

    return {
      title: "Cultural Resources Assessment",
      status,
      statusText,
      statusTooltip: status === "danger" 
        ? "High Probability Zone: Previous surveys indicate cultural site density >2/acre. Class III Survey likely required before ground disturbance."
        : status === "caution"
        ? "Moderate Risk: Proximity to recorded cultural sites or tribal lands may require additional consultation or survey work."
        : "Low Risk: No recorded cultural sites or tribal lands identified in immediate vicinity. Standard protocols apply.",
      description: cd 
        ? `Analysis of BIA tribal land boundaries and National Register of Historic Places data for proximity to culturally significant resources.`
        : "Loading cultural resources data from federal databases...",
      dataSource: cd?.source || "BIA AIAN Land Areas, NPS NRHP",
      lastUpdated: isLoadingCultural ? "Loading..." : "Real-time federal data",
      findings: findings.length > 0 ? findings : [
        { label: "Status", value: isLoadingCultural ? "Loading..." : "Data unavailable", status: "neutral" as const }
      ],
      details,
      recommendations,
    };
  };

  const statusCards: StatusCardProps[] = [
    getCulturalResourcesCard(),
    {
      title: "Water Rights & Restrictions",
      status: "caution",
      statusText: "Verification Required",
      statusTooltip: "Important: Water rights and utility availability must be verified directly with NM OSE and local utility providers. This report provides general guidance only.",
      description: "Water rights in New Mexico are administered by the Office of the State Engineer (OSE). Availability of municipal water service varies by location and must be verified with local providers.",
      dataSource: "General NM Water Law - Site-specific verification required",
      lastUpdated: "Guidance only - verify current status",
      findings: [
        { label: "State Administration", value: "NM Office of State Engineer", status: "neutral" },
        { label: "Municipal Water", value: "Verify with local utility", status: "caution" },
        { label: "Domestic Well", value: "May require OSE permit", status: "caution" },
        { label: "Water Rights on Parcel", value: "Research required", status: "caution" },
      ],
      details: [
        "Most of NM is within declared underground water basins - permits required for new wells",
        "Domestic wells typically limited to 3 acre-feet/year for household use",
        "Municipal water availability depends on proximity to existing infrastructure",
        "Rural properties may require well or hauled water - verify before purchase",
        "Acequia rights may exist - check with local acequia association",
      ],
      recommendations: [
        "Contact local water utility to verify if municipal connection is available",
        "Search NM OSE WATERS database for existing water rights on parcel",
        "If well needed, contact OSE District office for permit requirements",
        "For rural properties, budget for well drilling or water hauling if no municipal service",
      ],
    },
    {
      title: "Critical Habitat & ESA Compliance",
      status: "caution" as const,
      statusText: "Verification Recommended",
      statusTooltip: "General Guidance: Site-specific ESA analysis requires USFWS IPaC query. Standard protections apply for migratory birds.",
      description: "Endangered Species Act compliance depends on location-specific critical habitat designations. For federal permits or funding, an official USFWS IPaC query is recommended.",
      dataSource: "General NM ESA guidance - Site-specific IPaC query recommended",
      lastUpdated: "Guidance only",
      findings: [
        { label: "Critical Habitat", value: "IPaC query recommended", status: "neutral" },
        { label: "ESA Listed Species", value: "Location-dependent", status: "neutral" },
        { label: "Migratory Bird Treaty Act", value: "Applies statewide", status: "neutral" },
        { label: "Wetland/Waters of US", value: "Site inspection needed", status: "neutral" },
      ],
      details: [
        "NM has multiple ESA-listed species with designated critical habitat",
        "Rio Grande corridor: Silvery Minnow, Willow Flycatcher habitat present",
        "Mountain/forest areas: Mexican Spotted Owl habitat possible",
        "Run official IPaC query at ecos.fws.gov/ipac for site-specific species list",
        "Wetland delineation may be required if development near water features",
      ],
      recommendations: [
        "Run USFWS IPaC query for official species list and critical habitat overlap",
        "Conduct pre-construction bird survey if clearing during nesting season (Apr-Jul)",
        "If near water features, conduct wetland delineation",
        "Implement standard SWPPP for construction stormwater management",
      ],
    },
    // FEMA Flood Hazard Card
    {
      title: "FEMA Flood Hazard",
      status: floodData?.riskLevel === "high" ? "danger" : floodData?.riskLevel === "moderate" ? "caution" : "safe",
      statusText: floodData?.riskLevel === "high" ? "High Risk" : floodData?.riskLevel === "moderate" ? "Caution" : "No Recorded Conflict",
      statusTooltip: floodData?.sfha 
        ? "High Risk Zone: Property is within a Special Flood Hazard Area (SFHA). Flood insurance is required for federally-backed mortgages. Base Flood Elevation determines insurance rates."
        : "Minimal Risk: Property is outside the 100-year floodplain. Flood insurance not required but may be recommended for peace of mind.",
      description: floodData 
        ? `Property flood analysis based on FEMA National Flood Hazard Layer (NFHL). ${floodData.floodZoneDescription}`
        : "Loading FEMA flood hazard data...",
      dataSource: "FEMA NFHL, FIRM Panels",
      lastUpdated: isLoadingEnvironmental ? "Loading..." : "Data retrieved Dec 2024",
      findings: [
        { 
          label: "Flood Zone", 
          value: floodData ? `Zone ${floodData.floodZone}` : "Loading...",
          status: floodData?.riskLevel === "high" ? "danger" : floodData?.riskLevel === "moderate" ? "caution" : "safe"
        },
        { 
          label: "Special Flood Hazard Area", 
          value: floodData ? (floodData.sfha ? "Yes - SFHA" : "No") : "Loading...",
          status: floodData?.sfha ? "danger" : "safe"
        },
        { 
          label: "Flood Insurance Required", 
          value: floodData?.sfha ? "Required for federally-backed mortgages" : "Not required",
          status: floodData?.sfha ? "caution" : "safe"
        },
        { 
          label: "Base Flood Elevation", 
          value: floodData?.sfha ? "Consult FIRM panel" : "N/A",
          status: "neutral"
        },
      ],
      details: floodData ? [
        `Flood Zone ${floodData.floodZone}: ${floodData.floodZoneDescription}`,
        floodData.sfha 
          ? "Property is within a Special Flood Hazard Area - flood insurance required for federally-backed mortgages"
          : "Property is outside Special Flood Hazard Area",
        "Recommend reviewing community FIRM panels for detailed flood boundaries",
        "Consider elevation certificate if near zone boundary",
      ] : [
        "Loading FEMA flood hazard data...",
      ],
      recommendations: floodData?.sfha ? [
        "Obtain flood elevation certificate from licensed surveyor",
        "Contact FEMA for Letter of Map Amendment (LOMA) if structure is elevated",
        "Secure flood insurance before closing on property",
        "Review local floodplain management regulations",
      ] : [
        "Standard stormwater management practices apply",
        "Consider voluntary flood insurance for additional protection",
        "Verify drainage patterns during site assessment",
      ],
    },
    // NM OCD Oil & Gas Card
    {
      title: "NM OCD Oil & Gas Infrastructure",
      status: "safe",
      statusText: "No Recorded Conflict",
      description: "Analysis of NM Oil Conservation Division records for active wells, pipelines, and associated infrastructure within proximity of subject property.",
      dataSource: "NM OCD GIS, Pipeline Mapping",
      lastUpdated: "Data retrieved Dec 2024",
      findings: [
        { label: "Active Oil/Gas Wells (0.5 mi)", value: "None detected", status: "safe" },
        { label: "Plugged/Abandoned Wells", value: "None on parcel", status: "safe" },
        { label: "Pipeline Easements", value: "None recorded", status: "safe" },
        { label: "Gathering Lines", value: "No conflicts", status: "safe" },
        { label: "Compressor Stations", value: "None within 1 mile", status: "safe" },
      ],
      details: [
        "No active oil or gas wells within 0.5 miles of subject property",
        "No plugged or abandoned wells identified on parcel - no orphan well concerns",
        "No recorded pipeline easements crossing property boundaries",
        "Property is outside major gathering system corridors",
        "No hydrogen sulfide (H2S) zones identified in vicinity",
      ],
      recommendations: [
        "Standard Phase I ESA will verify no historical petroleum activity",
        "No OCD setback restrictions apply to this parcel",
        "Development may proceed without oil & gas infrastructure conflicts",
      ],
    },
  ];

  // Helper to format flood risk
  const getFloodRiskDisplay = () => {
    if (!floodData) return { value: "Loading...", status: "neutral" as const };
    const risk = floodData.riskLevel;
    if (risk === "high") return { value: `Zone ${floodData.floodZone} (High Risk)`, status: "danger" as const };
    if (risk === "moderate") return { value: `Zone ${floodData.floodZone} (Moderate Risk)`, status: "caution" as const };
    return { value: `Zone ${floodData.floodZone} (Minimal Risk)`, status: "safe" as const };
  };

  // Helper to format EPA risk
  const getEPARiskDisplay = () => {
    if (!epaData) return { value: "Loading...", status: "neutral" as const };
    const risk = epaData.summary.overallRisk;
    if (risk === "high") return { value: "High Risk - Superfund nearby", status: "danger" as const };
    if (risk === "moderate") return { value: "Moderate - Facilities nearby", status: "caution" as const };
    return { value: "Low - No significant sites", status: "safe" as const };
  };

  const additionalFindings = [
    {
      icon: AlertOctagon,
      title: "FEMA Flood Assessment",
      items: [
        { 
          label: "Flood Zone", 
          value: floodData ? `Zone ${floodData.floodZone}` : (isLoadingEnvironmental ? "Loading..." : "N/A")
        },
        { 
          label: "Risk Level", 
          value: floodData ? floodData.riskLevel.charAt(0).toUpperCase() + floodData.riskLevel.slice(1) : "N/A"
        },
        { 
          label: "Special Flood Hazard Area", 
          value: floodData ? (floodData.sfha ? "Yes" : "No") : "N/A"
        },
        { 
          label: "Description", 
          value: floodData?.floodZoneDescription?.split(" - ")[0] || "N/A"
        },
      ]
    },
    {
      icon: Building,
      title: "EPA Environmental Hazards",
      items: [
        { 
          label: "Superfund Sites (1 mi)", 
          value: epaData ? epaData.summary.superfundWithin1Mile.toString() : (isLoadingEnvironmental ? "Loading..." : "N/A")
        },
        { 
          label: "Superfund Sites (5 mi)", 
          value: epaData ? epaData.summary.superfundWithin5Miles.toString() : "N/A"
        },
        { 
          label: "TRI Facilities (1 mi)", 
          value: epaData ? epaData.summary.triWithin1Mile.toString() : "N/A"
        },
        { 
          label: "Brownfield Sites (1 mi)", 
          value: epaData ? epaData.summary.brownfieldWithin1Mile.toString() : "N/A"
        },
      ]
    },
    {
      icon: Gauge,
      title: "Terrain & Elevation",
      items: [
        { 
          label: "Elevation", 
          value: elevationData ? `${elevationData.elevation.toLocaleString()} ft` : (isLoadingEnvironmental ? "Loading..." : "N/A")
        },
        { 
          label: "Slope", 
          value: elevationData ? `${elevationData.slope}% (${elevationData.slopeCategory})` : "N/A"
        },
        { 
          label: "Aspect", 
          value: elevationData?.aspect || "N/A"
        },
        { 
          label: "Drainage", 
          value: elevationData?.drainageClass?.split(" (")[0] || "N/A"
        },
      ]
    },
  ];

  // Development Suitability Add-Ons (Solar & Infrastructure) - now using real API data
  const developmentAddOns = {
    solar: {
      score: solarData?.solarPotential 
        ? solarData.solarPotential.charAt(0).toUpperCase() + solarData.solarPotential.slice(1) 
        : (isLoadingSolar ? "Loading..." : "Excellent"),
      hoursPerYear: solarData?.sunlightHoursPerYear || 3200,
      panelCapacity: solarData?.recommendedCapacityKw 
        ? `${solarData.recommendedCapacityKw} kW recommended` 
        : "8.0 kW recommended",
      annualSavings: solarData?.annualSavingsEstimate 
        ? `$${solarData.annualSavingsEstimate.toLocaleString()}/year estimated` 
        : "$1,840/year estimated",
      roofArea: solarData?.roofAreaSqFt 
        ? `${solarData.roofAreaSqFt.toLocaleString()} sq ft usable` 
        : "1,200 sq ft usable",
      source: solarData?.source || "Estimated",
    },
    infrastructure: {
      nearestFireStation: infrastructureData?.nearestFireStation || { name: isLoadingInfrastructure ? "Loading..." : "Data unavailable", distance: 0, isoClass: 0 },
      nearestPolice: infrastructureData?.nearestPolice || { name: isLoadingInfrastructure ? "Loading..." : "Data unavailable", distance: 0 },
      nearestHospital: infrastructureData?.nearestHospital || { name: isLoadingInfrastructure ? "Loading..." : "Data unavailable", distance: 0 },
      nearestSchool: infrastructureData?.nearestSchool || { name: isLoadingInfrastructure ? "Loading..." : "Data unavailable", distance: 0 },
      nearestGrocery: infrastructureData?.nearestGrocery || { name: isLoadingInfrastructure ? "Loading..." : "Data unavailable", distance: 0 },
      source: infrastructureData?.source || "Pending",
    },
  };

  // Soil findings section
  const soilFindings = {
    icon: TreePine,
    title: "USDA Soil Analysis",
    items: [
      { 
        label: "Soil Type", 
        value: soilData?.mapUnitName?.substring(0, 30) + (soilData?.mapUnitName && soilData.mapUnitName.length > 30 ? "..." : "") || (isLoadingEnvironmental ? "Loading..." : "N/A")
      },
      { 
        label: "Drainage Class", 
        value: soilData?.drainageClass || "N/A"
      },
      { 
        label: "Hydrologic Group", 
        value: soilData?.hydrologicGroup || "N/A"
      },
      { 
        label: "Building Suitability", 
        value: soilData ? soilData.buildingSuitability.charAt(0).toUpperCase() + soilData.buildingSuitability.slice(1) : "N/A"
      },
      { 
        label: "Septic Suitability", 
        value: soilData ? soilData.septicsuitability.charAt(0).toUpperCase() + soilData.septicsuitability.slice(1) : "N/A"
      },
      { 
        label: "Erosion Hazard", 
        value: soilData?.erosionHazard || "N/A"
      },
    ]
  };

  // Get location-aware regulatory contacts based on county and city
  const nearbyTribalLands = culturalData?.tribalLandsWithin5Miles?.map(t => t.name);
  const regulatoryContacts = getEssentialContacts(
    effectiveCounty,
    cityName,
    nearbyTribalLands
  ).map(formatContactForDisplay);

  return (
    <div className="min-h-screen bg-background">
      {/* Report Header */}
      <div className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logoImage} alt="Rio Grande Due Diligence" className="h-10 w-auto" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-xl font-semibold text-foreground">Rio Grande Due Diligence Report</h1>
                  {isSample && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                      SAMPLE
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Report ID: {reportData.reportId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={onReset}>
                New Search
              </Button>
              <Button 
                variant="hero" 
                size="sm" 
                className="shadow-glow"
                onClick={async () => {
                  toast.info("Generating PDF with satellite imagery...");
                  
                  // Fetch static satellite map with parcel boundary
                  let satelliteMapUrl: string | undefined;
                  if (coordinates?.lat && coordinates?.lng) {
                    try {
                      const mapData = await invokeFunction('static-map', { 
                        lat: coordinates.lat, 
                        lng: coordinates.lng,
                        parcelGeometry: propertyData?.parcelGeometry
                      });
                      if (mapData?.imageUrl) {
                        satelliteMapUrl = mapData.imageUrl;
                      }
                    } catch (err) {
                      console.error('Failed to fetch satellite map:', err);
                    }
                  }
                  
                  // Determine cultural status from data
                  const culturalStatus: "safe" | "caution" | "danger" = 
                    culturalData?.riskLevel === "high" || culturalData?.onTribalLand || culturalData?.inHistoricDistrict 
                      ? "danger" 
                      : culturalData?.riskLevel === "moderate" || culturalData?.section106Required 
                        ? "caution" 
                        : "safe";
                  
                  const pdfData: ReportData = {
                    address: reportData.address,
                    reportId: reportData.reportId,
                    generatedAt: reportData.generatedAt,
                    validUntil: reportData.validUntil,
                    parcelId: reportData.parcelId,
                    legalDescription: plssData?.legalDescription || reportData.legalDescription,
                    acreage: reportData.acreage,
                    zoning: reportData.zoning,
                    jurisdiction: reportData.jurisdiction,
                    county: reportData.county,
                    riskScore: riskScore,
                    culturalStatus,
                    waterStatus: "caution",
                    habitatStatus: "safe",
                    wellData: wellData || undefined,
                    lat: coordinates?.lat,
                    lng: coordinates?.lng,
                    parcelGeometry: propertyData?.parcelGeometry,
                    satelliteMapUrl,
                    culturalData: culturalData || undefined,
                    solarData: solarData ? {
                      sunlightHoursPerYear: solarData.sunlightHoursPerYear,
                      solarPotential: solarData.solarPotential,
                      annualSavingsEstimate: solarData.annualSavingsEstimate,
                      roofAreaSqFt: solarData.roofAreaSqFt,
                      recommendedCapacityKw: solarData.recommendedCapacityKw,
                      source: solarData.source,
                    } : undefined,
                    infrastructureData: infrastructureData ? {
                      nearestFireStation: infrastructureData.nearestFireStation,
                      nearestPolice: infrastructureData.nearestPolice,
                      nearestHospital: infrastructureData.nearestHospital,
                      nearestSchool: infrastructureData.nearestSchool,
                      nearestGrocery: infrastructureData.nearestGrocery,
                      source: infrastructureData.source,
                    } : undefined,
                    floodData: floodData ? {
                      floodZone: floodData.floodZone,
                      floodZoneDescription: floodData.floodZoneDescription,
                      sfha: floodData.sfha,
                      riskLevel: floodData.riskLevel,
                      source: floodData.source,
                    } : undefined,
                    epaData: epaData ? {
                      summary: epaData.summary,
                      source: epaData.source,
                    } : undefined,
                  };
                  downloadPDF(pdfData);
                  toast.success("PDF report opened for printing/download");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Executive Summary */}
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Info */}
            <div className="lg:col-span-2 p-6 rounded-xl bg-card border border-border shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">Subject Property</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-display text-xl font-semibold text-foreground mb-1">{reportData.address}</p>
                  <p className="text-sm text-muted-foreground mb-4">{reportData.county}, New Mexico</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Parcel Number</span>
                      <span className="font-mono text-foreground">
                        {isLoadingParcel ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                          </span>
                        ) : parcelData?.parcelNumber ? (
                          parcelData.parcelNumber
                        ) : (
                          <span className="text-muted-foreground italic">Not available</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Legal Description</span>
                      <span className="text-foreground text-right flex items-center gap-2 max-w-[200px]">
                        {isLoadingParcel ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                          </>
                        ) : parcelData?.legalDescription ? (
                          <span className="truncate" title={parcelData.legalDescription}>{parcelData.legalDescription}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Not available</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Parcel Size</span>
                      <span className="text-foreground">
                        {isLoadingParcel ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                          </span>
                        ) : typeof parcelData?.acreage === "number" ? (
                          `${parcelData.acreage.toFixed(2)} acres`
                        ) : (
                          <span className="text-muted-foreground italic">Not available</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Zoning</span>
                      <span className="text-foreground">
                        {isLoadingParcel ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                          </span>
                        ) : parcelData?.zoning ? (
                          parcelData.zoning
                        ) : (
                          <span className="text-muted-foreground italic">Not available</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Info Section */}
                <div>
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
                    <div className="flex items-center gap-2 text-xs text-primary mb-2">
                      <Users className="w-3 h-3" />
                      Property Owner
                    </div>
                    {isLoadingProperty ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground">Loading owner info...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-foreground">{reportData.owner}</p>
                        <p className="text-xs text-muted-foreground mt-1">{reportData.ownerAddress}</p>
                      </>
                    )}
                  </div>
                  
                  {/* Assessed Values */}
                  {propertyData && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Land Value</span>
                        <span className="text-foreground font-medium">${reportData.landValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Improvement Value</span>
                        <span className="text-foreground font-medium">${reportData.improvementValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-border/50">
                        <span className="text-muted-foreground">Total Assessed</span>
                        <span className="text-foreground font-semibold">${reportData.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Tax Year</span>
                        <span className="text-foreground">{reportData.taxYear}</span>
                      </div>
                    </div>
                  )}
                  
                  {!propertyData && !isLoadingProperty && (
                    <p className="text-xs text-muted-foreground italic">
                      Owner and value data not available for this county. County assessor integration may be limited.
                    </p>
                  )}
                </div>
              </div>
              
              {/* Report metadata row */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-border">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3 h-3" />
                    Report Generated
                  </div>
                  <p className="text-sm font-medium text-foreground">{reportData.generatedAt}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" />
                    Valid Until
                  </div>
                  <p className="text-sm font-medium text-foreground">{reportData.validUntil}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <BookOpen className="w-3 h-3" />
                    Data Source
                  </div>
                  <p className="text-sm font-medium text-foreground truncate" title={reportData.dataSource}>{reportData.dataSource}</p>
                </div>
              </div>
            </div>

            {/* Risk Score */}
            <div className="p-6 rounded-xl bg-card border border-border shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-lg font-semibold text-foreground">Risk Summary</h2>
              </div>

              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-[hsl(var(--status-caution))] bg-[hsl(var(--status-caution-bg))]">
                  <span className="text-3xl font-bold text-[hsl(var(--status-caution))]">{riskScore}</span>
                </div>
                <p className="text-sm font-semibold text-[hsl(var(--status-caution))] mt-2">MODERATE RISK</p>
                <p className="text-xs text-muted-foreground mt-1">Environmental Compliance Score</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Landmark className={`w-4 h-4 ${
                      culturalData?.onTribalLand || culturalData?.inHistoricDistrict 
                        ? "text-[hsl(var(--status-danger))]" 
                        : culturalData?.riskLevel === "moderate" 
                          ? "text-[hsl(var(--status-caution))]" 
                          : "text-[hsl(var(--status-safe))]"
                    }`} />
                    Cultural
                  </span>
                  <span className={`font-semibold ${
                    culturalData?.onTribalLand || culturalData?.inHistoricDistrict 
                      ? "text-[hsl(var(--status-danger))]" 
                      : culturalData?.riskLevel === "moderate" 
                        ? "text-[hsl(var(--status-caution))]" 
                        : "text-[hsl(var(--status-safe))]"
                  }`}>
                    {culturalData?.onTribalLand || culturalData?.inHistoricDistrict 
                      ? "High Risk" 
                      : culturalData?.riskLevel === "moderate" 
                        ? "Caution" 
                        : "Clear"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-[hsl(var(--status-caution))]" />
                    Water
                  </span>
                  <span className="font-semibold text-[hsl(var(--status-caution))]">Caution</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <TreePine className="w-4 h-4 text-[hsl(var(--status-safe))]" />
                    Habitat
                  </span>
                  <span className="font-semibold text-[hsl(var(--status-safe))]">Clear</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Alerts - Only show if actually on tribal land or in historic district */}
        {(culturalData?.onTribalLand || culturalData?.inHistoricDistrict) && (
          <section className="mb-10">
            <div className="p-5 rounded-xl bg-[hsl(var(--status-danger-bg))] border border-[hsl(var(--status-danger)/0.3)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-danger)/0.2)] flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-danger))]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[hsl(var(--status-danger))] mb-1">Priority Action Required</h3>
                  <p className="text-sm text-foreground mb-3">
                    {culturalData?.onTribalLand 
                      ? `This property is located on ${culturalData.nearestTribalLand?.name || 'tribal'} land. Formal tribal consultation and approval is required before any development activities.`
                      : `This property is within ${culturalData?.historicDistrictName || 'a historic district'}. SHPO review is required for any exterior modifications or ground disturbance.`
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-background border border-border">
                      Est. Survey Cost: $3,000-$8,000
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-background border border-border">
                      Timeline: 4-8 weeks
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-background border border-border">
                      SHPO Review: 30 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Main Assessment Cards */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Detailed Compliance Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statusCards.map((card, index) => (
              <StatusCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Interactive Map & Risk Radar */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map - 2/3 width */}
            <div className="lg:col-span-2 rounded-lg bg-card border border-border overflow-hidden">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <Map className="w-3 h-3 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-mono font-bold text-foreground uppercase tracking-wider">GIS Spatial Analysis</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                  <Info className="w-3 h-3" />
                  Click zones for details
                </div>
              </div>
              <div className="relative">
                <MapLayerControl />
                <GISMap address={address} onWellDataLoaded={handleWellDataLoaded} parcelGeometry={propertyData?.parcelGeometry} />
              </div>
            </div>
            
            {/* Risk Radar & Export - 1/3 width */}
            <div className="space-y-4">
              <RiskRadarChart 
                riskData={{
                  historic: culturalData?.riskLevel === "high" ? 85 : culturalData?.riskLevel === "moderate" ? 55 : 20,
                  water: 55,
                  bio: 15,
                  flood: floodData?.riskLevel === "high" ? 80 : floodData?.riskLevel === "moderate" ? 50 : 15,
                  slope: elevationData?.slope ? Math.min(elevationData.slope * 10, 100) : 25,
                  soil: soilData?.buildingSuitability === "Poor" ? 70 : soilData?.buildingSuitability === "Moderate" ? 45 : 20,
                  fire: 35,
                }}
              />
              <ExportPackage 
                onExportPDF={() => {
                  const pdfData: ReportData = {
                    address: reportData.address,
                    parcelId: reportData.parcelId,
                    legalDescription: reportData.legalDescription,
                    acreage: reportData.acreage,
                    zoning: reportData.zoning,
                    owner: reportData.owner,
                    ownerAddress: reportData.ownerAddress,
                    generatedAt: reportData.generatedAt,
                    validUntil: reportData.validUntil,
                    dataSource: reportData.dataSource,
                    landValue: reportData.landValue,
                    improvementValue: reportData.improvementValue,
                    totalValue: reportData.totalValue,
                    taxYear: reportData.taxYear,
                    coordinates,
                    wellData: wellData || undefined,
                    culturalData: culturalData ? {
                      nearestTribalLand: culturalData.nearestTribalLand,
                      tribalLandsWithin5Miles: culturalData.tribalLandsWithin5Miles,
                      onTribalLand: culturalData.onTribalLand,
                      tribalConsultationRequired: culturalData.tribalConsultationRequired,
                      tribalConsultationReason: culturalData.tribalConsultationReason,
                      nrhpPropertiesWithin1Mile: culturalData.nrhpPropertiesWithin1Mile,
                      nearestNRHPProperty: culturalData.nearestNRHPProperty,
                      inHistoricDistrict: culturalData.inHistoricDistrict,
                      historicDistrictName: culturalData.historicDistrictName,
                      riskLevel: culturalData.riskLevel,
                      section106Required: culturalData.section106Required,
                      recommendedActions: culturalData.recommendedActions,
                      source: culturalData.source,
                    } : undefined,
                    solarData: solarData ? {
                      sunlightHoursPerYear: solarData.sunlightHoursPerYear,
                      maxArrayPanelsCount: solarData.maxArrayPanelsCount,
                      maxArrayAreaMeters2: solarData.maxArrayAreaMeters2,
                      solarPotential: solarData.solarPotential,
                      annualSavingsEstimate: solarData.annualSavingsEstimate,
                      roofAreaSqFt: solarData.roofAreaSqFt,
                      recommendedCapacityKw: solarData.recommendedCapacityKw,
                      source: solarData.source,
                    } : undefined,
                    infrastructureData: infrastructureData ? {
                      nearestFireStation: infrastructureData.nearestFireStation,
                      nearestPolice: infrastructureData.nearestPolice,
                      nearestHospital: infrastructureData.nearestHospital,
                      nearestSchool: infrastructureData.nearestSchool,
                      nearestGrocery: infrastructureData.nearestGrocery,
                      source: infrastructureData.source,
                    } : undefined,
                    floodData: floodData ? {
                      floodZone: floodData.floodZone,
                      floodZoneDescription: floodData.floodZoneDescription,
                      sfha: floodData.sfha,
                      riskLevel: floodData.riskLevel,
                      source: floodData.source,
                    } : undefined,
                    epaData: epaData ? {
                      summary: epaData.summary,
                      source: epaData.source,
                    } : undefined,
                  };
                  downloadPDF(pdfData);
                  toast.success("PDF report opened for printing/download");
                }}
              />
            </div>
          </div>
        </section>

        {/* Additional Findings */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Supplementary Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {additionalFindings.map((section, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Property Records from Regrid */}
        {(parcelData?.found || isLoadingParcel) && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Property Records</h2>
            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">County Assessor Records</h3>
                  <p className="text-xs text-muted-foreground">Powered by Regrid Parcel Data</p>
                </div>
              </div>
              
              {isLoadingParcel ? (
                <div className="flex items-center justify-center py-8 gap-2 text-emerald-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading property records...</span>
                </div>
              ) : parcelData?.found ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-emerald-500/20">
                      <span className="text-muted-foreground">Parcel Number</span>
                      <span className="text-foreground font-mono text-sm">{parcelData.parcelNumber || 'N/A'}</span>
                    </div>
                    {parcelData.owner && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Owner</span>
                        <span className="text-foreground font-medium">{parcelData.owner}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-emerald-500/20">
                      <span className="text-muted-foreground">County</span>
                      <span className="text-foreground font-medium capitalize">{parcelData.county?.replace(/-/g, ' ') || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-emerald-500/20">
                      <span className="text-muted-foreground">Acreage</span>
                      <span className="text-foreground font-medium">{parcelData.acreage?.toFixed(2) || 'N/A'} acres</span>
                    </div>
                    {parcelData.zoning && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Zoning</span>
                        <span className="text-foreground font-medium">{parcelData.zoning}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {parcelData.assessedValue && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Assessed Value</span>
                        <span className="text-emerald-500 font-semibold">${parcelData.assessedValue.toLocaleString()}</span>
                      </div>
                    )}
                    {parcelData.landValue && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Land Value</span>
                        <span className="text-foreground font-medium">${parcelData.landValue.toLocaleString()}</span>
                      </div>
                    )}
                    {parcelData.improvementValue && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Improvement Value</span>
                        <span className="text-foreground font-medium">${parcelData.improvementValue.toLocaleString()}</span>
                      </div>
                    )}
                    {parcelData.qoz && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Opportunity Zone</span>
                        <span className="text-emerald-500 font-semibold">✓ Qualified</span>
                      </div>
                    )}
                    {parcelData.censusTract && (
                      <div className="flex justify-between py-2 border-b border-emerald-500/20">
                        <span className="text-muted-foreground">Census Tract</span>
                        <span className="text-foreground font-mono text-sm">{parcelData.censusTract}</span>
                      </div>
                    )}
                  </div>
                  {parcelData.legalDescription && (
                    <div className="col-span-full">
                      <p className="text-muted-foreground text-sm mb-1">Legal Description</p>
                      <p className="text-foreground text-sm font-mono bg-muted/30 p-3 rounded">{parcelData.legalDescription}</p>
                    </div>
                  )}
                  {parcelData.zoningDescription && (
                    <div className="col-span-full">
                      <p className="text-muted-foreground text-sm mb-1">Zoning Description</p>
                      <p className="text-foreground text-sm">{parcelData.zoningDescription}</p>
                    </div>
                  )}
                  <div className="col-span-full flex justify-between items-center pt-2 border-t border-emerald-500/20">
                    <span className="text-xs text-muted-foreground">Source: {parcelData.source} • Updated: {parcelData.lastUpdated || 'N/A'}</span>
                    {parcelData.assessorUrl && (
                      <a 
                        href={parcelData.assessorUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-500 hover:underline flex items-center gap-1"
                      >
                        View County Assessor Record →
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}

        {/* Development Suitability Add-Ons */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Development Suitability Add-Ons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solar Potential Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Google Solar Analysis</h3>
                  <p className="text-xs text-muted-foreground">Powered by Google Solar API</p>
                </div>
              </div>
              
              <div className="text-center py-4 mb-4">
                {isLoadingSolar ? (
                  <div className="flex items-center justify-center gap-2 text-amber-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing solar potential...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-bold text-amber-500">{developmentAddOns.solar.hoursPerYear.toLocaleString()}</p>
                    <p className="text-sm text-amber-600/80">hours/year sunlight</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-xs font-semibold uppercase">
                      {developmentAddOns.solar.score} Solar Potential
                    </span>
                  </>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-amber-500/20">
                  <span className="text-muted-foreground">Recommended Capacity</span>
                  <span className="text-foreground font-medium">{developmentAddOns.solar.panelCapacity}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-500/20">
                  <span className="text-muted-foreground">Est. Annual Savings</span>
                  <span className="text-amber-500 font-semibold">{developmentAddOns.solar.annualSavings}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-amber-500/20">
                  <span className="text-muted-foreground">Usable Roof Area</span>
                  <span className="text-foreground font-medium">{developmentAddOns.solar.roofArea}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground text-xs">Source</span>
                  <span className="text-foreground text-xs">{developmentAddOns.solar.source}</span>
                </div>
              </div>
            </div>

            {/* Infrastructure Proximity Card */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">Infrastructure Proximity</h3>
                  <p className="text-xs text-muted-foreground">Straight-line distances • Powered by Google Places API</p>
                </div>
              </div>
              
              <div className="text-center py-4 mb-4">
                {isLoadingInfrastructure ? (
                  <div className="flex items-center justify-center gap-2 text-blue-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Finding nearby services...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-lg font-semibold text-foreground">{developmentAddOns.infrastructure.nearestFireStation.name}</p>
                    <p className="text-2xl font-bold text-blue-500">{developmentAddOns.infrastructure.nearestFireStation.distance} mi</p>
                    {developmentAddOns.infrastructure.nearestFireStation.isoClass > 0 && (
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-500 text-xs font-semibold uppercase">
                        ISO Class {developmentAddOns.infrastructure.nearestFireStation.isoClass}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-blue-500/20">
                  <span className="text-muted-foreground">Nearest Fire Station</span>
                  <span className="text-foreground font-medium">{developmentAddOns.infrastructure.nearestFireStation.distance} mi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-500/20">
                  <span className="text-muted-foreground">Nearest Police</span>
                  <span className="text-foreground font-medium">{developmentAddOns.infrastructure.nearestPolice.distance} mi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-500/20">
                  <span className="text-muted-foreground">Nearest Hospital</span>
                  <span className="text-foreground font-medium">{developmentAddOns.infrastructure.nearestHospital.distance} mi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-500/20">
                  <span className="text-muted-foreground">Nearest School</span>
                  <span className="text-foreground font-medium">{developmentAddOns.infrastructure.nearestSchool.distance} mi</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-500/20">
                  <span className="text-muted-foreground">Nearest Grocery</span>
                  <span className="text-foreground font-medium">{developmentAddOns.infrastructure.nearestGrocery.distance} mi</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground text-xs">Source</span>
                  <span className="text-foreground text-xs">{developmentAddOns.infrastructure.source}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regulatory Contacts */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Regulatory Agency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regulatoryContacts.map((contact, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{contact.agency}</p>
                  <p className="text-sm text-muted-foreground">{contact.purpose}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Phone className="w-4 h-4" />
                  <span>{contact.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Soil Data Section */}
        {soilData && (
          <section className="mb-10">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Soil & Construction Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <TreePine className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Soil Properties</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {soilFindings.items.map((item, i) => (
                    <div key={i} className="flex justify-between py-1 border-b border-border/50 last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-foreground font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Building className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">Construction Considerations</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Limitations</p>
                    <p className="text-foreground">{soilData.constructionLimitations}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Depth to Water Table</p>
                    <p className="text-foreground">{soilData.depthToWaterTable}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Primary Texture</p>
                    <p className="text-foreground">{soilData.texturePrimary}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Slope Range</p>
                    <p className="text-foreground">{soilData.slopeRange}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Data Sources */}
        <section className="mb-10">
          <div className="p-6 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground">Data Sources & Methodology</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Cultural Resources</p>
                <p>NMCRIS Database (ARMS), NM SHPO Records, National Register of Historic Places</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Water & Flood</p>
                <p>NM OSE WATERS, FEMA NFHL, Declared Basin Records</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Environmental</p>
                <p>EPA Envirofacts, USFWS Critical Habitat, NWI, IPaC Database</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Terrain & Soil</p>
                <p>Google Elevation API, USDA NRCS SSURGO Web Soil Survey</p>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section>
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Legal Disclaimer & Limitations</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  This Environmental Due Diligence Report is generated from publicly available data sources and is intended for 
                  preliminary assessment purposes only. It does not constitute a Phase I Environmental Site Assessment (ESA) under 
                  ASTM E1527-21, nor does it replace formal consultation with regulatory agencies. Data accuracy is dependent on 
                  source agency updates and may not reflect the most recent filings or determinations.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rio Grande Due Diligence LLC makes no warranties, express or implied, regarding the completeness or accuracy of 
                  this report. Users should verify all findings with the appropriate regulatory agencies before making development 
                  decisions. This report is valid for 90 days from the date of generation. For official determinations, contact 
                  the relevant state and federal agencies directly.
                </p>
                <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>Report Version: 2.1</span>
                  <span>•</span>
                  <span>Generated by: Rio Grande Due Diligence Platform</span>
                  <span>•</span>
                  <span>License: Single-use, non-transferable</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResultsDashboard;
