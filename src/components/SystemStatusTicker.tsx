import { Circle } from "lucide-react";

const SystemStatusTicker = () => {
  const statusMessages = [
    "OSE Database latency <40ms",
    "USFWS IPaC Online",
    "FEMA NFHL Updated 12/08/2025",
    "USDA SSURGO Active",
    "USGS 3DEP Streaming",
    "EPA Envirofacts Connected",
    "BIA AIAN Boundaries Synced",
    "Google Solar API Authenticated",
    "Wildfire Risk Index Live",
    "All 10 Data Pillars Operational",
  ];

  const tickerContent = statusMessages.map((msg, i) => (
    <span key={i} className="inline-flex items-center gap-2 mx-8">
      <Circle className="w-1.5 h-1.5 fill-status-safe text-status-safe" />
      <span>{msg}</span>
    </span>
  ));

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-surface-elevated border-b border-border/50 overflow-hidden">
      <div className="flex items-center h-6">
        <div className="flex-shrink-0 px-3 py-1 bg-primary/10 border-r border-border/50">
          <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-widest">
            SYSTEM STATUS
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="animate-ticker inline-flex whitespace-nowrap text-[10px] font-mono text-muted-foreground">
            {tickerContent}
            {tickerContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusTicker;
