import { FileText, MapPin, Scale, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DocumentPreview {
  title: string;
  subtitle: string;
  icon: typeof FileText;
  content: React.ReactNode;
}

const ComprehensiveDeliverable = () => {
  const [currentDoc, setCurrentDoc] = useState(0);

  const documents: DocumentPreview[] = [
    {
      title: "Executive Dashboard",
      subtitle: "Risk Flag Summary",
      icon: FileText,
      content: (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-red-100 border border-red-200">
            <span className="text-[10px] font-medium text-red-800">Cultural Resources</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white">HIGH RISK</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-yellow-100 border border-yellow-200">
            <span className="text-[10px] font-medium text-yellow-800">Water Rights</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-yellow-600 text-white">CAUTION</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-green-100 border border-green-200">
            <span className="text-[10px] font-medium text-green-800">Critical Habitat</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">CLEAR</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-green-100 border border-green-200">
            <span className="text-[10px] font-medium text-green-800">FEMA Flood Zone</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">ZONE X</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-green-100 border border-green-200">
            <span className="text-[10px] font-medium text-green-800">EPA Hazards</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-600 text-white">CLEAR</span>
          </div>
          <div className="mt-3 p-2 rounded bg-primary/10 border border-primary/30">
            <div className="text-[10px] text-muted-foreground">Composite Risk Score</div>
            <div className="text-lg font-bold text-primary">72 / 100</div>
          </div>
        </div>
      ),
    },
    {
      title: "Geospatial Analysis",
      subtitle: "Parcel vs. Regulatory Overlays",
      icon: MapPin,
      content: (
        <div className="relative h-full">
          {/* Fake map with overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a1a] via-[#3d5c2a] to-[#2a4a1a] rounded">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }} />
            
            {/* Parcel boundary */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 border-2 border-yellow-400 bg-yellow-400/20" />
            
            {/* Flood zone overlay */}
            <div className="absolute top-1/4 right-1/4 w-20 h-16 border-2 border-dashed border-blue-400 bg-blue-400/10 opacity-60" />
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-black/70 p-1.5 rounded text-[8px] text-white space-y-1">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 border border-yellow-400 bg-yellow-400/30"></div>
                <span>Parcel</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 border border-dashed border-blue-400 bg-blue-400/30"></div>
                <span>Flood Zone AE</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 border border-dashed border-red-400 bg-red-400/30"></div>
                <span>Historic District</span>
              </div>
            </div>
            
            {/* Attribution */}
            <div className="absolute bottom-1 right-1 text-[7px] text-white/40 font-mono">
              RGDD GIS Analysis
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Regulatory Citations",
      subtitle: "OSE & NMCRIS References",
      icon: Scale,
      content: (
        <div className="space-y-2 text-[10px]">
          <div className="p-2 rounded bg-muted/50 border border-border">
            <div className="font-semibold text-foreground">OSE File Numbers</div>
            <div className="font-mono text-muted-foreground mt-1">
              RG-85456-POD-1<br/>
              RG-85456-POD-2<br/>
              WR-2024-0892
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50 border border-border">
            <div className="font-semibold text-foreground">NMCRIS Activity</div>
            <div className="font-mono text-muted-foreground mt-1">
              LA-145892 (0.3 mi)<br/>
              LA-156234 (0.8 mi)
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50 border border-border">
            <div className="font-semibold text-foreground">FEMA Panel</div>
            <div className="font-mono text-muted-foreground mt-1">
              35001C0235F<br/>
              Effective: 12/20/2019
            </div>
          </div>
          <div className="p-2 rounded bg-muted/50 border border-border">
            <div className="font-semibold text-foreground">EPA Facility IDs</div>
            <div className="font-mono text-muted-foreground mt-1">
              None within 1 mile
            </div>
          </div>
        </div>
      ),
    },
  ];

  const handlePrev = () => {
    setCurrentDoc((prev) => (prev - 1 + documents.length) % documents.length);
  };

  const handleNext = () => {
    setCurrentDoc((prev) => (prev + 1) % documents.length);
  };

  return (
    <section className="py-8 bg-muted/20 relative" id="deliverable-preview">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-5">
          <h2 className="font-display text-xl font-semibold text-foreground tracking-tight mb-1">
            Comprehensive Deliverable
          </h2>
          <p className="text-xs text-muted-foreground">
            Standardized PDF output ready for client presentation and bank packages
          </p>
        </div>

        {/* Document previews - 3 column grid on desktop, carousel on mobile */}
        <div className="max-w-4xl mx-auto">
          {/* Desktop: 3-column grid */}
          <div className="hidden md:grid md:grid-cols-3 gap-4">
            {documents.map((doc, idx) => (
              <div 
                key={idx}
                className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Document header */}
                <div className="bg-muted/50 border-b border-border px-3 py-2 flex items-center gap-2">
                  <doc.icon className="w-3 h-3 text-primary" />
                  <div>
                    <p className="text-[10px] font-semibold text-foreground">Page {idx + 1}: {doc.title}</p>
                    <p className="text-[8px] text-muted-foreground">{doc.subtitle}</p>
                  </div>
                </div>
                {/* Document content */}
                <div className="p-3 h-48 overflow-hidden">
                  {doc.content}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Carousel */}
          <div className="md:hidden">
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
              {/* Document header */}
              <div className="bg-muted/50 border-b border-border px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => {
                    const DocIcon = documents[currentDoc].icon;
                    return <DocIcon className="w-3 h-3 text-primary" />;
                  })()}
                  <div>
                    <p className="text-[10px] font-semibold text-foreground">Page {currentDoc + 1}: {documents[currentDoc].title}</p>
                    <p className="text-[8px] text-muted-foreground">{documents[currentDoc].subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handlePrev}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground">{currentDoc + 1}/{documents.length}</span>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleNext}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Document content */}
              <div className="p-3 h-48 overflow-hidden">
                {documents[currentDoc].content}
              </div>
            </div>
          </div>

          {/* Footer with download indicator */}
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] text-primary font-medium">
              <Download className="w-3 h-3" />
              Instant PDF Download • 12-15 pages • Print-Ready Format
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComprehensiveDeliverable;
