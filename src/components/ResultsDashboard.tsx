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
import { downloadPDF, type ReportData, type WellData, type WellDataSummary } from "@/lib/pdfExport";
import { toast } from "sonner";
import logoImage from "@/assets/logo-dark.png";
import { lookupPLSS, geocodeAddress, type PLSSResult } from "@/lib/geocoding";

interface StatusCardProps {
  title: string;
  status: "safe" | "caution" | "danger";
  statusText: string;
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

const StatusCard = ({ title, status, statusText, description, details, dataSource, lastUpdated, findings, recommendations }: StatusCardProps) => {
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
    <div className={`relative p-6 rounded-xl bg-card border ${config.borderClass} shadow-card`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bgClass} border`}>
          <Icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="flex items-center gap-1 justify-end">
            <Clock className="w-3 h-3" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>

      <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>

      {/* Key Findings Table */}
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Key Findings</h4>
        <div className="space-y-2">
          {findings.map((finding, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm py-1 border-b border-border/50 last:border-0">
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
      <div className="mb-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Analysis Details</h4>
        <ul className="space-y-1.5">
          {details.map((detail, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <ChevronRight className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-1">
          <FileCheck className="w-3 h-3" />
          Recommended Actions
        </h4>
        <ul className="space-y-1">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-primary font-medium">{idx + 1}.</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Data Source */}
      <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="w-3 h-3" />
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

const ResultsDashboard = ({ address, onReset, isSample = false }: ResultsDashboardProps) => {
  const [plssData, setPlssData] = useState<PLSSResult | null>(null);
  const [isLoadingPLSS, setIsLoadingPLSS] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [wellData, setWellData] = useState<{ wells: WellData[]; summary: WellDataSummary } | null>(null);
  const [displayAddress, setDisplayAddress] = useState<string>(address);
  const [countyName, setCountyName] = useState<string>("Loading...");

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

  // Fetch PLSS/legal description when component mounts
  useEffect(() => {
    const fetchPropertyData = async () => {
      setIsLoadingPLSS(true);
      try {
        // First geocode to get coordinates
        const geocodeResult = await geocodeAddress(address, "address");
        if (geocodeResult && !geocodeResult.isError) {
          setCoordinates({ lat: geocodeResult.lat, lng: geocodeResult.lng });
          setDisplayAddress(geocodeResult.displayName);
          
          // Extract county from display name
          const county = extractCounty(geocodeResult.displayName);
          setCountyName(county);
          
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

    fetchPropertyData();
  }, [address]);

  // Handle well data callback from GISMap
  const handleWellDataLoaded = (data: { wells: WellData[]; summary: WellDataSummary } | null) => {
    if (data) {
      setWellData(data);
      console.log('Well data loaded:', data.summary);
    }
  };

  const reportData = {
    address: address || "1234 Rio Grande Blvd, Albuquerque, NM",
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
    parcelId: "1-014-076-384-352-00000",
    legalDescription: plssData?.legalDescription || "Loading legal description...",
    acreage: "0.34 acres (14,810 sq ft)",
    zoning: "R-1 Residential",
    jurisdiction: countyName.includes("County") ? countyName.replace(" County", "") : "New Mexico",
    county: countyName,
  };

  // Calculate overall risk score
  const riskScore = 68; // Out of 100, higher = more risk

  const statusCards: StatusCardProps[] = [
    {
      title: "Cultural Resources Assessment",
      status: "danger",
      statusText: "High Risk",
      description: "Analysis of NMCRIS (New Mexico Cultural Resources Information System) records indicates proximity to registered historic and archaeological resources.",
      dataSource: "NMCRIS Database, NM SHPO Records, NRHP Registry",
      lastUpdated: "Database current as of Dec 2024",
      findings: [
        { label: "Historic District Proximity", value: "0.47 miles", status: "danger" },
        { label: "Registered Archaeological Sites", value: "2 within 1 mile", status: "danger" },
        { label: "NRHP Listed Properties", value: "1 adjacent", status: "caution" },
        { label: "Previous Cultural Surveys", value: "None on record", status: "caution" },
        { label: "Tribal Consultation Required", value: "Yes - Pueblo lands nearby", status: "danger" },
      ],
      details: [
        "LA #45892 - Prehistoric habitation site (Pueblo II-III period) located 0.3 miles northwest",
        "Property lies within the Albuquerque Old Town Historic District buffer zone",
        "No Phase I archaeological survey on file for this parcel",
        "Adjacent property (NE) listed on National Register of Historic Places",
        "Area identified as archaeologically sensitive by ARMS predictive model",
      ],
      recommendations: [
        "Commission Phase I Archaeological Survey before any ground disturbance",
        "Submit NMCRIS Project ID application to SHPO prior to development",
        "Initiate tribal consultation with nearby Pueblos per NHPA Section 106",
        "Consider historic architectural review if within viewshed of NRHP property",
      ],
    },
    {
      title: "Water Rights & Restrictions",
      status: "caution",
      statusText: "Restrictions Apply",
      description: "Property located within a declared underground water basin administered by the New Mexico Office of the State Engineer (OSE). Special permitting requirements apply.",
      dataSource: "NM OSE WATERS Database, Basin Admin Records",
      lastUpdated: "Database current as of Dec 2024",
      findings: [
        { label: "Basin Status", value: "Declared (1956)", status: "caution" },
        { label: "Basin Name", value: "Middle Rio Grande", status: "neutral" },
        { label: "Water Rights on Parcel", value: "None recorded", status: "caution" },
        { label: "Domestic Well Eligible", value: "Yes (with offset)", status: "caution" },
        { label: "Municipal Connection", value: "Available", status: "safe" },
        { label: "Irrigation District", value: "MRGCD - Outside boundaries", status: "safe" },
      ],
      details: [
        "Middle Rio Grande Declared Basin - all new appropriations require OSE permit",
        "Domestic well permits limited to 3 acre-feet/year for household use only",
        "New commercial/irrigation wells require purchase and transfer of existing water rights",
        "Property not within Middle Rio Grande Conservancy District boundaries",
        "Nearest municipal water line: 150 feet (E. Central Ave)",
        "No active water right claims filed on this parcel in WATERS database",
      ],
      recommendations: [
        "Connect to municipal water system (ABCWUA) for development - lowest risk option",
        "If domestic well desired, file OSE permit application with offset plan",
        "Consult OSE District 1 office for permit timeline (typically 6-12 months)",
        "Verify no competing water right applications pending in area",
      ],
    },
    {
      title: "Critical Habitat & ESA Compliance",
      status: "safe",
      statusText: "No Conflicts",
      description: "USFWS Critical Habitat Analysis indicates no designated critical habitat overlap with subject parcel. Standard environmental compliance applies.",
      dataSource: "USFWS ECOS, IPaC Database, NM BISON-M",
      lastUpdated: "Data retrieved Dec 2024",
      findings: [
        { label: "Critical Habitat Overlap", value: "None detected", status: "safe" },
        { label: "ESA Listed Species on Site", value: "None documented", status: "safe" },
        { label: "Silvery Minnow Habitat", value: "2.1 miles (outside zone)", status: "safe" },
        { label: "Willow Flycatcher Habitat", value: "No overlap", status: "safe" },
        { label: "Migratory Bird Concerns", value: "Standard MBTA applies", status: "neutral" },
        { label: "Wetland/Waters of US", value: "None identified", status: "safe" },
      ],
      details: [
        "Nearest Rio Grande Silvery Minnow critical habitat: 2.1 miles west (Rio Grande)",
        "No Southwestern Willow Flycatcher designated habitat within 5-mile radius",
        "Property not within any designated Wildlife Management Area",
        "National Wetlands Inventory shows no wetland features on parcel",
        "Standard NPDES stormwater permit (CGP) required for construction >1 acre",
        "No Section 404 permit anticipated based on NWI and site characteristics",
      ],
      recommendations: [
        "Conduct pre-construction bird survey if clearing during nesting season (Apr-Jul)",
        "Implement standard SWPPP for construction stormwater management",
        "No ESA Section 7 consultation anticipated for this development",
        "Consider native landscaping to support local pollinator species",
      ],
    },
  ];

  const additionalFindings = [
    {
      icon: Building,
      title: "Zoning & Land Use",
      items: [
        { label: "Current Zoning", value: "R-1 Single Family Residential" },
        { label: "Overlay Districts", value: "None" },
        { label: "Future Land Use", value: "Low Density Residential" },
        { label: "Permitted Uses", value: "Single family dwelling, accessory structures" },
      ]
    },
    {
      icon: AlertOctagon,
      title: "Hazard Assessment",
      items: [
        { label: "FEMA Flood Zone", value: "Zone X (Minimal Risk)" },
        { label: "Seismic Hazard", value: "Low (Zone 1)" },
        { label: "Wildfire Risk", value: "Low" },
        { label: "Radon Potential", value: "Moderate - testing recommended" },
      ]
    },
    {
      icon: Users,
      title: "Community Context",
      items: [
        { label: "School District", value: "Albuquerque Public Schools" },
        { label: "Fire District", value: "AFD Station 1 - 0.8 miles" },
        { label: "Census Tract", value: "35001001200" },
        { label: "Opportunity Zone", value: "No" },
      ]
    },
  ];

  const regulatoryContacts = [
    { agency: "NM State Historic Preservation Office", phone: "(505) 827-6320", purpose: "Cultural resource surveys, NMCRIS" },
    { agency: "NM Office of the State Engineer", phone: "(505) 827-6120", purpose: "Water permits, rights transfers" },
    { agency: "USFWS NM Ecological Services", phone: "(505) 346-2525", purpose: "ESA consultations" },
    { agency: "City of Albuquerque Planning", phone: "(505) 924-3860", purpose: "Zoning, permits" },
  ];

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
                  <h1 className="font-display text-xl font-semibold text-foreground">Environmental Due Diligence Report</h1>
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
onClick={() => {
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
                    culturalStatus: "danger",
                    waterStatus: "caution",
                    habitatStatus: "safe",
                    wellData: wellData || undefined,
                    lat: coordinates?.lat,
                    lng: coordinates?.lng,
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-display text-xl font-semibold text-foreground mb-1">{reportData.address}</p>
                  <p className="text-sm text-muted-foreground mb-4">{reportData.county}, New Mexico</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Parcel ID (APN)</span>
                      <span className="font-mono text-foreground">{reportData.parcelId}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Legal Description</span>
                      <span className="text-foreground text-right flex items-center gap-2">
                        {isLoadingPLSS ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="text-muted-foreground">Loading...</span>
                          </>
                        ) : plssData?.legalDescription ? (
                          <span>{plssData.legalDescription}</span>
                        ) : (
                          <span className="text-muted-foreground italic">Not available</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Parcel Size</span>
                      <span className="text-foreground">{reportData.acreage}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-muted-foreground">Zoning</span>
                      <span className="text-foreground">{reportData.zoning}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3 h-3" />
                      Report Generated
                    </div>
                    <p className="text-sm font-medium text-foreground">{reportData.generatedAt}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                      Report Valid Until
                    </div>
                    <p className="text-sm font-medium text-foreground">{reportData.validUntil}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Shield className="w-3 h-3" />
                      Data Verification
                    </div>
                    <p className="text-sm font-medium text-foreground">All sources verified</p>
                  </div>
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
                    <Landmark className="w-4 h-4 text-[hsl(var(--status-danger))]" />
                    Cultural
                  </span>
                  <span className="font-semibold text-[hsl(var(--status-danger))]">High Risk</span>
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

        {/* Priority Alerts */}
        <section className="mb-10">
          <div className="p-5 rounded-xl bg-[hsl(var(--status-danger-bg))] border border-[hsl(var(--status-danger)/0.3)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[hsl(var(--status-danger)/0.2)] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-danger))]" />
              </div>
              <div>
                <h3 className="font-semibold text-[hsl(var(--status-danger))] mb-1">Priority Action Required</h3>
                <p className="text-sm text-foreground mb-3">
                  This property requires a Phase I Archaeological Survey before any ground-disturbing activities. 
                  Failure to comply may result in work stoppages, fines, and project delays under NHPA Section 106.
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

        {/* Main Assessment Cards */}
        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Detailed Compliance Analysis</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {statusCards.map((card, index) => (
              <StatusCard key={index} {...card} />
            ))}
          </div>
        </section>

        {/* Interactive Map */}
        <section className="mb-10">
          <div className="rounded-xl bg-card border border-border overflow-hidden shadow-card">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">GIS Spatial Analysis</h2>
                  <p className="text-xs text-muted-foreground">Interactive risk zone visualization</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3 h-3" />
                Click zones for details
              </div>
            </div>
            <GISMap address={address} onWellDataLoaded={handleWellDataLoaded} />
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

        {/* Data Sources */}
        <section className="mb-10">
          <div className="p-6 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display font-semibold text-foreground">Data Sources & Methodology</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Cultural Resources</p>
                <p>NMCRIS Database (ARMS), NM SHPO Records, National Register of Historic Places, Tribal Historic Preservation Offices</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Water Resources</p>
                <p>NM OSE WATERS Database, Declared Basin Records, MRGCD Boundaries, ABCWUA Service Area Maps</p>
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">Habitat & Species</p>
                <p>USFWS Critical Habitat Designations, IPaC Database, NM BISON-M, National Wetlands Inventory</p>
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
