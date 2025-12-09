import { FileText, AlertTriangle, MapPin, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SampleReportPreviewProps {
  onViewSample: () => void;
}

const SampleReportPreview = ({ onViewSample }: SampleReportPreviewProps) => {
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
                <span className="text-xs font-mono text-muted-foreground">RGDD-2024-A7F3K2.pdf</span>
              </div>
              <span className="text-xs font-mono text-muted-foreground/70">12 pages • 2.4 MB</span>
            </div>

            {/* PDF Content mockup */}
            <div className="p-6 bg-[hsl(220_20%_97%)]">
              <div className="bg-white rounded shadow-sm border border-gray-200 p-6">
                {/* Report header */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-4">
                  <div>
                    <h3 className="font-display text-lg text-gray-900 font-semibold">Environmental Due Diligence Report</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">Report ID: RGDD-2024-A7F3K2</p>
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
                    <span className="text-sm text-gray-900 font-medium">777 1st Street SW, Albuquerque, NM 87102</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Parcel ID:</span>
                      <span className="text-gray-900 font-mono ml-2">1-012-043-278-456-10000</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Acreage:</span>
                      <span className="text-gray-900 font-mono ml-2">0.34 acres</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Coordinates:</span>
                      <span className="text-gray-900 font-mono ml-2">35.0844°N, 106.6504°W</span>
                    </div>
                  </div>
                </div>

                {/* Map mockup */}
                <div className="mb-4 rounded border border-gray-300 overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-[#2d5016] via-[#3d6b1c] to-[#2d5016] relative">
                    {/* Fake satellite imagery pattern */}
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    {/* Parcel boundary */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 border-2 border-yellow-400 bg-yellow-400/10" />
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded font-mono">
                      Google Satellite
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
                        <tr className="border-t border-gray-200 bg-red-50">
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Cultural Resources</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">Sandia Pueblo 0.8mi</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-red-100 text-red-700">
                              <AlertTriangle className="w-2 h-2" />
                              HIGH RISK
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-yellow-50">
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Water Rights</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">Declared Basin (1956)</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-yellow-100 text-yellow-700">
                              CAUTION
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-green-50">
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Critical Habitat</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">No overlap detected</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-100 text-green-700">
                              NO CONFLICT
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-green-50">
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">FEMA Flood Hazard</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">Zone X (Minimal)</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-100 text-green-700">
                              NO CONFLICT
                            </span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-green-50">
                          <td className="px-2 py-1.5 text-gray-900 text-[10px]">Oil & Gas Infrastructure</td>
                          <td className="px-2 py-1.5 text-gray-600 font-mono text-[10px]">No wells/pipelines</td>
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-green-100 text-green-700">
                              NO CONFLICT
                            </span>
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
