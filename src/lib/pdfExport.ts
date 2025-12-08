// PDF Export functionality using browser print-to-PDF
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
    
    <h2>Cultural Resources Assessment</h2>
    <div class="finding-card">
      <div class="finding-header">
        <span class="finding-title">NMCRIS & Historic Records Analysis</span>
        <span class="status-badge" style="background: ${culturalConfig.text}; color: white;">${culturalConfig.label}</span>
      </div>
      <div class="finding-items">
        <div class="finding-item">
          <span>Historic District Proximity</span>
          <span>0.47 miles</span>
        </div>
        <div class="finding-item">
          <span>Registered Archaeological Sites</span>
          <span>2 within 1 mile</span>
        </div>
        <div class="finding-item">
          <span>NRHP Listed Properties</span>
          <span>1 adjacent</span>
        </div>
        <div class="finding-item">
          <span>Previous Cultural Surveys</span>
          <span>None on record</span>
        </div>
      </div>
      <div class="recommendations">
        <h4>Recommended Actions</h4>
        <ol>
          <li>Commission Phase I Archaeological Survey before ground disturbance</li>
          <li>Submit NMCRIS Project ID application to SHPO</li>
          <li>Initiate tribal consultation per NHPA Section 106</li>
        </ol>
      </div>
    </div>
    
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