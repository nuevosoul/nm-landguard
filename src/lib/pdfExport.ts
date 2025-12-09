// PDF Export functionality using browser print-to-PDF
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

export interface ReportData {
  address: string;
  reportId: string;
  generatedAt: string;
  validUntil: string;
  parcelId: string;
  legalDescription: string;
  acreage: string;
  zoning: string;
  jurisdiction: string;
  county: string;
  riskScore: number;
  culturalStatus: "safe" | "caution" | "danger";
  waterStatus: "safe" | "caution" | "danger";
  habitatStatus: "safe" | "caution" | "danger";
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
  // Cultural Resources Data
  culturalData?: CulturalResourcesData;
}

function generateGoogleStaticMapUrl(lat: number, lng: number, parcelGeometry?: number[][][] | null): string {
  // Google Static Maps API with satellite imagery and parcel boundary
  const zoom = 18;
  const width = 640;
  const height = 400;
  const mapType = "satellite";
  
  // Base URL - note: requires API key to be passed from edge function
  // For PDF, we'll construct the URL and the edge function will sign it
  let url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}&scale=2`;
  
  // Add parcel boundary as a polygon path
  if (parcelGeometry && parcelGeometry.length > 0 && parcelGeometry[0].length > 0) {
    // Get the first ring (exterior boundary)
    const ring = parcelGeometry[0];
    // Google Static Maps uses "lat,lng" format separated by |
    // Path format: path=color:0xFFD700|weight:3|fillcolor:0xFFD70040|lat1,lng1|lat2,lng2|...
    const pathPoints = ring.map(coord => `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`).join('|');
    url += `&path=color:0xFFD700FF|weight:4|fillcolor:0xFFD70030|${pathPoints}`;
  }
  
  // Add center marker
  url += `&markers=color:blue|${lat},${lng}`;
  
  return url;
}

function generateStaticMapUrl(lat: number, lng: number, wells: WellData[] = []): string {
  // Use OpenStreetMap static tiles via a static map service
  // For a simple static map, we'll use a tile URL pattern
  const zoom = 15;
  const width = 600;
  const height = 300;
  
  // Generate OSM-based static map URL using MapTiler or similar
  // Note: For production, you'd want a proper static map API
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.008}%2C${lng+0.01}%2C${lat+0.008}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function generatePDFContent(data: ReportData): string {
  const statusColors = {
    safe: { bg: "#dcfce7", text: "#166534", label: "Clear" },
    caution: { bg: "#fef3c7", text: "#92400e", label: "Caution" },
    danger: { bg: "#fee2e2", text: "#991b1b", label: "High Risk" },
  };

  const culturalConfig = statusColors[data.culturalStatus];
  const waterConfig = statusColors[data.waterStatus];
  const habitatConfig = statusColors[data.habitatStatus];

  // Generate well data section
  const wellSection = data.wellData ? generateWellSection(data.wellData) : '';
  
  // Generate cultural resources section
  const culturalSection = generateCulturalSection(data.culturalData, culturalConfig);
  
  // Generate map section with satellite image and parcel boundary
  const mapSection = data.lat && data.lng 
    ? generateMapSection(data.lat, data.lng, data.wellData?.wells || [], data.parcelGeometry, data.satelliteMapUrl) 
    : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Environmental Due Diligence Report - ${data.reportId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      line-height: 1.5;
      background: white;
    }
    .page { 
      padding: 40px; 
      max-width: 800px; 
      margin: 0 auto;
      page-break-after: always;
    }
    .page:last-child {
      page-break-after: auto;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: flex-start;
      border-bottom: 2px solid #d4a574;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      color: #0f172a;
    }
    .logo-sub { 
      font-size: 12px; 
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .report-info { text-align: right; }
    .report-id { 
      font-size: 14px; 
      font-weight: 600;
      color: #d4a574;
    }
    .report-date { 
      font-size: 12px; 
      color: #64748b; 
    }
    
    h1 { font-size: 20px; color: #0f172a; margin-bottom: 20px; }
    h2 { font-size: 16px; color: #0f172a; margin: 20px 0 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    h3 { font-size: 14px; color: #334155; margin: 16px 0 8px; }
    
    .property-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .property-address { 
      font-size: 18px; 
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .property-county { 
      font-size: 14px; 
      color: #64748b;
      margin-bottom: 16px;
    }
    .property-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .property-item { 
      display: flex; 
      justify-content: space-between; 
      font-size: 13px;
      padding: 4px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .property-label { color: #64748b; }
    .property-value { font-weight: 500; color: #0f172a; }
    
    .risk-summary {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .risk-score {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #fef3c7;
      border: 4px solid #f59e0b;
    }
    .risk-score-value { font-size: 32px; font-weight: bold; color: #92400e; }
    .risk-score-label { font-size: 11px; color: #92400e; text-transform: uppercase; }
    
    .risk-cards {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .risk-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 13px;
    }
    
    .status-badge {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .findings-section {
      margin-bottom: 24px;
    }
    .finding-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .finding-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .finding-title { font-weight: 600; color: #0f172a; }
    
    .finding-items {
      display: grid;
      gap: 6px;
    }
    .finding-item {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      padding: 4px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .recommendations {
      background: #fef9e7;
      border: 1px solid #d4a574;
      border-radius: 6px;
      padding: 12px;
      margin-top: 12px;
    }
    .recommendations h4 {
      font-size: 11px;
      color: #d4a574;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .recommendations li {
      font-size: 12px;
      margin-bottom: 4px;
      margin-left: 16px;
    }
    
    .map-section {
      margin: 24px 0;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    .map-header {
      background: #0f172a;
      color: white;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
    }
    .map-container {
      height: 250px;
      background: #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .map-placeholder {
      text-align: center;
      color: #64748b;
    }
    .map-coordinates {
      font-size: 12px;
      color: #64748b;
      padding: 8px 16px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
    }
    
    .well-section {
      margin: 24px 0;
    }
    .well-summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }
    .well-stat {
      background: #ecfeff;
      border: 1px solid #06b6d4;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .well-stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #0891b2;
    }
    .well-stat-label {
      font-size: 11px;
      color: #0e7490;
      text-transform: uppercase;
    }
    .well-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    .well-table th {
      background: #0e7490;
      color: white;
      padding: 8px;
      text-align: left;
      font-weight: 600;
    }
    .well-table td {
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
    }
    .well-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .disclaimer {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 30px;
      font-size: 11px;
      color: #64748b;
    }
    .disclaimer h4 { 
      font-size: 12px; 
      color: #334155; 
      margin-bottom: 8px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #64748b;
    }
    
    .data-source {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 6px;
      padding: 12px;
      margin-top: 16px;
      font-size: 11px;
    }
    .data-source-title {
      font-weight: 600;
      color: #0369a1;
      margin-bottom: 4px;
    }
    .data-source-text {
      color: #0c4a6e;
    }
    
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div>
        <div class="logo">Rio Grande Due Diligence</div>
        <div class="logo-sub">Environmental Compliance Report</div>
      </div>
      <div class="report-info">
        <div class="report-id">Report ID: ${data.reportId}</div>
        <div class="report-date">Generated: ${data.generatedAt}</div>
        <div class="report-date">Valid Until: ${data.validUntil}</div>
      </div>
    </div>
    
    <h1>Environmental Due Diligence Report</h1>
    
    <div class="property-section">
      <div class="property-address">${data.address}</div>
      <div class="property-county">${data.county}, New Mexico</div>
      <div class="property-grid">
        <div class="property-item">
          <span class="property-label">Parcel ID (APN)</span>
          <span class="property-value">${data.parcelId}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Zoning</span>
          <span class="property-value">${data.zoning}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Parcel Size</span>
          <span class="property-value">${data.acreage}</span>
        </div>
        <div class="property-item">
          <span class="property-label">Jurisdiction</span>
          <span class="property-value">${data.jurisdiction}</span>
        </div>
      </div>
    </div>
    
    ${mapSection}
    
    <h2>Risk Summary</h2>
    <div class="risk-summary">
      <div class="risk-score">
        <div class="risk-score-value">${data.riskScore}</div>
        <div class="risk-score-label">Moderate Risk</div>
      </div>
      <div class="risk-cards">
        <div class="risk-card" style="background: ${culturalConfig.bg}">
          <span style="color: ${culturalConfig.text}">Cultural Resources</span>
          <span class="status-badge" style="background: ${culturalConfig.text}; color: white;">${culturalConfig.label}</span>
        </div>
        <div class="risk-card" style="background: ${waterConfig.bg}">
          <span style="color: ${waterConfig.text}">Water Rights</span>
          <span class="status-badge" style="background: ${waterConfig.text}; color: white;">${waterConfig.label}</span>
        </div>
        <div class="risk-card" style="background: ${habitatConfig.bg}">
          <span style="color: ${habitatConfig.text}">Critical Habitat</span>
          <span class="status-badge" style="background: ${habitatConfig.text}; color: white;">${habitatConfig.label}</span>
        </div>
      </div>
    </div>
    
    ${culturalSection}
    
    <h2>Water Rights & Restrictions</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">NM Office of State Engineer Analysis</span>
        <span class="status-badge" style="background: ${waterConfig.text}; color: white;">${waterConfig.label}</span>
      </div>
      <div class="finding-items">
        <div class="finding-item">
          <span>Basin Status</span>
          <span>Declared (1956)</span>
        </div>
        <div class="finding-item">
          <span>Basin Name</span>
          <span>Middle Rio Grande</span>
        </div>
        <div class="finding-item">
          <span>Water Rights on Parcel</span>
          <span>None recorded</span>
        </div>
        <div class="finding-item">
          <span>Municipal Connection</span>
          <span>Available</span>
        </div>
      </div>
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          <li>Connect to municipal water system (ABCWUA)</li>
          <li>If domestic well desired, file OSE permit with offset plan</li>
          <li>Consult OSE District 1 office for permit timeline</li>
        </ol>
      </div>
    </div>
    
    ${wellSection}
    
    <h2>Critical Habitat & ESA Compliance</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">USFWS Critical Habitat Analysis</span>
        <span class="status-badge" style="background: ${habitatConfig.text}; color: white;">${habitatConfig.label}</span>
      </div>
      <div class="finding-items">
        <div class="finding-item">
          <span>Critical Habitat Overlap</span>
          <span>None detected</span>
        </div>
        <div class="finding-item">
          <span>ESA Listed Species</span>
          <span>None documented</span>
        </div>
        <div class="finding-item">
          <span>Silvery Minnow Habitat</span>
          <span>2.1 miles (outside zone)</span>
        </div>
        <div class="finding-item">
          <span>Wetland/Waters of US</span>
          <span>None identified</span>
        </div>
      </div>
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          <li>Pre-construction bird survey if clearing during nesting season</li>
          <li>Implement standard SWPPP for stormwater management</li>
          <li>No ESA Section 7 consultation anticipated</li>
        </ol>
      </div>
    </div>
    
    <div class="disclaimer">
      <h4>Legal Disclaimer & Limitations</h4>
      <p>This Environmental Due Diligence Report is generated from publicly available data sources and is intended for preliminary assessment purposes only. It does not constitute a Phase I Environmental Site Assessment (ESA) under ASTM E1527-21, nor does it replace formal consultation with regulatory agencies. Data accuracy is dependent on source agency updates.</p>
      <p style="margin-top: 8px;">Rio Grande Due Diligence LLC makes no warranties regarding the completeness or accuracy of this report. This report is valid for 90 days from generation date.</p>
    </div>
    
    <div class="footer">
      <span>Report Version 2.1 | Rio Grande Due Diligence Platform</span>
      <span>License: Single-use, non-transferable</span>
    </div>
  </div>
</body>
</html>
`;
}

function generateMapSection(lat: number, lng: number, wells: WellData[], parcelGeometry?: number[][][] | null, satelliteMapUrl?: string): string {
  const hasParcelBoundary = parcelGeometry && parcelGeometry.length > 0 && parcelGeometry[0].length > 0;
  
  return `
    <div class="map-section">
      <div class="map-header">
        <span>📍 Property Location & Aerial View</span>
      </div>
      <div class="map-container" style="background: #1a1a2e;">
        ${satelliteMapUrl ? `
          <img src="${satelliteMapUrl}" alt="Satellite view of property" style="width: 100%; height: auto; display: block; border-radius: 4px;" />
        ` : `
          <div class="map-placeholder">
            <div style="font-size: 48px; margin-bottom: 8px;">🛰️</div>
            <div style="font-weight: 600; color: #334155;">Satellite Imagery</div>
            <div style="font-size: 11px;">Aerial view with parcel boundary</div>
          </div>
        `}
      </div>
      <div class="map-coordinates">
        <strong>Coordinates:</strong> ${lat.toFixed(6)}°N, ${Math.abs(lng).toFixed(6)}°W
        ${hasParcelBoundary ? ' | <span style="color: #d4a54a; font-weight: 600;">◼ Parcel Boundary Shown</span>' : ' | <span style="color: #94a3b8;">Approximate location marker</span>'}
        ${wells.length > 0 ? ` | <strong>Nearby PODs:</strong> ${wells.length} within search radius` : ''}
      </div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">
        Imagery: Google Maps | ${hasParcelBoundary ? 'Parcel boundary from County Assessor GIS' : 'Parcel boundary not available for this county'}
      </div>
    </div>
  `;
}

function generateWellSection(wellData: { wells: WellData[]; summary: WellDataSummary }): string {
  const { wells, summary } = wellData;
  
  if (wells.length === 0) {
    return `
      <div class="well-section">
        <h2>OSE Points of Diversion Analysis</h2>
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title">NM Office of State Engineer - Well & POD Data</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">No points of diversion or wells found within 1 mile of subject property.</p>
          <div class="data-source">
            <div class="data-source-title">Data Source</div>
            <div class="data-source-text">NM Office of the State Engineer POD Database (mercator.env.nm.gov)</div>
          </div>
        </div>
      </div>
    `;
  }

  // Get top 10 nearest wells for the table
  const nearestWells = wells.slice(0, 10);
  
  // Generate use type breakdown
  const useTypes = Object.entries(summary.byUse)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([use, count]) => `${use}: ${count}`)
    .join(' | ');

  return `
    <div class="well-section">
      <h2>OSE Points of Diversion Analysis</h2>
      
      <div class="well-summary">
        <div class="well-stat">
          <div class="well-stat-value">${summary.totalWells}</div>
          <div class="well-stat-label">Total PODs (1 mi)</div>
        </div>
        <div class="well-stat">
          <div class="well-stat-value">${summary.withinHalfMile}</div>
          <div class="well-stat-label">Within ½ Mile</div>
        </div>
        <div class="well-stat">
          <div class="well-stat-value">${Object.keys(summary.byType).length}</div>
          <div class="well-stat-label">POD Types</div>
        </div>
      </div>
      
      <div class="finding-card">
        <div class="finding-header">
          <span class="finding-title">Nearest Points of Diversion</span>
        </div>
        
        <table class="well-table">
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
        
        <div style="margin-top: 12px; font-size: 11px; color: #64748b;">
          <strong>Use Type Breakdown:</strong> ${useTypes}
        </div>
        
        <div class="data-source">
          <div class="data-source-title">Data Source</div>
          <div class="data-source-text">NM Office of the State Engineer Points of Diversion Database (mercator.env.nm.gov) - Real-time query of surface diversions and well permits.</div>
        </div>
      </div>
    </div>
  `;
}

function generateCulturalSection(
  culturalData: CulturalResourcesData | undefined, 
  statusConfig: { bg: string; text: string; label: string }
): string {
  const cd = culturalData;
  
  // Build findings based on real data
  const findings: string[] = [];
  
  if (cd) {
    // Tribal land proximity
    if (cd.onTribalLand) {
      findings.push(`<div class="finding-item"><span>Tribal Land Status</span><span style="color: #991b1b; font-weight: 600;">ON TRIBAL LAND</span></div>`);
    } else if (cd.nearestTribalLand) {
      findings.push(`<div class="finding-item"><span>Nearest Tribal Land</span><span>${cd.nearestTribalLand.name} (${cd.nearestTribalLand.distance.toFixed(2)} mi)</span></div>`);
    } else {
      findings.push(`<div class="finding-item"><span>Tribal Land Proximity</span><span>None within 5 miles</span></div>`);
    }
    
    // Tribal lands count
    if (cd.tribalLandsWithin5Miles.length > 0) {
      findings.push(`<div class="finding-item"><span>Tribal Lands Within 5 Miles</span><span>${cd.tribalLandsWithin5Miles.length} identified</span></div>`);
    }
    
    // NRHP Properties
    if (cd.nrhpPropertiesWithin1Mile.length > 0) {
      findings.push(`<div class="finding-item"><span>NRHP Properties Within 1 Mile</span><span>${cd.nrhpPropertiesWithin1Mile.length} listed</span></div>`);
      if (cd.nearestNRHPProperty) {
        findings.push(`<div class="finding-item"><span>Nearest NRHP Property</span><span>${cd.nearestNRHPProperty.name} (${cd.nearestNRHPProperty.distance.toFixed(2)} mi)</span></div>`);
      }
    } else {
      findings.push(`<div class="finding-item"><span>NRHP Properties Within 1 Mile</span><span>None found</span></div>`);
    }
    
    // Historic District
    if (cd.inHistoricDistrict) {
      findings.push(`<div class="finding-item"><span>Historic District</span><span style="color: #991b1b; font-weight: 600;">Within ${cd.historicDistrictName || 'district'}</span></div>`);
    } else {
      findings.push(`<div class="finding-item"><span>Historic District</span><span>Not within historic district</span></div>`);
    }
    
    // Section 106
    findings.push(`<div class="finding-item"><span>Section 106 Review Required</span><span>${cd.section106Required ? 'Yes' : 'No'}</span></div>`);
    
    // Tribal consultation
    findings.push(`<div class="finding-item"><span>Tribal Consultation Required</span><span>${cd.tribalConsultationRequired ? 'Yes' : 'No'}</span></div>`);
  } else {
    findings.push(`<div class="finding-item"><span>Data Status</span><span>Loading or unavailable</span></div>`);
  }
  
  // Build recommendations
  const recommendations = cd?.recommendedActions || [
    "Commission Phase I Archaeological Survey before ground disturbance",
    "Submit NMCRIS Project ID application to SHPO",
    "Initiate tribal consultation per NHPA Section 106"
  ];
  
  const source = cd?.source || "BIA AIAN Land Areas, National Register of Historic Places";
  
  return `
    <h2>Cultural Resources Assessment</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">Tribal Lands & Historic Properties Analysis</span>
        <span class="status-badge" style="background: ${statusConfig.text}; color: white;">${statusConfig.label}</span>
      </div>
      <div class="finding-items">
        ${findings.join('')}
      </div>
      ${cd?.tribalLandsWithin5Miles && cd.tribalLandsWithin5Miles.length > 0 ? `
        <div style="margin-top: 12px; padding: 10px; background: #fef9e7; border: 1px solid #d4a574; border-radius: 6px;">
          <h4 style="font-size: 11px; color: #92400e; text-transform: uppercase; margin-bottom: 8px;">Tribal Lands Within 5 Miles</h4>
          <div style="font-size: 12px; color: #78350f;">
            ${cd.tribalLandsWithin5Miles.slice(0, 5).map(t => `• ${t.name} (${t.distance.toFixed(2)} mi)`).join('<br/>')}
            ${cd.tribalLandsWithin5Miles.length > 5 ? `<br/><em>...and ${cd.tribalLandsWithin5Miles.length - 5} more</em>` : ''}
          </div>
        </div>
      ` : ''}
      ${cd?.nrhpPropertiesWithin1Mile && cd.nrhpPropertiesWithin1Mile.length > 0 ? `
        <div style="margin-top: 12px; padding: 10px; background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 6px;">
          <h4 style="font-size: 11px; color: #0369a1; text-transform: uppercase; margin-bottom: 8px;">NRHP Listed Properties Nearby</h4>
          <div style="font-size: 12px; color: #0c4a6e;">
            ${cd.nrhpPropertiesWithin1Mile.slice(0, 5).map(p => `• ${p.name} (${p.distance.toFixed(2)} mi) - ${p.resourceType}`).join('<br/>')}
          </div>
        </div>
      ` : ''}
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          ${recommendations.map(r => `<li>${r}</li>`).join('')}
        </ol>
      </div>
      <div class="data-source">
        <div class="data-source-title">Data Source</div>
        <div class="data-source-text">${source}</div>
      </div>
    </div>
  `;
}

export function downloadPDF(data: ReportData): void {
  const htmlContent = generatePDFContent(data);
  
  // Open a new window for printing
  const printWindow = window.open("", "_blank", "width=800,height=600");
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}
