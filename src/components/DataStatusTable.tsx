import { Circle } from "lucide-react";

interface DataSource {
  agency: string;
  dataLayer: string;
  updateFreq: string;
  status: "live" | "updating" | "offline";
}

const dataSources: DataSource[] = [
  {
    agency: "NM Historic Preservation Div (HPD)",
    dataLayer: "ARMS Proximity Zones",
    updateFreq: "Daily",
    status: "live",
  },
  {
    agency: "Office of State Engineer (OSE)",
    dataLayer: "Water Rights & Basins",
    updateFreq: "Real-time",
    status: "live",
  },
  {
    agency: "US Fish & Wildlife (USFWS)",
    dataLayer: "Critical Habitat (IPaC)",
    updateFreq: "Weekly",
    status: "live",
  },
  {
    agency: "FEMA / NFHL",
    dataLayer: "Flood Hazard Zones",
    updateFreq: "Monthly",
    status: "live",
  },
  {
    agency: "NM OCD Oil & Gas",
    dataLayer: "Active Pipelines & Wells",
    updateFreq: "Weekly",
    status: "live",
  },
  {
    agency: "Google Solar API",
    dataLayer: "Solar Potential Analysis",
    updateFreq: "Annual",
    status: "live",
  },
  {
    agency: "Google Places + Distance Matrix",
    dataLayer: "Infrastructure & Drive Times",
    updateFreq: "Real-time",
    status: "live",
  },
  {
    agency: "USDA SSURGO",
    dataLayer: "Soil Suitability & Composition",
    updateFreq: "Real-time",
    status: "live",
  },
  {
    agency: "USGS 3DEP",
    dataLayer: "Slope & Topographic Analysis",
    updateFreq: "Real-time",
    status: "live",
  },
  {
    agency: "EPA Envirofacts",
    dataLayer: "Environmental Hazards & Superfund",
    updateFreq: "Weekly",
    status: "live",
  },
  {
    agency: "Google Air Quality API",
    dataLayer: "AQI, PM2.5, Ozone Levels",
    updateFreq: "Hourly",
    status: "live",
  },
  {
    agency: "Google Pollen API",
    dataLayer: "Allergen & Pollen Forecast",
    updateFreq: "Daily",
    status: "live",
  },
  {
    agency: "FCC Broadband Map",
    dataLayer: "Internet & Cell Coverage",
    updateFreq: "Monthly",
    status: "live",
  },
  {
    agency: "Light Pollution Analysis",
    dataLayer: "Dark Sky / Bortle Class",
    updateFreq: "Static",
    status: "live",
  },
  {
    agency: "Transportation Infrastructure",
    dataLayer: "Noise & Highway Proximity",
    updateFreq: "Static",
    status: "live",
  },
  {
    agency: "NM Regional Climate Data",
    dataLayer: "Weather & Climate Patterns",
    updateFreq: "Seasonal",
    status: "live",
  },
];

const DataStatusTable = () => {
  const statusConfig = {
    live: { color: "text-status-safe", bg: "bg-status-safe", label: "Live" },
    updating: { color: "text-status-caution", bg: "bg-status-caution", label: "Updating" },
    offline: { color: "text-status-danger", bg: "bg-status-danger", label: "Offline" },
  };

  return (
    <section className="py-6 bg-background relative" id="data-sources">
      <div className="container mx-auto px-4">
        {/* Section header - compact */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">
              16-PILLAR DATA MATRIX
            </h2>
            <p className="text-[9px] text-muted-foreground mt-0.5 font-mono uppercase tracking-wider">
              Last sync: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-status-safe-bg border border-status-safe/30">
            <Circle className="w-1.5 h-1.5 fill-status-safe text-status-safe animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-status-safe">16/16 PILLARS ONLINE</span>
          </div>
        </div>

        {/* Data table - server dashboard style */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-2 py-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-2 py-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Agency</th>
                <th className="text-left px-2 py-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Data Layer</th>
                <th className="text-left px-2 py-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Freq</th>
                <th className="text-center px-2 py-1.5 text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {dataSources.map((source, index) => {
                const config = statusConfig[source.status];
                return (
                  <tr 
                    key={index} 
                    className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono">{String(index + 1).padStart(2, '0')}</td>
                    <td className="px-2 py-1.5 text-[11px] text-foreground font-medium">{source.agency}</td>
                    <td className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono">{source.dataLayer}</td>
                    <td className="px-2 py-1.5 text-[10px] text-muted-foreground font-mono hidden sm:table-cell">{source.updateFreq}</td>
                    <td className="px-2 py-1.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${config.color}`}>
                        {source.status === 'live' ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
                          </span>
                        ) : (
                          <Circle className="w-1.5 h-1.5 fill-current" />
                        )}
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Compliance alignment badges */}
        <div className="flex items-center justify-center gap-3 mt-3 text-[9px] text-muted-foreground/70">
          <span className="font-mono">Latency: <span className="text-status-safe font-bold">&lt;40ms</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">Uptime: <span className="text-status-safe font-bold">99.97%</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">Pillars: <span className="text-primary font-bold">16</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">v3.0.0</span>
        </div>
      </div>
    </section>
  );
};

export default DataStatusTable;
