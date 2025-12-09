import { useState } from "react";
import { FileText, Globe, Database, Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportPackageProps {
  onExportPDF: () => void;
  onExportKMZ?: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
}

const ExportPackage = ({ onExportPDF, onExportKMZ, onExportCSV, isExporting }: ExportPackageProps) => {
  const [selectedFormat, setSelectedFormat] = useState<"pdf" | "kmz" | "csv">("pdf");

  const exportOptions = [
    {
      id: "pdf" as const,
      icon: FileText,
      title: "Official Compliance Report",
      description: "Full formatted PDF with executive summary, maps, and citations",
      badge: "RECOMMENDED",
      available: true,
    },
    {
      id: "kmz" as const,
      icon: Globe,
      title: "Google Earth / GIS Layer",
      description: "KMZ file with parcel boundary, risk zones, and POI markers",
      badge: "PRO",
      available: false,
    },
    {
      id: "csv" as const,
      icon: Database,
      title: "Raw Data & Coordinates",
      description: "Complete dataset export for custom analysis and integration",
      badge: "PRO",
      available: false,
    },
  ];

  const handleExport = () => {
    if (selectedFormat === "pdf") {
      onExportPDF();
    } else if (selectedFormat === "kmz" && onExportKMZ) {
      onExportKMZ();
    } else if (selectedFormat === "csv" && onExportCSV) {
      onExportCSV();
    }
  };

  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
          Export Package
        </h3>
        <span className="text-[9px] font-mono text-muted-foreground">
          SELECT FORMAT
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {exportOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedFormat === option.id;
          
          return (
            <button
              key={option.id}
              onClick={() => option.available && setSelectedFormat(option.id)}
              disabled={!option.available}
              className={`w-full p-3 rounded border text-left transition-all ${
                isSelected 
                  ? "bg-primary/10 border-primary/50" 
                  : option.available
                    ? "bg-muted/20 border-border hover:border-primary/30"
                    : "bg-muted/10 border-border/50 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-primary/20" : "bg-muted/30"
                }`}>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <Icon className={`w-4 h-4 ${option.available ? "text-muted-foreground" : "text-muted-foreground/50"}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {option.title}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                      option.badge === "RECOMMENDED" 
                        ? "bg-status-safe/20 text-status-safe" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button 
        onClick={handleExport}
        disabled={isExporting || !exportOptions.find(o => o.id === selectedFormat)?.available}
        className="w-full h-9 text-xs font-mono"
        variant="hero"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            GENERATING...
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 mr-2" />
            DOWNLOAD {selectedFormat.toUpperCase()}
          </>
        )}
      </Button>
    </div>
  );
};

export default ExportPackage;
