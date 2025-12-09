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
    agency: "EPA Envirofacts",
    dataLayer: "Superfund & TRI Sites",
    updateFreq: "Weekly",
    status: "live",
  },
  {
    agency: "USDA NRCS",
    dataLayer: "SSURGO Soil Survey",
    updateFreq: "Annual",
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
    <section className="py-8 bg-background relative" id="data-sources">
      <div className="container mx-auto px-4">
        {/* Section header - compact */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
              Live Data Source Status
            </h2>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
              Last sync: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-status-safe-bg border border-status-safe/30">
            <Circle className="w-1.5 h-1.5 fill-status-safe text-status-safe animate-pulse" />
            <span className="text-[10px] font-mono text-status-safe">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>

        {/* Data table - server dashboard style */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-3 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Agency</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Data Layer</th>
                <th className="text-left px-3 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Update Freq</th>
                <th className="text-center px-3 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
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
                    <td className="px-3 py-2 text-xs text-foreground font-medium">{source.agency}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground font-mono">{source.dataLayer}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground font-mono hidden sm:table-cell">{source.updateFreq}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono ${config.color}`}>
                        <Circle className={`w-1 h-1 fill-current ${source.status === 'live' ? 'animate-pulse' : ''}`} />
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
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground/70">
          <span className="font-mono">Latency: <span className="text-foreground">~2.4s</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">Uptime: <span className="text-status-safe">99.97%</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">v2.1.4</span>
        </div>
      </div>
    </section>
  );
};

export default DataStatusTable;
