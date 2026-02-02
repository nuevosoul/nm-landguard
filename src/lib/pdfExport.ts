// PDF Export functionality - Comprehensive 17-Pillar Report
// Version 3.0 - Full Livability Analysis

export interface WellData {
  objectId: number;
  lat: number;
  lng: number;
  podType: string;
  podId: string;
  waterUse: string;
  status: string;
  permitNumber: string;
  distance: number;
}

export interface WellDataSummary {
  totalWells: number;
  withinHalfMile: number;
  withinOneMile: number;
  byType: Record<string, number>;
  byUse: Record<string, number>;
}

export interface CulturalResourcesData {
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

export interface SolarData {
  sunlightHoursPerYear: number;
  maxArrayPanelsCount?: number;
  maxArrayAreaMeters2?: number;
  solarPotential: "excellent" | "good" | "fair" | "poor";
  annualSavingsEstimate: number;
  roofAreaSqFt: number;
  recommendedCapacityKw: number;
  source: string;
}

export interface InfrastructureData {
  nearestFireStation: { name: string; distance: number; driveTime?: number; driveDistance?: number; isoClass?: number };
  nearestPolice: { name: string; distance: number; driveTime?: number; driveDistance?: number };
  nearestHospital: { name: string; distance: number; driveTime?: number; driveDistance?: number };
  nearestSchool: { name: string; distance: number; driveTime?: number; driveDistance?: number };
  nearestGrocery: { name: string; distance: number; driveTime?: number; driveDistance?: number };
  source: string;
}

export interface FloodData {
  floodZone: string;
  floodZoneDescription: string;
  sfha: boolean;
  riskLevel: "high" | "moderate" | "low" | "minimal";
  source: string;
}

export interface EPAData {
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

// NEW: Livability Data Interfaces
export interface AirQualityData {
  aqi: number;
  category: string;
  dominantPollutant: string;
  pm25: number;
  pm10?: number;
  ozone?: number;
  no2?: number;
  healthRecommendations?: string;
  source: string;
}

export interface PollenData {
  grassPollen: { level: string; index: number };
  treePollen: { level: string; index: number };
  weedPollen: { level: string; index: number };
  overallLevel: string;
  season: string;
  source: string;
}

export interface WeatherData {
  avgHighSummer: number;
  avgLowWinter: number;
  annualPrecipitation: number;
  annualSnowfall: number;
  sunnyDaysPerYear: number;
  growingSeasonDays: number;
  climate: string;
  source: string;
}

export interface CellCoverageData {
  overallCoverage: "excellent" | "good" | "fair" | "poor" | "none";
  carriers: { name: string; coverage: string; has5G: boolean }[];
  rural: boolean;
  source: string;
}

export interface BroadbandData {
  maxDownload: number;
  maxUpload: number;
  technologies: string[];
  providers: { name: string; maxSpeed: number; technology: string }[];
  fiberAvailable: boolean;
  starlinkEligible: boolean;
  source: string;
}

export interface DarkSkyData {
  bortleClass: number;
  bortleDescription: string;
  sqm: number;
  milkyWayVisible: boolean;
  lightPollutionLevel: "pristine" | "dark" | "rural" | "suburban" | "urban" | "bright";
  nearestDarkSkyPark?: string;
  source: string;
}

export interface NoiseLevelData {
  overallLevel: "quiet" | "moderate" | "noisy";
  estimatedDecibels: number;
  nearestHighway?: { name: string; distance: number };
  nearestAirport?: { name: string; distance: number; type: string };
  nearestRailroad?: { distance: number };
  flightPath: boolean;
  source: string;
}

export interface StreetViewData {
  available: boolean;
  imageUrl?: string;
  heading?: number;
  pitch?: number;
  source: string;
}

export interface ElevationData {
  elevation: number;
  slope?: number;
  aspect?: string;
  source: string;
}

export interface OwnerData {
  name: string;
  mailingAddress?: string;
  ownershipType?: string;
}

export interface PropertyValueData {
  landValue: number;
  improvementValue: number;
  totalValue: number;
  taxYear: string;
}

export interface ReportData {
  address: string;
  reportId?: string;
  generatedAt: string;
  validUntil: string;
  parcelId: string;
  legalDescription: string;
  acreage: string;
  zoning: string;
  jurisdiction?: string;
  county?: string;
  riskScore?: number;
  culturalStatus?: "safe" | "caution" | "danger";
  waterStatus?: "safe" | "caution" | "danger";
  habitatStatus?: "safe" | "caution" | "danger";
  // Owner info
  owner?: string;
  ownerAddress?: string;
  ownerData?: OwnerData;
  propertyValues?: PropertyValueData;
  dataSource?: string;
  landValue?: number;
  improvementValue?: number;
  totalValue?: number;
  taxYear?: string;
  coordinates?: { lat: number; lng: number } | null;
  // OSE Well Data
  wellData?: {
    wells: WellData[];
    summary: WellDataSummary;
  };
  // Map coordinates
  lat?: number;
  lng?: number;
  // Parcel geometry for satellite map
  parcelGeometry?: number[][][] | null;
  // Pre-generated satellite map URL (base64)
  satelliteMapUrl?: string;
  streetViewUrl?: string;
  // Core Environmental Data
  culturalData?: CulturalResourcesData;
  solarData?: SolarData;
  infrastructureData?: InfrastructureData;
  floodData?: FloodData;
  epaData?: EPAData;
  elevationData?: ElevationData;
  // NEW: Livability Data
  airQualityData?: AirQualityData;
  pollenData?: PollenData;
  weatherData?: WeatherData;
  cellCoverageData?: CellCoverageData;
  broadbandData?: BroadbandData;
  darkSkyData?: DarkSkyData;
  noiseLevelData?: NoiseLevelData;
  streetViewData?: StreetViewData;
}

// Helper function for status colors
const getStatusStyle = (status: "safe" | "caution" | "danger" | "neutral" = "neutral") => {
  const styles = {
    safe: { bg: "#dcfce7", text: "#166534", border: "#4ade80" },
    caution: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
    danger: { bg: "#fee2e2", text: "#991b1b", border: "#f87171" },
    neutral: { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" },
  };
  return styles[status];
};

// Helper to format numbers with commas
const formatNumber = (num: number): string => num.toLocaleString();

// Helper to format currency
const formatCurrency = (num: number): string => `$${num.toLocaleString()}`;

export function generatePDFContent(data: ReportData): string {
  const statusColors = {
    safe: { bg: "#dcfce7", text: "#166534", label: "Clear" },
    caution: { bg: "#fef3c7", text: "#92400e", label: "Caution" },
    danger: { bg: "#fee2e2", text: "#991b1b", label: "High Risk" },
  };

  const culturalConfig = statusColors[data.culturalStatus || "caution"];
  const waterConfig = statusColors[data.waterStatus || "caution"];
  const habitatConfig = statusColors[data.habitatStatus || "safe"];

  // Calculate pillar count
  const pillarCount = 17;
  
  // Generate all sections
  const sections = {
    propertyViews: generatePropertyViewsSection(data),
    ownerInfo: generateOwnerSection(data),
    executiveSummary: generateExecutiveSummary(data),
    cultural: generateCulturalSection(data.culturalData, culturalConfig),
    water: generateWaterSection(data, waterConfig),
    wells: data.wellData ? generateWellSection(data.wellData) : '',
    habitat: generateHabitatSection(habitatConfig),
    flood: data.floodData ? generateFloodSection(data.floodData) : '',
    epa: data.epaData ? generateEPASection(data.epaData) : '',
    solar: data.solarData ? generateSolarSection(data.solarData) : '',
    infrastructure: data.infrastructureData ? generateInfrastructureSection(data.infrastructureData) : '',
    airQuality: data.airQualityData ? generateAirQualitySection(data.airQualityData) : '',
    pollen: data.pollenData ? generatePollenSection(data.pollenData) : '',
    weather: data.weatherData ? generateWeatherSection(data.weatherData) : '',
    cellCoverage: data.cellCoverageData ? generateCellCoverageSection(data.cellCoverageData) : '',
    broadband: data.broadbandData ? generateBroadbandSection(data.broadbandData) : '',
    darkSky: data.darkSkyData ? generateDarkSkySection(data.darkSkyData) : '',
    noise: data.noiseLevelData ? generateNoiseSection(data.noiseLevelData) : '',
    elevation: data.elevationData ? generateElevationSection(data.elevationData) : '',
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rio Grande Due Diligence Report - ${data.reportId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page {
      size: letter;
      margin: 0.5in;
    }
    
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
      color: #1e293b;
      line-height: 1.5;
      background: white;
      font-size: 11px;
    }
    
    .page { 
      padding: 30px 40px; 
      max-width: 850px; 
      margin: 0 auto;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }
    
    /* Header Styles */
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      border-bottom: 3px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .logo { 
      font-size: 22px; 
      font-weight: 700; 
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .logo-accent { color: #d97706; }
    .logo-sub { 
      font-size: 10px; 
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 2px;
    }
    .report-meta { text-align: right; }
    .report-id { 
      font-size: 12px; 
      font-weight: 600;
      color: #0f172a;
      font-family: 'SF Mono', Monaco, monospace;
    }
    .report-date { font-size: 10px; color: #64748b; margin-top: 2px; }
    .report-validity {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 8px;
      background: #dbeafe;
      color: #1e40af;
      font-size: 9px;
      font-weight: 600;
      border-radius: 4px;
      text-transform: uppercase;
    }
    
    /* Title */
    .report-title {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .report-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 20px;
    }
    
    /* Property Section */
    .property-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .property-address { 
      font-size: 16px; 
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }
    .property-county { 
      font-size: 12px; 
      color: #64748b;
      margin-bottom: 16px;
    }
    .property-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 24px;
    }
    .property-item { 
      display: flex; 
      justify-content: space-between; 
      font-size: 11px;
      padding: 6px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .property-label { color: #64748b; }
    .property-value { font-weight: 600; color: #0f172a; }
    
    /* Section Headers */
    h2 { 
      font-size: 14px; 
      font-weight: 700;
      color: #0f172a; 
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    h3 { 
      font-size: 12px; 
      font-weight: 600;
      color: #334155; 
      margin: 14px 0 8px;
    }
    
    /* Executive Summary */
    .exec-summary {
      background: #0f172a;
      color: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .exec-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .exec-title {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .pillar-count {
      background: #d97706;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
    }
    .risk-display {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 16px;
    }
    .risk-score-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
    }
    .risk-score-value { 
      font-size: 28px; 
      font-weight: 800; 
      color: #0f172a;
      line-height: 1;
    }
    .risk-score-label { 
      font-size: 8px; 
      color: #0f172a;
      text-transform: uppercase;
      font-weight: 600;
    }
    .risk-categories {
      flex: 1;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    .risk-cat {
      padding: 8px 10px;
      border-radius: 6px;
      text-align: center;
    }
    .risk-cat-label { font-size: 9px; opacity: 0.9; margin-bottom: 2px; }
    .risk-cat-value { font-size: 11px; font-weight: 700; }
    .risk-safe { background: rgba(34, 197, 94, 0.2); }
    .risk-caution { background: rgba(251, 191, 36, 0.2); }
    .risk-danger { background: rgba(239, 68, 68, 0.2); }
    
    .pillar-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
    }
    .pillar-item {
      background: rgba(255,255,255,0.1);
      padding: 6px 4px;
      border-radius: 4px;
      text-align: center;
      font-size: 8px;
    }
    .pillar-icon { font-size: 14px; margin-bottom: 2px; }
    .pillar-name { opacity: 0.8; }
    .pillar-status { 
      margin-top: 2px;
      font-weight: 600;
      font-size: 7px;
      text-transform: uppercase;
    }
    .pillar-ok { color: #4ade80; }
    .pillar-warn { color: #fbbf24; }
    .pillar-alert { color: #f87171; }
    
    /* Finding Cards */
    .finding-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .finding-title { 
      font-weight: 700; 
      color: #0f172a;
      font-size: 12px;
    }
    .status-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .finding-items { display: grid; gap: 4px; }
    .finding-item {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding: 5px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .finding-item:last-child { border-bottom: none; }
    .finding-label { color: #64748b; }
    .finding-value { font-weight: 600; color: #0f172a; }
    
    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 14px 0;
    }
    .stat-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 8px;
      text-align: center;
    }
    .stat-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.1;
    }
    .stat-label {
      font-size: 8px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 2px;
    }
    .stat-good .stat-value { color: #16a34a; }
    .stat-warn .stat-value { color: #d97706; }
    .stat-bad .stat-value { color: #dc2626; }
    
    /* Recommendations */
    .recommendations {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border: 1px solid #fbbf24;
      border-radius: 8px;
      padding: 12px;
      margin-top: 12px;
    }
    .recommendations h4 {
      font-size: 9px;
      color: #92400e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      font-weight: 700;
    }
    .recommendations ol {
      margin-left: 14px;
      color: #78350f;
    }
    .recommendations li {
      font-size: 10px;
      margin-bottom: 3px;
    }
    
    /* Data Source */
    .data-source {
      margin-top: 10px;
      padding: 8px 10px;
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      font-size: 9px;
    }
    .data-source-title {
      font-weight: 700;
      color: #0369a1;
      margin-bottom: 2px;
    }
    .data-source-text { color: #0c4a6e; }
    
    /* Alert Boxes */
    .alert-box {
      padding: 10px 12px;
      border-radius: 6px;
      margin-top: 10px;
      font-size: 10px;
    }
    .alert-success {
      background: #dcfce7;
      border: 1px solid #4ade80;
      color: #166534;
    }
    .alert-warning {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      color: #92400e;
    }
    .alert-danger {
      background: #fee2e2;
      border: 1px solid #f87171;
      color: #991b1b;
    }
    .alert-info {
      background: #dbeafe;
      border: 1px solid #60a5fa;
      color: #1e40af;
    }
    .alert-title {
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9px;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    /* Map Section */
    .map-section {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 16px 0;
    }
    .map-header {
      background: #0f172a;
      color: white;
      padding: 10px 14px;
      font-size: 11px;
      font-weight: 700;
    }
    .map-container {
      height: 200px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .map-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .map-footer {
      font-size: 9px;
      color: #64748b;
      padding: 8px 14px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    /* Property Views (Street View + Satellite) */
    .views-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 16px 0;
    }
    .view-card {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .view-header {
      background: #334155;
      color: white;
      padding: 8px 12px;
      font-size: 10px;
      font-weight: 600;
    }
    .view-image {
      height: 150px;
      background: #1e293b;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-size: 10px;
    }
    .view-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin: 10px 0;
    }
    .data-table th {
      background: #0f172a;
      color: white;
      padding: 8px 10px;
      text-align: left;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .data-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table tr:nth-child(even) { background: #f8fafc; }
    
    /* Owner Section */
    .owner-card {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 1px solid #93c5fd;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .owner-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .owner-section h4 {
      font-size: 10px;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .owner-value {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .value-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #bfdbfe;
      font-size: 10px;
    }
    .value-row:last-child { border-bottom: none; }
    .value-label { color: #3b82f6; }
    .value-amount { font-weight: 700; color: #0f172a; }
    
    /* Livability Section Styles */
    .livability-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .livability-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .livability-icon {
      font-size: 24px;
      margin-right: 10px;
    }
    .livability-title {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .livability-subtitle {
      font-size: 9px;
      color: #64748b;
    }
    
    /* Two Column Layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    /* Footer */
    .disclaimer {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-top: 24px;
      font-size: 9px;
      color: #64748b;
    }
    .disclaimer h4 { 
      font-size: 10px; 
      color: #334155; 
      margin-bottom: 6px;
      font-weight: 700;
    }
    
    .footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #0f172a;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9px;
      color: #64748b;
    }
    .footer-brand {
      font-weight: 700;
      color: #0f172a;
    }
    
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <!-- PAGE 1: Cover & Executive Summary -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Comprehensive Property Intelligence Report</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
        <div class="report-date">Generated: ${data.generatedAt}</div>
        <div class="report-validity">Valid through ${data.validUntil}</div>
      </div>
    </div>
    
    <div class="property-card">
      <div class="property-address">${data.address}</div>
      <div class="property-county">${data.county || 'New Mexico'}, New Mexico</div>
      <div class="property-grid">
        <div class="property-item">
          <span class="property-label">Parcel ID (APN)</span>
          <span class="property-value">${data.parcelId || 'Research Required'}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Zoning</span>
          <span class="property-value">${data.zoning || 'Verify with County'}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Parcel Size</span>
          <span class="property-value">${data.acreage || 'Research Required'}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Jurisdiction</span>
          <span class="property-value">${data.jurisdiction || data.county || 'County'}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Coordinates</span>
          <span class="property-value">${data.lat?.toFixed(5) || '--'}°N, ${data.lng ? Math.abs(data.lng).toFixed(5) : '--'}°W</span>
        </div>
        <div class="property-item">
          <span class="property-label">Legal Description</span>
          <span class="property-value">${data.legalDescription || 'See County Records'}</span>
        </div>
      </div>
    </div>
    
    ${sections.executiveSummary}
    
    ${sections.ownerInfo}
  </div>
  
  <!-- PAGE 2: Property Views & Location -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Property Views & Location Analysis</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.propertyViews}
  </div>
  
  <!-- PAGE 3: Environmental Compliance -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Environmental Compliance Analysis</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.cultural}
    
    ${sections.habitat}
  </div>
  
  <!-- PAGE 4: Water Resources -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Water Resources Analysis</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.water}
    
    ${sections.wells}
  </div>
  
  <!-- PAGE 5: Hazards & Risk -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Natural Hazards & Environmental Risk</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.flood}
    
    ${sections.epa}
  </div>
  
  <!-- PAGE 6: Infrastructure & Services -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Infrastructure & Emergency Services</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.infrastructure}
    
    ${sections.solar}
  </div>
  
  <!-- PAGE 7: Livability - Air & Climate -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Livability Analysis — Air Quality & Climate</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.airQuality}
    
    ${sections.pollen}
    
    ${sections.weather}
  </div>
  
  <!-- PAGE 8: Livability - Connectivity -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Livability Analysis — Connectivity & Quiet</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    ${sections.cellCoverage}
    
    ${sections.broadband}
    
    <div class="two-col">
      ${sections.darkSky}
      ${sections.noise}
    </div>
  </div>
  
  <!-- PAGE 9: Disclaimer & Methodology -->
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande <span class="logo-accent">Due Diligence</span></div>
        <div class="logo-sub">Data Sources & Methodology</div>
      </div>
      <div class="report-meta">
        <div class="report-id">${data.reportId || 'RGDD-REPORT'}</div>
      </div>
    </div>
    
    <h2>Data Sources & Methodology</h2>
    
    <div class="finding-card">
      <div class="finding-title" style="margin-bottom: 12px;">This report aggregates data from ${pillarCount} authoritative sources:</div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Data Source</th>
            <th>Update Frequency</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Parcel Data</td><td>Regrid National Parcel Database, County Assessors</td><td>Monthly</td></tr>
          <tr><td>Cultural Resources</td><td>BIA AIAN, Census TIGER, NPS NRHP</td><td>Annual</td></tr>
          <tr><td>Water Rights</td><td>NM Office of State Engineer POD Database</td><td>Real-time</td></tr>
          <tr><td>Flood Zones</td><td>FEMA National Flood Hazard Layer</td><td>As updated</td></tr>
          <tr><td>Environmental</td><td>EPA Envirofacts, FRS, CERCLIS</td><td>Quarterly</td></tr>
          <tr><td>Solar Potential</td><td>Google Solar API, Project Sunroof</td><td>Annual</td></tr>
          <tr><td>Infrastructure</td><td>Google Places API, Distance Matrix</td><td>Real-time</td></tr>
          <tr><td>Air Quality</td><td>Google Air Quality API, EPA AirNow</td><td>Hourly</td></tr>
          <tr><td>Pollen</td><td>Google Pollen API</td><td>Daily (seasonal)</td></tr>
          <tr><td>Climate</td><td>NOAA Climate Normals, NWS</td><td>30-year normals</td></tr>
          <tr><td>Cell Coverage</td><td>FCC Mobile Deployment Data</td><td>Annual</td></tr>
          <tr><td>Broadband</td><td>FCC National Broadband Map</td><td>Bi-annual</td></tr>
          <tr><td>Dark Sky</td><td>Light Pollution Atlas, IDA</td><td>Annual</td></tr>
          <tr><td>Noise</td><td>DOT National Transportation Atlas</td><td>Annual</td></tr>
          <tr><td>Imagery</td><td>Google Maps, Street View API</td><td>Varies</td></tr>
        </tbody>
      </table>
    </div>
    
    <div class="disclaimer">
      <h4>Legal Disclaimer & Limitations</h4>
      <p>This Property Intelligence Report is generated from publicly available data sources and is intended for preliminary assessment purposes only. It does not constitute a Phase I Environmental Site Assessment (ESA) under ASTM E1527-21, nor does it replace formal consultation with regulatory agencies.</p>
      <p style="margin-top: 8px;">Data accuracy is dependent on source agency updates and may not reflect recent changes. All findings should be independently verified with the relevant regulatory agencies before making purchase decisions.</p>
      <p style="margin-top: 8px;"><strong>Rio Grande Due Diligence LLC</strong> makes no warranties regarding the completeness or accuracy of this report. This report is valid for 90 days from generation date.</p>
    </div>
    
    <div class="footer">
      <div>
        <span class="footer-brand">Rio Grande Due Diligence</span> | Report Version 3.0
      </div>
      <div>
        License: Single-use, non-transferable | © ${new Date().getFullYear()} RGDD LLC
      </div>
    </div>
  </div>
</body>
</html>
`;
}

// === SECTION GENERATORS ===

function generateExecutiveSummary(data: ReportData): string {
  const score = data.riskScore || 68;
  const riskLevel = score >= 80 ? 'LOW RISK' : score >= 60 ? 'MODERATE RISK' : 'HIGH RISK';
  const riskColor = score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#dc2626';
  
  const pillars = [
    { icon: '📍', name: 'Parcel', status: data.parcelId ? 'ok' : 'warn' },
    { icon: '🏛️', name: 'Cultural', status: data.culturalStatus === 'safe' ? 'ok' : data.culturalStatus === 'danger' ? 'alert' : 'warn' },
    { icon: '💧', name: 'Water', status: data.waterStatus === 'safe' ? 'ok' : data.waterStatus === 'danger' ? 'alert' : 'warn' },
    { icon: '🌊', name: 'Flood', status: data.floodData?.sfha ? 'alert' : 'ok' },
    { icon: '☣️', name: 'EPA', status: data.epaData?.summary.overallRisk === 'low' ? 'ok' : 'warn' },
    { icon: '🦅', name: 'Habitat', status: data.habitatStatus === 'safe' ? 'ok' : 'warn' },
    { icon: '☀️', name: 'Solar', status: data.solarData ? 'ok' : 'warn' },
    { icon: '🚒', name: 'Services', status: data.infrastructureData ? 'ok' : 'warn' },
    { icon: '🌬️', name: 'Air', status: data.airQualityData?.aqi && data.airQualityData.aqi <= 50 ? 'ok' : data.airQualityData?.aqi && data.airQualityData.aqi > 100 ? 'alert' : 'warn' },
    { icon: '🌸', name: 'Pollen', status: data.pollenData ? 'ok' : 'warn' },
    { icon: '🌡️', name: 'Climate', status: data.weatherData ? 'ok' : 'warn' },
    { icon: '📱', name: 'Cell', status: data.cellCoverageData?.overallCoverage === 'excellent' || data.cellCoverageData?.overallCoverage === 'good' ? 'ok' : 'warn' },
    { icon: '📶', name: 'Internet', status: data.broadbandData?.fiberAvailable ? 'ok' : 'warn' },
    { icon: '🌙', name: 'Dark Sky', status: data.darkSkyData?.bortleClass && data.darkSkyData.bortleClass <= 4 ? 'ok' : 'warn' },
    { icon: '🔇', name: 'Quiet', status: data.noiseLevelData?.overallLevel === 'quiet' ? 'ok' : 'warn' },
    { icon: '🏔️', name: 'Terrain', status: data.elevationData ? 'ok' : 'warn' },
    { icon: '🛰️', name: 'Imagery', status: data.satelliteMapUrl ? 'ok' : 'warn' },
  ];
  
  return `
    <div class="exec-summary">
      <div class="exec-header">
        <div class="exec-title">Executive Summary</div>
        <div class="pillar-count">17 Data Pillars Analyzed</div>
      </div>
      
      <div class="risk-display">
        <div class="risk-score-circle">
          <div class="risk-score-value">${score}</div>
          <div class="risk-score-label">${riskLevel}</div>
        </div>
        <div class="risk-categories">
          <div class="risk-cat ${data.culturalStatus === 'safe' ? 'risk-safe' : data.culturalStatus === 'danger' ? 'risk-danger' : 'risk-caution'}">
            <div class="risk-cat-label">Cultural</div>
            <div class="risk-cat-value">${data.culturalStatus === 'safe' ? 'Clear' : data.culturalStatus === 'danger' ? 'High Risk' : 'Caution'}</div>
          </div>
          <div class="risk-cat ${data.waterStatus === 'safe' ? 'risk-safe' : data.waterStatus === 'danger' ? 'risk-danger' : 'risk-caution'}">
            <div class="risk-cat-label">Water</div>
            <div class="risk-cat-value">${data.waterStatus === 'safe' ? 'Clear' : data.waterStatus === 'danger' ? 'High Risk' : 'Caution'}</div>
          </div>
          <div class="risk-cat ${data.habitatStatus === 'safe' ? 'risk-safe' : 'risk-caution'}">
            <div class="risk-cat-label">Habitat</div>
            <div class="risk-cat-value">${data.habitatStatus === 'safe' ? 'Clear' : 'Caution'}</div>
          </div>
          <div class="risk-cat ${!data.floodData?.sfha ? 'risk-safe' : 'risk-danger'}">
            <div class="risk-cat-label">Flood</div>
            <div class="risk-cat-value">${data.floodData?.floodZone || 'N/A'}</div>
          </div>
          <div class="risk-cat ${data.epaData?.summary.overallRisk === 'low' ? 'risk-safe' : 'risk-caution'}">
            <div class="risk-cat-label">EPA</div>
            <div class="risk-cat-value">${data.epaData?.summary.overallRisk === 'low' ? 'Clear' : 'Review'}</div>
          </div>
          <div class="risk-cat risk-safe">
            <div class="risk-cat-label">Livability</div>
            <div class="risk-cat-value">Analyzed</div>
          </div>
        </div>
      </div>
      
      <div class="pillar-grid">
        ${pillars.map(p => `
          <div class="pillar-item">
            <div class="pillar-icon">${p.icon}</div>
            <div class="pillar-name">${p.name}</div>
            <div class="pillar-status pillar-${p.status}">${p.status === 'ok' ? '✓' : p.status === 'alert' ? '⚠' : '○'}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function generateOwnerSection(data: ReportData): string {
  if (!data.owner && !data.propertyValues?.totalValue) {
    return '';
  }
  
  return `
    <div class="owner-card">
      <div class="owner-grid">
        <div class="owner-section">
          <h4>Property Owner</h4>
          <div class="owner-value">${data.owner || 'Not Available'}</div>
          ${data.ownerAddress ? `<div style="font-size: 10px; color: #64748b; margin-top: 4px;">${data.ownerAddress}</div>` : ''}
        </div>
        <div class="owner-section">
          <h4>Assessed Values (${data.propertyValues?.taxYear || data.taxYear || 'Current'})</h4>
          <div class="value-row">
            <span class="value-label">Land Value</span>
            <span class="value-amount">${data.propertyValues?.landValue || data.landValue ? formatCurrency(data.propertyValues?.landValue || data.landValue || 0) : 'N/A'}</span>
          </div>
          <div class="value-row">
            <span class="value-label">Improvements</span>
            <span class="value-amount">${data.propertyValues?.improvementValue || data.improvementValue ? formatCurrency(data.propertyValues?.improvementValue || data.improvementValue || 0) : 'N/A'}</span>
          </div>
          <div class="value-row">
            <span class="value-label">Total Value</span>
            <span class="value-amount" style="font-size: 12px;">${data.propertyValues?.totalValue || data.totalValue ? formatCurrency(data.propertyValues?.totalValue || data.totalValue || 0) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generatePropertyViewsSection(data: ReportData): string {
  return `
    <h2>Property Views</h2>
    
    <div class="views-grid">
      <div class="view-card">
        <div class="view-header">📷 Street View</div>
        <div class="view-image">
          ${data.streetViewUrl ? 
            `<img src="${data.streetViewUrl}" alt="Street View" />` : 
            `<div style="text-align: center; padding: 20px;">
              <div style="font-size: 32px; margin-bottom: 8px;">🚗</div>
              <div style="font-weight: 600;">Street View</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">
                ${data.streetViewData?.available === false ? 'Not Available for This Location' : 'Available in Web Report'}
              </div>
            </div>`
          }
        </div>
      </div>
      <div class="view-card">
        <div class="view-header">🛰️ Satellite View</div>
        <div class="view-image">
          ${data.satelliteMapUrl ? 
            `<img src="${data.satelliteMapUrl}" alt="Satellite View" />` : 
            `<div style="text-align: center; padding: 20px;">
              <div style="font-size: 32px; margin-bottom: 8px;">🛰️</div>
              <div style="font-weight: 600;">Satellite Imagery</div>
              <div style="font-size: 9px; color: #94a3b8; margin-top: 4px;">Available in Web Report</div>
            </div>`
          }
        </div>
      </div>
    </div>
    
    <div class="map-section">
      <div class="map-header">📍 Location Overview</div>
      <div class="map-container">
        ${data.satelliteMapUrl ? 
          `<img src="${data.satelliteMapUrl}" alt="Property Location" />` :
          `<div style="text-align: center; color: #94a3b8;">
            <div style="font-size: 48px; margin-bottom: 8px;">🗺️</div>
            <div style="font-weight: 600;">Aerial View with Parcel Boundary</div>
          </div>`
        }
      </div>
      <div class="map-footer">
        <strong>Coordinates:</strong> ${data.lat?.toFixed(6) || '--'}°N, ${data.lng ? Math.abs(data.lng).toFixed(6) : '--'}°W
        ${data.parcelGeometry ? ' | <span style="color: #d97706; font-weight: 600;">◼ Parcel Boundary Shown</span>' : ''}
      </div>
    </div>
    
    ${data.elevationData ? `
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-box">
          <div class="stat-value">${formatNumber(data.elevationData.elevation)}'</div>
          <div class="stat-label">Elevation (ft)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.elevationData.slope?.toFixed(1) || '--'}°</div>
          <div class="stat-label">Slope</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${data.elevationData.aspect || 'N/A'}</div>
          <div class="stat-label">Aspect</div>
        </div>
      </div>
    ` : ''}
  `;
}

function generateCulturalSection(
  culturalData: CulturalResourcesData | undefined, 
  statusConfig: { bg: string; text: string; label: string }
): string {
  const cd = culturalData;
  const isOnTribalLand = cd?.onTribalLand || false;
  const tribalLandName = cd?.nearestTribalLand?.name || 'Tribal Land';
  
  return `
    <h2>Cultural Resources Assessment</h2>
    <div class="finding-card">
      <div class="finding-header">
        <div>
          <span class="finding-title">Tribal Land Status</span>
        </div>
        <span class="status-badge" style="background: ${isOnTribalLand ? '#991b1b' : '#166534'}; color: white;">${isOnTribalLand ? 'ON TRIBAL LAND' : 'OFF TRIBAL LAND'}</span>
      </div>
      
      ${isOnTribalLand ? `
        <div class="alert-box alert-danger" style="margin-top: 12px;">
          <div class="alert-title">⚠️ Property Located on ${tribalLandName}</div>
          This property is within tribal boundaries. Development requires tribal consultation and approval. Contact the tribal government directly for permitting requirements.
        </div>
      ` : `
        <div class="alert-box alert-success" style="margin-top: 12px;">
          <div class="alert-title">✓ Property Not on Tribal Land</div>
          This property is outside tribal boundaries. Standard county/state permitting applies.
        </div>
      `}
      
      <div class="finding-items" style="margin-top: 16px;">
        <div class="finding-item">
          <span class="finding-label">Historic District</span>
          <span class="finding-value">${cd?.inHistoricDistrict ? `Within ${cd.historicDistrictName || 'historic district'}` : 'No'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">NRHP Listed Properties Nearby</span>
          <span class="finding-value">${cd?.nrhpPropertiesWithin1Mile && cd.nrhpPropertiesWithin1Mile.length > 0 ? `${cd.nrhpPropertiesWithin1Mile.length} within 1 mile` : 'None identified'}</span>
        </div>
      </div>
      
      <div class="alert-box alert-info" style="margin-top: 16px;">
        <div class="alert-title">New Mexico's Cultural Heritage</div>
        <div style="font-size: 10px; line-height: 1.5;">
          New Mexico has one of the richest archaeological records in North America, with over 190,000 recorded sites. 
          If you discover artifacts, human remains, or archaeological features during construction:
          <ul style="margin: 8px 0 0 16px;">
            <li><strong>Stop work immediately</strong> in that area</li>
            <li>Do not disturb or remove any materials</li>
            <li>Contact the NM Historic Preservation Division: <strong>(505) 827-6320</strong></li>
            <li>Report to local law enforcement if human remains are found</li>
          </ul>
          <div style="margin-top: 8px; font-style: italic;">
            Unauthorized excavation or removal of artifacts is a federal crime under the Archaeological Resources Protection Act.
          </div>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${cd?.source || 'BIA AIAN Land Areas, Census TIGER, NPS NRHP'}</div>
      </div>
    </div>
  `;
}

function generateWaterSection(data: ReportData, statusConfig: { bg: string; text: string; label: string }): string {
  return `
    <h2>Water Rights & Resources</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">NM Office of State Engineer Analysis</span>
        <span class="status-badge" style="background: ${statusConfig.text}; color: white;">${statusConfig.label}</span>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">State Administration</span>
          <span class="finding-value">NM Office of State Engineer</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Municipal Water</span>
          <span class="finding-value">Verify with local utility</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Domestic Well</span>
          <span class="finding-value">May require OSE permit</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Water Rights on Parcel</span>
          <span class="finding-value">Research required</span>
        </div>
      </div>
      
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          <li>Contact local water utility to verify if municipal connection is available</li>
          <li>Search NM OSE WATERS database for existing water rights on parcel</li>
          <li>If well needed, contact OSE District office for permit requirements</li>
          <li>For rural properties, budget for well drilling or water hauling if no municipal service</li>
        </ol>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">NM Office of the State Engineer (ose.state.nm.us)</div>
      </div>
    </div>
  `;
}

function generateWellSection(wellData: { wells: WellData[]; summary: WellDataSummary }): string {
  const { wells, summary } = wellData;
  
  if (wells.length === 0) {
    return `
      <div class="finding-card">
        <div class="finding-header">
          <span class="finding-title">Points of Diversion (POD) Analysis</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">No points of diversion or wells found within 1 mile of subject property.</p>
        <div class="data-source">
          <div class="data-source-title">Data Source</div>
          <div class="data-source-text">NM Office of the State Engineer POD Database (mercator.env.nm.gov)</div>
        </div>
      </div>
    `;
  }

  const nearestWells = wells.slice(0, 8);
  const useTypes = Object.entries(summary.byUse)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([use, count]) => `${use}: ${count}`)
    .join(' | ');

  return `
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">Points of Diversion (POD) Analysis</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-box">
          <div class="stat-value">${summary.totalWells}</div>
          <div class="stat-label">Total PODs (1 mi)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${summary.withinHalfMile}</div>
          <div class="stat-label">Within ½ Mile</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${Object.keys(summary.byType).length}</div>
          <div class="stat-label">POD Types</div>
        </div>
      </div>
      
      <table class="data-table">
        <thead>
          <tr>
            <th>POD ID</th>
            <th>Type</th>
            <th>Use</th>
            <th>Status</th>
            <th>Distance</th>
          </tr>
        </thead>
        <tbody>
          ${nearestWells.map(well => `
            <tr>
              <td>${well.podId || 'N/A'}</td>
              <td>${well.podType || 'Unknown'}</td>
              <td>${well.waterUse || 'Unknown'}</td>
              <td>${well.status || 'Unknown'}</td>
              <td>${well.distance} mi</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 8px; font-size: 9px; color: #64748b;">
        <strong>Use Types:</strong> ${useTypes}
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">NM Office of the State Engineer POD Database - Real-time query</div>
      </div>
    </div>
  `;
}

function generateHabitatSection(statusConfig: { bg: string; text: string; label: string }): string {
  return `
    <h2>Critical Habitat & ESA Compliance</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">Endangered Species Act Analysis</span>
        <span class="status-badge" style="background: ${statusConfig.text}; color: white;">${statusConfig.label}</span>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Critical Habitat</span>
          <span class="finding-value">IPaC query recommended</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">ESA Listed Species</span>
          <span class="finding-value">Location-dependent</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Migratory Bird Treaty Act</span>
          <span class="finding-value">Applies statewide</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Wetland/Waters of US</span>
          <span class="finding-value">Site inspection needed</span>
        </div>
      </div>
      
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          <li>Run USFWS IPaC query at ecos.fws.gov/ipac for official species list</li>
          <li>Pre-construction bird survey if clearing during nesting season (Apr-Jul)</li>
          <li>If near water features, conduct wetland delineation</li>
          <li>Implement standard SWPPP for construction stormwater management</li>
        </ol>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">USFWS Information for Planning and Consultation (IPaC)</div>
      </div>
    </div>
  `;
}

function generateFloodSection(floodData: FloodData): string {
  const riskColors: Record<string, { bg: string; text: string }> = {
    high: { bg: "#fee2e2", text: "#991b1b" },
    moderate: { bg: "#fef3c7", text: "#92400e" },
    low: { bg: "#dbeafe", text: "#1e40af" },
    minimal: { bg: "#dcfce7", text: "#166534" },
  };
  
  const riskLevel = floodData.riskLevel || 'minimal';
  const config = riskColors[riskLevel] || riskColors.minimal;
  
  return `
    <h2>FEMA Flood Zone Analysis</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">National Flood Hazard Layer</span>
        <span class="status-badge" style="background: ${config.text}; color: white;">${riskLevel.toUpperCase()}</span>
      </div>
      
      <div style="text-align: center; padding: 16px; margin: 12px 0; background: ${config.bg}; border-radius: 8px; border: 2px solid ${config.text};">
        <div style="font-size: 32px; font-weight: 800; color: ${config.text};">${floodData.floodZone}</div>
        <div style="font-size: 11px; color: ${config.text}; margin-top: 4px;">${floodData.floodZoneDescription}</div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Flood Zone</span>
          <span class="finding-value" style="color: ${config.text}; font-weight: 700;">${floodData.floodZone}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Special Flood Hazard Area (SFHA)</span>
          <span class="finding-value" style="color: ${floodData.sfha ? '#991b1b' : '#166534'}; font-weight: 700;">${floodData.sfha ? 'YES - Insurance Required' : 'NO'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Risk Level</span>
          <span class="finding-value">${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</span>
        </div>
      </div>
      
      ${floodData.sfha ? `
        <div class="alert-box alert-danger">
          <div class="alert-title">⚠️ Flood Insurance Required</div>
          This property is in a Special Flood Hazard Area. Federally-backed mortgages require flood insurance.
        </div>
      ` : `
        <div class="alert-box alert-success">
          <div class="alert-title">✓ Low Flood Risk</div>
          Property is outside the Special Flood Hazard Area. Flood insurance not required but may be recommended.
        </div>
      `}
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${floodData.source}</div>
      </div>
    </div>
  `;
}

function generateEPASection(epaData: EPAData): string {
  const { summary } = epaData;
  const overallRisk = summary?.overallRisk || 'low';
  const config = overallRisk === 'low' 
    ? { bg: "#dcfce7", text: "#166534" }
    : overallRisk === 'high'
    ? { bg: "#fee2e2", text: "#991b1b" }
    : { bg: "#fef3c7", text: "#92400e" };
  
  return `
    <h2>EPA Environmental Hazards</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">EPA Envirofacts Analysis</span>
        <span class="status-badge" style="background: ${config.text}; color: white;">${overallRisk.toUpperCase()} CONCERN</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box ${summary.superfundWithin1Mile > 0 ? 'stat-bad' : 'stat-good'}">
          <div class="stat-value">${summary.superfundWithin1Mile}</div>
          <div class="stat-label">Superfund (1mi)</div>
        </div>
        <div class="stat-box ${summary.triWithin1Mile > 0 ? 'stat-warn' : 'stat-good'}">
          <div class="stat-value">${summary.triWithin1Mile}</div>
          <div class="stat-label">TRI Sites</div>
        </div>
        <div class="stat-box ${summary.brownfieldWithin1Mile > 0 ? 'stat-warn' : 'stat-good'}">
          <div class="stat-value">${summary.brownfieldWithin1Mile}</div>
          <div class="stat-label">Brownfield</div>
        </div>
        <div class="stat-box ${summary.rcraWithin1Mile > 0 ? 'stat-warn' : 'stat-good'}">
          <div class="stat-value">${summary.rcraWithin1Mile}</div>
          <div class="stat-label">RCRA</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Superfund/NPL Sites (5 mi)</span>
          <span class="finding-value">${summary.superfundWithin5Miles} found</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Overall Environmental Risk</span>
          <span class="finding-value" style="color: ${config.text}; font-weight: 700;">${overallRisk.toUpperCase()}</span>
        </div>
      </div>
      
      ${summary.superfundWithin1Mile + summary.triWithin1Mile + summary.brownfieldWithin1Mile > 0 ? `
        <div class="alert-box alert-warning">
          <div class="alert-title">Due Diligence Recommendation</div>
          Environmental sites identified nearby. Phase I ESA (ASTM E1527-21) recommended before acquisition.
        </div>
      ` : `
        <div class="alert-box alert-success">
          <div class="alert-title">✓ Clean Environmental Record</div>
          No EPA-regulated sites within 1 mile. Positive indicator for environmental due diligence.
        </div>
      `}
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${epaData.source}</div>
      </div>
    </div>
  `;
}

function generateSolarSection(solarData: SolarData): string {
  const potentialColors: Record<string, { bg: string; text: string }> = {
    excellent: { bg: "#fef3c7", text: "#d97706" },
    good: { bg: "#dcfce7", text: "#16a34a" },
    fair: { bg: "#fef9c3", text: "#ca8a04" },
    poor: { bg: "#fee2e2", text: "#dc2626" },
  };
  
  const solarPotential = solarData.solarPotential || 'good';
  const config = potentialColors[solarPotential] || potentialColors.good;
  
  return `
    <h2>Solar Development Potential</h2>
    <div class="finding-card" style="background: linear-gradient(135deg, ${config.bg}40 0%, white 100%);">
      <div class="finding-header">
        <span class="finding-title">☀️ Google Solar API Analysis</span>
        <span class="status-badge" style="background: ${config.text}; color: white;">${solarPotential.toUpperCase()}</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="stat-box" style="background: white;">
          <div class="stat-value" style="color: ${config.text};">${formatNumber(solarData.sunlightHoursPerYear)}</div>
          <div class="stat-label">Hours/Year Sunlight</div>
        </div>
        <div class="stat-box" style="background: white;">
          <div class="stat-value" style="color: #16a34a;">${formatCurrency(solarData.annualSavingsEstimate)}</div>
          <div class="stat-label">Est. Annual Savings</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Recommended System</span>
          <span class="finding-value">${solarData.recommendedCapacityKw} kW</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Usable Area</span>
          <span class="finding-value">${formatNumber(solarData.roofAreaSqFt)} sq ft</span>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${solarData.source}</div>
      </div>
    </div>
  `;
}

function generateInfrastructureSection(infraData: InfrastructureData): string {
  return `
    <h2>Infrastructure & Emergency Services</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🏛️ Service Distance Analysis</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="stat-box ${infraData.nearestFireStation.distance > 10 ? 'stat-warn' : 'stat-good'}">
          <div class="stat-value">${infraData.nearestFireStation.driveTime ? `${infraData.nearestFireStation.driveTime} min` : `${infraData.nearestFireStation.distance.toFixed(1)} mi`}</div>
          <div class="stat-label">🚒 Fire Station</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${infraData.nearestHospital.driveTime ? `${infraData.nearestHospital.driveTime} min` : `${infraData.nearestHospital.distance.toFixed(1)} mi`}</div>
          <div class="stat-label">🏥 Hospital</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">🚒 Fire Station</span>
          <span class="finding-value">${infraData.nearestFireStation.name}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">🚓 Police</span>
          <span class="finding-value">${infraData.nearestPolice.name} (${infraData.nearestPolice.driveTime ? `${infraData.nearestPolice.driveTime} min` : `${infraData.nearestPolice.distance.toFixed(1)} mi`})</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">🏥 Hospital</span>
          <span class="finding-value">${infraData.nearestHospital.name}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">🏫 School</span>
          <span class="finding-value">${infraData.nearestSchool.name} (${infraData.nearestSchool.driveTime ? `${infraData.nearestSchool.driveTime} min` : `${infraData.nearestSchool.distance.toFixed(1)} mi`})</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">🛒 Grocery</span>
          <span class="finding-value">${infraData.nearestGrocery.name} (${infraData.nearestGrocery.driveTime ? `${infraData.nearestGrocery.driveTime} min` : `${infraData.nearestGrocery.distance.toFixed(1)} mi`})</span>
        </div>
      </div>
      
      <div class="alert-box alert-info">
        <div class="alert-title">Insurance Note</div>
        Fire insurance rates influenced by proximity to fire stations. Properties within 5 road miles typically receive better rates.
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${infraData.source}</div>
      </div>
    </div>
  `;
}

// === NEW LIVABILITY SECTIONS ===

function generateAirQualitySection(airData: AirQualityData): string {
  const aqi = airData.aqi || 0;
  const aqiColor = aqi <= 50 ? '#16a34a' : aqi <= 100 ? '#ca8a04' : aqi <= 150 ? '#ea580c' : '#dc2626';
  const aqiLabel = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy (Sensitive)' : 'Unhealthy';
  
  return `
    <h2>Air Quality Analysis</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🌬️ Current Air Quality Index</span>
        <span class="status-badge" style="background: ${aqiColor}; color: white;">${aqiLabel.toUpperCase()}</span>
      </div>
      
      <div style="text-align: center; padding: 16px; margin: 12px 0; background: linear-gradient(135deg, ${aqiColor}20 0%, white 100%); border-radius: 8px;">
        <div style="font-size: 48px; font-weight: 800; color: ${aqiColor};">${aqi}</div>
        <div style="font-size: 12px; color: ${aqiColor}; font-weight: 600;">Air Quality Index</div>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-box">
          <div class="stat-value">${airData.pm25?.toFixed(1) || '--'}</div>
          <div class="stat-label">PM2.5 (μg/m³)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${airData.ozone?.toFixed(1) || 'N/A'}</div>
          <div class="stat-label">Ozone (ppb)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${airData.dominantPollutant || 'N/A'}</div>
          <div class="stat-label">Main Pollutant</div>
        </div>
      </div>
      
      ${airData.healthRecommendations ? `
        <div class="alert-box alert-info">
          <div class="alert-title">Health Guidance</div>
          ${airData.healthRecommendations}
        </div>
      ` : ''}
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${airData.source}</div>
      </div>
    </div>
  `;
}

function generatePollenSection(pollenData: PollenData): string {
  const levelColor = (level: string | undefined) => {
    if (!level) return '#64748b';
    switch(level.toLowerCase()) {
      case 'low': case 'none': return '#16a34a';
      case 'moderate': case 'medium': return '#ca8a04';
      case 'high': return '#ea580c';
      case 'very high': return '#dc2626';
      default: return '#64748b';
    }
  };
  
  return `
    <h2>Pollen & Allergen Forecast</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🌸 Seasonal Pollen Analysis</span>
        <span class="status-badge" style="background: ${levelColor(pollenData.overallLevel)}; color: white;">${(pollenData.overallLevel || 'N/A').toUpperCase()}</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-box">
          <div class="stat-value" style="color: ${levelColor(pollenData.treePollen?.level)};">${pollenData.treePollen?.index ?? '--'}</div>
          <div class="stat-label">🌳 Tree Pollen</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: ${levelColor(pollenData.grassPollen?.level)};">${pollenData.grassPollen?.index ?? '--'}</div>
          <div class="stat-label">🌾 Grass Pollen</div>
        </div>
        <div class="stat-box">
          <div class="stat-value" style="color: ${levelColor(pollenData.weedPollen?.level)};">${pollenData.weedPollen?.index ?? '--'}</div>
          <div class="stat-label">🌿 Weed Pollen</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Current Season</span>
          <span class="finding-value">${pollenData.season || 'N/A'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Overall Level</span>
          <span class="finding-value" style="color: ${levelColor(pollenData.overallLevel)};">${pollenData.overallLevel || 'N/A'}</span>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${pollenData.source || 'Google Pollen API'}</div>
      </div>
    </div>
  `;
}

function generateWeatherSection(weatherData: WeatherData): string {
  const climate = typeof weatherData.climate === 'string' ? weatherData.climate : 'Semi-Arid';
  
  return `
    <h2>Climate & Weather Profile</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🌡️ Regional Climate Data</span>
        <span class="status-badge" style="background: #0369a1; color: white;">${climate.toUpperCase()}</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-box">
          <div class="stat-value">${weatherData.avgHighSummer || '--'}°F</div>
          <div class="stat-label">Summer High</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${weatherData.avgLowWinter || '--'}°F</div>
          <div class="stat-label">Winter Low</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${weatherData.sunnyDaysPerYear || '--'}</div>
          <div class="stat-label">Sunny Days/Yr</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${weatherData.annualPrecipitation || '--'}"</div>
          <div class="stat-label">Annual Precip</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Annual Snowfall</span>
          <span class="finding-value">${weatherData.annualSnowfall || '--'}" average</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Growing Season</span>
          <span class="finding-value">${weatherData.growingSeasonDays || '--'} days</span>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${weatherData.source || 'NOAA Climate Data'}</div>
      </div>
    </div>
  `;
}

function generateCellCoverageSection(cellData: CellCoverageData): string {
  const coverageColor: Record<string, string> = {
    excellent: '#16a34a',
    good: '#22c55e',
    fair: '#ca8a04',
    poor: '#ea580c',
    none: '#dc2626'
  };
  
  const coverage = cellData.overallCoverage || 'fair';
  
  return `
    <h2>Cellular Coverage</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">📱 Mobile Network Analysis</span>
        <span class="status-badge" style="background: ${coverageColor[coverage] || '#64748b'}; color: white;">${coverage.toUpperCase()}</span>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Overall Coverage</span>
          <span class="finding-value" style="color: ${coverageColor[coverage] || '#64748b'};">${coverage.charAt(0).toUpperCase() + coverage.slice(1)}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Area Type</span>
          <span class="finding-value">${cellData.rural ? 'Rural' : 'Urban/Suburban'}</span>
        </div>
      </div>
      
      ${cellData.carriers.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Carrier</th>
              <th>Coverage</th>
              <th>5G</th>
            </tr>
          </thead>
          <tbody>
            ${cellData.carriers.map(c => `
              <tr>
                <td>${c.name}</td>
                <td>${c.coverage}</td>
                <td>${c.has5G ? '✓' : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${cellData.source}</div>
      </div>
    </div>
  `;
}

function generateBroadbandSection(broadbandData: BroadbandData): string {
  return `
    <h2>Broadband & Internet</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">📶 Internet Service Analysis</span>
        <span class="status-badge" style="background: ${broadbandData.fiberAvailable ? '#16a34a' : '#ca8a04'}; color: white;">${broadbandData.fiberAvailable ? 'FIBER AVAILABLE' : 'LIMITED'}</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(2, 1fr);">
        <div class="stat-box stat-good">
          <div class="stat-value">${broadbandData.maxDownload}</div>
          <div class="stat-label">Max Download (Mbps)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${broadbandData.maxUpload}</div>
          <div class="stat-label">Max Upload (Mbps)</div>
        </div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Technologies Available</span>
          <span class="finding-value">${broadbandData.technologies.join(', ') || 'Limited'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Fiber Optic</span>
          <span class="finding-value" style="color: ${broadbandData.fiberAvailable ? '#16a34a' : '#dc2626'};">${broadbandData.fiberAvailable ? 'Available' : 'Not Available'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Starlink Eligible</span>
          <span class="finding-value">${broadbandData.starlinkEligible ? 'Yes' : 'Check starlink.com'}</span>
        </div>
      </div>
      
      ${broadbandData.providers.length > 0 ? `
        <table class="data-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Technology</th>
              <th>Max Speed</th>
            </tr>
          </thead>
          <tbody>
            ${broadbandData.providers.slice(0, 5).map(p => `
              <tr>
                <td>${p.name}</td>
                <td>${p.technology}</td>
                <td>${p.maxSpeed} Mbps</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${broadbandData.source}</div>
      </div>
    </div>
  `;
}

function generateDarkSkySection(darkSkyData: DarkSkyData): string {
  const bortleClass = darkSkyData.bortleClass || 5;
  const bortleColor = bortleClass <= 3 ? '#16a34a' : bortleClass <= 5 ? '#22c55e' : bortleClass <= 7 ? '#ca8a04' : '#dc2626';
  
  return `
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🌙 Dark Sky Quality</span>
      </div>
      
      <div style="text-align: center; padding: 12px; margin: 8px 0; background: #0f172a; border-radius: 8px;">
        <div style="font-size: 28px; font-weight: 800; color: ${bortleColor};">Class ${bortleClass}</div>
        <div style="font-size: 10px; color: #94a3b8;">${darkSkyData.bortleDescription || 'Rural/Suburban Sky'}</div>
      </div>
      
      <div class="finding-items">
        <div class="finding-item">
          <span class="finding-label">Milky Way Visible</span>
          <span class="finding-value">${darkSkyData.milkyWayVisible ? '✓ Yes' : 'Limited'}</span>
        </div>
        <div class="finding-item">
          <span class="finding-label">Light Pollution</span>
          <span class="finding-value">${darkSkyData.lightPollutionLevel || 'N/A'}</span>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-text">${darkSkyData.source || 'Light Pollution Atlas'}</div>
      </div>
    </div>
  `;
}

function generateNoiseSection(noiseLevelData: NoiseLevelData): string {
  const noiseLevel = noiseLevelData.overallLevel || 'moderate';
  const noiseColor = noiseLevel === 'quiet' ? '#16a34a' : noiseLevel === 'moderate' ? '#ca8a04' : '#dc2626';
  
  return `
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🔇 Noise Environment</span>
      </div>
      
      <div style="text-align: center; padding: 12px; margin: 8px 0; background: ${noiseColor}20; border-radius: 8px;">
        <div style="font-size: 28px; font-weight: 800; color: ${noiseColor};">${noiseLevelData.estimatedDecibels || '--'} dB</div>
        <div style="font-size: 10px; color: ${noiseColor}; text-transform: uppercase;">${noiseLevel}</div>
      </div>
      
      <div class="finding-items">
        ${noiseLevelData.nearestHighway ? `
          <div class="finding-item">
            <span class="finding-label">Nearest Highway</span>
            <span class="finding-value">${noiseLevelData.nearestHighway.name || 'Highway'} (${noiseLevelData.nearestHighway.distance?.toFixed(1) || '--'} mi)</span>
          </div>
        ` : ''}
        ${noiseLevelData.nearestAirport ? `
          <div class="finding-item">
            <span class="finding-label">Nearest Airport</span>
            <span class="finding-value">${noiseLevelData.nearestAirport.name || 'Airport'} (${noiseLevelData.nearestAirport.distance?.toFixed(1) || '--'} mi)</span>
          </div>
        ` : ''}
        <div class="finding-item">
          <span class="finding-label">Flight Path</span>
          <span class="finding-value">${noiseLevelData.flightPath ? 'Yes' : 'No'}</span>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-text">${noiseLevelData.source || 'DOT Transportation Atlas'}</div>
      </div>
    </div>
  `;
}

function generateElevationSection(elevationData: ElevationData): string {
  return `
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">🏔️ Elevation & Terrain</span>
      </div>
      
      <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="stat-box">
          <div class="stat-value">${formatNumber(elevationData.elevation)}'</div>
          <div class="stat-label">Elevation (ft)</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${elevationData.slope?.toFixed(1) || '--'}°</div>
          <div class="stat-label">Slope</div>
        </div>
        <div class="stat-box">
          <div class="stat-value">${elevationData.aspect || 'N/A'}</div>
          <div class="stat-label">Aspect</div>
        </div>
      </div>
      
      <div class="data-source">
        <div class="data-source-text">${elevationData.source}</div>
      </div>
    </div>
  `;
}

export function downloadPDF(data: ReportData): void {
  try {
    console.log('PDF Export: Starting generation...', data);
    const htmlContent = generatePDFContent(data);
    console.log('PDF Export: HTML generated, length:', htmlContent.length);
    
    const printWindow = window.open("", "_blank", "width=900,height=700");
    
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      console.error('PDF Export: Failed to open print window - popup may be blocked');
      alert('Could not open print window. Please allow popups for this site.');
    }
  } catch (error) {
    console.error('PDF Export: Error generating PDF:', error);
    alert('Error generating PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
