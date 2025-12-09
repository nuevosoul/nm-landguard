import { useState, useEffect } from "react";
import { FileText, AlertTriangle, MapPin, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SampleProperty {
  address: string;
  parcelId: string;
  acreage: string;
  lat: number;
  lng: number;
  findings: {
    cultural: { finding: string; status: "high" | "caution" | "clear" };
    water: { finding: string; status: "high" | "caution" | "clear" };
    habitat: { finding: string; status: "high" | "caution" | "clear" };
    flood: { finding: string; status: "high" | "caution" | "clear" };
    oilGas: { finding: string; status: "high" | "caution" | "clear" };
    solar: { finding: string; status: "excellent" | "good" | "fair" };
    emergency: { finding: string; status: "high" | "caution" | "clear" };
  };
}

const sampleProperties: SampleProperty[] = [
  {
    address: "777 1st Street SW, Albuquerque, NM 87102",
    parcelId: "1-012-043-278-456-10000",
    acreage: "27.32 acres",
    lat: 35.075633,
    lng: -106.6489752,
    findings: {
      cultural: { finding: "Downtown Historic District", status: "caution" },
      water: { finding: "Municipal water connected", status: "clear" },
      habitat: { finding: "No overlap detected", status: "clear" },
      flood: { finding: "Zone X (Minimal)", status: "clear" },
      oilGas: { finding: "No wells/pipelines", status: "clear" },
      solar: { finding: "3,200 hrs/yr", status: "excellent" },
      emergency: { finding: "Fire 0.8mi (ISO-3)", status: "clear" },
    },
  },
  {
    address: "2401 12th Street NW, Albuquerque, NM 87104",
    parcelId: "1-015-032-156-789-20000",
    acreage: "0.18 acres",
    lat: 35.1028,
    lng: -106.6722,
    findings: {
      cultural: { finding: "Old Town proximity 0.5mi", status: "caution" },
      water: { finding: "Declared Basin (1956)", status: "caution" },
      habitat: { finding: "Rio Grande bosque 0.3mi", status: "caution" },
      flood: { finding: "Zone AE (High Risk)", status: "high" },
      oilGas: { finding: "No wells/pipelines", status: "clear" },
      solar: { finding: "2,950 hrs/yr", status: "excellent" },
      emergency: { finding: "Fire 1.2mi (ISO-4)", status: "clear" },
    },
  },
  {
    address: "4801 Indian School Rd NE, Albuquerque, NM 87110",
    parcelId: "1-023-018-445-123-30000",
    acreage: "2.45 acres",
    lat: 35.0992,
    lng: -106.5789,
    findings: {
      cultural: { finding: "No recorded sites", status: "clear" },
      water: { finding: "Well permit required", status: "caution" },
      habitat: { finding: "No overlap detected", status: "clear" },
      flood: { finding: "Zone X (Minimal)", status: "clear" },
      oilGas: { finding: "No wells/pipelines", status: "clear" },
      solar: { finding: "3,150 hrs/yr", status: "excellent" },
      emergency: { finding: "Fire 1.8mi (ISO-5)", status: "clear" },
    },
  },
  {
    address: "1776 Montaño Rd NW, Albuquerque, NM 87107",
    parcelId: "1-008-055-892-654-40000",
    acreage: "5.12 acres",
    lat: 35.1342,
    lng: -106.6298,
    findings: {
      cultural: { finding: "Sandia Pueblo 2.1mi", status: "caution" },
      water: { finding: "MRGCD irrigation", status: "caution" },
      habitat: { finding: "Bosque buffer zone", status: "caution" },
      flood: { finding: "Zone AO (Shallow)", status: "caution" },
      oilGas: { finding: "No wells/pipelines", status: "clear" },
      solar: { finding: "3,100 hrs/yr", status: "excellent" },
      emergency: { finding: "Fire 2.4mi (ISO-6)", status: "caution" },
    },
  },
  {
    address: "6600 Coors Blvd NW, Albuquerque, NM 87120",
    parcelId: "1-045-012-334-987-50000",
    acreage: "12.78 acres",
    lat: 35.1567,
    lng: -106.7123,
    findings: {
      cultural: { finding: "Petroglyph Natl Mon 0.4mi", status: "high" },
      water: { finding: "Well depth 400ft+", status: "caution" },
      habitat: { finding: "Desert scrub habitat", status: "clear" },
      flood: { finding: "Zone X (Minimal)", status: "clear" },
      oilGas: { finding: "No wells/pipelines", status: "clear" },
      solar: { finding: "3,250 hrs/yr", status: "excellent" },
      emergency: { finding: "Fire 3.2mi (ISO-7)", status: "caution" },
    },
  },
];

interface SampleReportPreviewProps {
  onViewSample: () => void;
}

const SampleReportPreview = ({ onViewSample }: SampleReportPreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const currentProperty = sampleProperties[currentIndex];
  
  // Auto-cycle through properties
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sampleProperties.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);
  
  const handlePrev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + sampleProperties.length) % sampleProperties.length);
  };
  
  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % sampleProperties.length);
  };
  
  const getStatusBadge = (status: string, label: string) => {
    const configs: Record<string, { bg: string; text: string; icon?: boolean }> = {
      high: { bg: "bg-red-100", text: "text-red-700", icon: true },
      caution: { bg: "bg-yellow-100", text: "text-yellow-700" },
      clear: { bg: "bg-green-100", text: "text-green-700" },
      excellent: { bg: "bg-amber-100", text: "text-amber-700" },
      good: { bg: "bg-green-100", text: "text-green-700" },
      fair: { bg: "bg-yellow-100", text: "text-yellow-700" },
    };
    
    const config = configs[status] || configs.clear;
    const displayLabel = status === "high" ? "HIGH RISK" : 
                         status === "caution" ? "CAUTION" : 
                         status === "excellent" ? "EXCELLENT" :
                         status === "good" ? "GOOD" :
                         status === "fair" ? "FAIR" : "NO CONFLICT";
    
    return (
      <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold ${config.bg} ${config.text}`}>
        {config.icon && <AlertTriangle className="w-2 h-2" />}
        {displayLabel}
      </span>
    );
  };

  const googleMapsApiKey = "AIzaSyC9PnMfLmIhlvZTm6p4YlvYrTGRwfLfLvc";

  return (
    <section className="py-8 bg-muted/20 relative" id="output-preview">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-5">
          <h2 className="font-display text-xl font-semibold text-foreground tracking-tight mb-1">
            Output Preview
          </h2>
          <p className="text-xs text-muted-foreground">
            Standardized Pre-Compliance Desktop Review
          </p>
        </div>

        {/* Report mockup */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-elevated">
            {/* PDF Header bar */}
            <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground">RGDD-2024-{String.fromCharCode(65 + currentIndex)}7F3K{currentIndex + 2}.pdf</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Property selector */}
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {sampleProperties.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsAutoPlaying(false);
                          setCurrentIndex(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          idx === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                      />
                    ))}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={handleNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-xs font-mono text-muted-foreground/70">12 pages • 2.4 MB</span>
              </div>
            </div>

            {/* PDF Content mockup */}
            <div className="p-6 bg-[hsl(220_20%_97%)]">
              <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                {/* Report header */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <h3 className="font-display text-lg text-gray-900 font-semibold">Environmental Due Diligence Report</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">Report ID: RGDD-2024-{String.fromCharCode(65 + currentIndex)}7F3K{currentIndex + 2}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Generated: Dec 09, 2024</p>
                    <p className="text-xs text-gray-500">Valid: 90 days</p>
                  </div>
                </div>

                {/* Property info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-sm text-gray-900 font-medium">{currentProperty.address}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Parcel ID:</span>
                      <span className="text-gray-900 font-mono ml-2">{currentProperty.parcelId}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Acreage:</span>
                      <span className="text-gray-900 font-mono ml-2">{currentProperty.acreage}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="text-gray-900 font-mono ml-2">{currentProperty.lat.toFixed(4)}°N, {Math.abs(currentProperty.lng).toFixed(4)}°W</span>
                    </div>
                  </div>
                </div>

                {/* Map - Real Google Satellite imagery */}
                <div className="mb-4 rounded border border-gray-300 overflow-hidden">
                  <div className="h-32 relative bg-gray-800">
                    <img 
                      key={currentIndex} // Force re-render on property change
                      src={`https://maps.googleapis.com/maps/api/staticmap?center=${currentProperty.lat},${currentProperty.lng}&zoom=17&size=800x200&maptype=satellite&key=${googleMapsApiKey}`}
                      alt={`Satellite view of ${currentProperty.address}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.classList.add('bg-gradient-to-br', 'from-[#2d5016]', 'via-[#3d6b1c]', 'to-[#2d5016]');
                      }}
                    />
                    {/* Parcel boundary overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-14 border-2 border-yellow-400 bg-yellow-400/10 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                      Google Satellite
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                      Sample {currentIndex + 1} of {sampleProperties.length}
                    </div>
                  </div>
                </div>

                {/* Risk flags table */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Risk Flag Summary</h4>
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Category</th>
                          <th className="text-left px-3 py-2 font-medium text-gray-600">Finding</th>
                          <th className="text-center px-3 py-2 font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.cultural.status === 'high' ? 'bg-red-50' : currentProperty.findings.cultural.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Cultural Resources</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.cultural.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.cultural.status, "Cultural")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.water.status === 'high' ? 'bg-red-50' : currentProperty.findings.water.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Water Rights</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.water.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.water.status, "Water")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.habitat.status === 'high' ? 'bg-red-50' : currentProperty.findings.habitat.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Critical Habitat</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.habitat.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.habitat.status, "Habitat")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.flood.status === 'high' ? 'bg-red-50' : currentProperty.findings.flood.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">FEMA Flood Hazard</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.flood.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.flood.status, "Flood")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.oilGas.status === 'high' ? 'bg-red-50' : currentProperty.findings.oilGas.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Oil & Gas Infrastructure</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.oilGas.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.oilGas.status, "OilGas")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 bg-amber-50`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Solar Potential</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.solar.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.solar.status, "Solar")}
                          </td>
                        </tr>
                        <tr className={`border-t border-gray-200 ${currentProperty.findings.emergency.status === 'high' ? 'bg-red-50' : currentProperty.findings.emergency.status === 'caution' ? 'bg-yellow-50' : 'bg-green-50'}`}>
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Emergency Services</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">{currentProperty.findings.emergency.finding}</td>
                          <td className="px-2 py-1.5 text-center">
                            {getStatusBadge(currentProperty.findings.emergency.status, "Emergency")}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Truncation indicator */}
                <div className="text-center text-xs text-gray-400 pt-2 border-t border-gray-200 border-dashed">
                  — Page 1 of 12 • See full report for detailed findings —
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="bg-muted/50 border-t border-border px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Full report includes: Executive Summary, Detailed Findings, Maps, Data Tables, Recommendations
              </p>
              <Button variant="outline" size="sm" onClick={onViewSample} className="text-xs">
                <Download className="w-3 h-3 mr-1.5" />
                View Full Sample
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleReportPreview;
