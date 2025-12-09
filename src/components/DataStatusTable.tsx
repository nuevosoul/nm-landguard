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
    <section className="py-12 bg-background relative" id="data-sources">
      <div className="container mx-auto px-4">
        {/* Section header - compact */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground tracking-tight">
              Live Data Source Status
            </h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Last sync: {new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-status-safe-bg border border-status-safe/30">
            <Circle className="w-2 h-2 fill-status-safe text-status-safe animate-pulse" />
            <span className="text-xs font-mono text-status-safe">ALL SYSTEMS OPERATIONAL</span>
          </div>
        </div>

        {/* Data table - server dashboard style */}
        <div className="rounded-lg border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Agency</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Data Layer</th>
                <th className="text-left px-4 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Update Freq</th>
                <th className="text-center px-4 py-3 text-xs font-mono font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
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
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{source.agency}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{source.dataLayer}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{source.updateFreq}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono ${config.color}`}>
                        <Circle className={`w-1.5 h-1.5 fill-current ${source.status === 'live' ? 'animate-pulse' : ''}`} />
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
        <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground/70">
          <span className="font-mono">Query latency: <span className="text-foreground">~2.4s avg</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">Uptime: <span className="text-status-safe">99.97%</span></span>
          <span className="text-border">|</span>
          <span className="font-mono">API Version: <span className="text-foreground">v2.1.4</span></span>
        </div>
      </div>
    </section>
  );
};

export default DataStatusTable;
