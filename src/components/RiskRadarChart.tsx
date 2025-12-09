import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

interface RiskRadarChartProps {
  riskData: {
    historic: number;
    water: number;
    bio: number;
    flood: number;
    slope: number;
    soil: number;
    fire: number;
  };
}

const RiskRadarChart = ({ riskData }: RiskRadarChartProps) => {
  const data = [
    { subject: "Historic", property: riskData.historic, average: 35, fullMark: 100 },
    { subject: "Water", property: riskData.water, average: 45, fullMark: 100 },
    { subject: "Bio", property: riskData.bio, average: 25, fullMark: 100 },
    { subject: "Flood", property: riskData.flood, average: 40, fullMark: 100 },
    { subject: "Slope", property: riskData.slope, average: 30, fullMark: 100 },
    { subject: "Soil", property: riskData.soil, average: 35, fullMark: 100 },
    { subject: "Fire", property: riskData.fire, average: 50, fullMark: 100 },
  ];

  return (
    <div className="p-4 rounded-lg bg-card border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
          Multi-Vector Risk Profile
        </h3>
        <div className="flex items-center gap-4 text-[9px] font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/80" />
            Subject Property
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
            County Average
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
          />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 9,
              fontFamily: "JetBrains Mono, monospace"
            }}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={false}
            axisLine={false}
          />
          <Radar
            name="County Average"
            dataKey="average"
            stroke="hsl(var(--muted-foreground))"
            fill="hsl(var(--muted-foreground))"
            fillOpacity={0.15}
            strokeWidth={1}
            strokeDasharray="4 2"
          />
          <Radar
            name="Subject Property"
            dataKey="property"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RiskRadarChart;
