import { AlertTriangle, AlertCircle, CheckCircle, Download, MapPin, Calendar, FileText, Map } from "lucide-react";
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
      borderClass: "border-status-safe/30",
    },
    caution: {
      icon: AlertCircle,
      bgClass: "status-caution",
      borderClass: "border-status-caution/30",
    },
    danger: {
      icon: AlertTriangle,
      bgClass: "status-danger",
      borderClass: "border-status-danger/30",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`relative p-6 rounded-xl bg-card border ${config.borderClass} shadow-card`}>
      {/* Status badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgClass} border mb-4`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-semibold uppercase tracking-wide">{statusText}</span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      
      {/* Description */}
      <p className="text-muted-foreground mb-4">{description}</p>

      {/* Details */}
      <ul className="space-y-2">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
            {detail}
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-primary mb-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm font-medium">Report ID: {reportData.reportId}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Environmental Due Diligence Report
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onReset}>
                New Search
              </Button>
              <Button variant="hero">
                <Download className="w-4 h-4" />
                Download PDF Report
              </Button>
            </div>
          </div>

          {/* Property info bar */}
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{reportData.address}</p>
                <p className="text-sm text-muted-foreground">Bernalillo County, New Mexico</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Generated: {reportData.generatedAt}</span>
            </div>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statusCards.map((card, index) => (
            <StatusCard key={index} {...card} />
          ))}
        </div>

        {/* Interactive Map */}
        <div className="rounded-xl bg-card border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">GIS Visual Analysis</h2>
          </div>
          <GISMap address={address} />
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> This report is generated from publicly available data sources and is intended for preliminary due diligence purposes only. 
            It does not constitute legal advice or a formal environmental assessment. For official determinations, please contact the appropriate regulatory agencies directly. 
            Rio Grande Due Diligence LLC assumes no liability for decisions made based on this report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
