import { AlertTriangle, AlertCircle, CheckCircle, Download, MapPin, Calendar, FileText, Map, Scale, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import GISMap from "./GISMap";

interface StatusCardProps {
  title: string;
  status: "safe" | "caution" | "danger";
  statusText: string;
  description: string;
  details: string[];
}

const StatusCard = ({ title, status, statusText, description, details }: StatusCardProps) => {
  const statusConfig = {
    safe: {
      icon: CheckCircle,
      bgClass: "status-safe",
      borderClass: "border-[hsl(var(--status-safe)/0.3)]",
      iconBg: "bg-[hsl(var(--status-safe-bg))]",
    },
    caution: {
      icon: AlertCircle,
      bgClass: "status-caution",
      borderClass: "border-[hsl(var(--status-caution)/0.3)]",
      iconBg: "bg-[hsl(var(--status-caution-bg))]",
    },
    danger: {
      icon: AlertTriangle,
      bgClass: "status-danger",
      borderClass: "border-[hsl(var(--status-danger)/0.3)]",
      iconBg: "bg-[hsl(var(--status-danger-bg))]",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`relative p-8 rounded-xl bg-card border ${config.borderClass} shadow-card hover:shadow-elevated transition-shadow duration-300`}>
      {/* Top accent */}
      <div className={`absolute top-0 left-6 right-6 h-px ${status === 'danger' ? 'bg-gradient-to-r from-transparent via-[hsl(var(--status-danger)/0.5)] to-transparent' : status === 'caution' ? 'bg-gradient-to-r from-transparent via-[hsl(var(--status-caution)/0.5)] to-transparent' : 'bg-gradient-to-r from-transparent via-[hsl(var(--status-safe)/0.5)] to-transparent'}`} />

      {/* Status badge */}
      <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg ${config.bgClass} border mb-6`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-wider">{statusText}</span>
      </div>

      {/* Title */}
      <h3 className="font-display text-2xl font-semibold text-foreground mb-3">{title}</h3>
      
      {/* Description */}
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>

      {/* Details */}
      <ul className="space-y-3">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 flex-shrink-0" />
            <span className="leading-relaxed">{detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface ResultsDashboardProps {
  address: string;
  onReset: () => void;
}

const ResultsDashboard = ({ address, onReset }: ResultsDashboardProps) => {
  const reportData = {
    address: address || "1234 Rio Grande Blvd, Albuquerque, NM",
    reportId: "RGD-2024-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    generatedAt: new Date().toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }),
  };

  const statusCards: StatusCardProps[] = [
    {
      title: "Cultural Resources",
      status: "danger",
      statusText: "High Risk",
      description: "Proximity to Historic Site detected. Additional archaeological survey may be required.",
      details: [
        "Within 0.5 miles of registered historic district",
        "NMCRIS LA #45892 - Prehistoric Site Nearby",
        "Phase I survey recommended before ground disturbance",
      ],
    },
    {
      title: "Water Restrictions",
      status: "caution",
      statusText: "Caution",
      description: "Located in Middle Rio Grande Declared Basin. Permit requirements apply.",
      details: [
        "Declared Basin since 1956",
        "New well permits subject to offset requirements",
        "Municipal water connection may be required",
      ],
    },
    {
      title: "Critical Habitat",
      status: "safe",
      statusText: "Clear",
      description: "No critical habitat overlap detected for this parcel.",
      details: [
        "Outside Rio Grande Silvery Minnow zone",
        "No Southwestern Willow Flycatcher habitat",
        "Standard NPDES compliance applies",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 text-primary mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider">Report ID: {reportData.reportId}</span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground tracking-tight">
                Environmental Due Diligence Report
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={onReset}>
                New Search
              </Button>
              <Button variant="hero" className="shadow-glow">
                <Download className="w-4 h-4" />
                Download Official PDF
              </Button>
            </div>
          </div>

          {/* Property info bar */}
          <div className="p-6 rounded-xl bg-card border border-border shadow-card flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-xl font-semibold text-foreground">{reportData.address}</p>
                <p className="text-sm text-muted-foreground">Bernalillo County, New Mexico</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>{reportData.generatedAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Verified Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {statusCards.map((card, index) => (
            <StatusCard key={index} {...card} />
          ))}
        </div>

        {/* Interactive Map */}
        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-card">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold text-foreground">GIS Visual Analysis</h2>
          </div>
          <GISMap address={address} />
        </div>

        {/* Disclaimer */}
        <div className="mt-10 p-6 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <Scale className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2 text-sm uppercase tracking-wider">Legal Disclaimer</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This report is generated from publicly available data sources and is intended for preliminary due diligence purposes only. 
                It does not constitute legal advice or a formal environmental assessment. For official determinations, please contact the appropriate regulatory agencies directly. 
                Rio Grande Due Diligence LLC assumes no liability for decisions made based on this report.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;