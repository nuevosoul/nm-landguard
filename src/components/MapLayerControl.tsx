import { Layers, Check } from "lucide-react";
import { useState } from "react";

interface MapLayerControlProps {
  onLayerToggle?: (layer: string, enabled: boolean) => void;
}

const MapLayerControl = ({ onLayerToggle }: MapLayerControlProps) => {
  const [layers, setLayers] = useState({
    flood: true,
    wetlands: true,
    slope: false,
    wells: true,
    historic: true,
  });

  const toggleLayer = (layer: keyof typeof layers) => {
    const newValue = !layers[layer];
    setLayers(prev => ({ ...prev, [layer]: newValue }));
    onLayerToggle?.(layer, newValue);
  };

  const layerOptions = [
    { id: "flood" as const, label: "Flood Zones", color: "bg-blue-500" },
    { id: "wetlands" as const, label: "Wetlands", color: "bg-cyan-500" },
    { id: "slope" as const, label: "Slope Analysis", color: "bg-amber-500" },
    { id: "wells" as const, label: "OSE Wells", color: "bg-cyan-400" },
    { id: "historic" as const, label: "Historic Sites", color: "bg-red-500" },
  ];

  return (
    <div className="absolute top-14 left-2 z-20 bg-background/95 backdrop-blur rounded-lg border border-border p-2 shadow-lg">
      <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-border">
        <Layers className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-mono font-bold text-primary uppercase tracking-wider">
          Layers
        </span>
      </div>
      <div className="space-y-1">
        {layerOptions.map((layer) => (
          <button
            key={layer.id}
            onClick={() => toggleLayer(layer.id)}
            className="flex items-center gap-2 w-full px-1.5 py-1 rounded hover:bg-muted/50 transition-colors"
          >
            <div className={`w-3.5 h-3.5 rounded border ${
              layers[layer.id] 
                ? "border-primary bg-primary/20" 
                : "border-border bg-muted/30"
            } flex items-center justify-center`}>
              {layers[layer.id] && (
                <Check className="w-2.5 h-2.5 text-primary" />
              )}
            </div>
            <div className={`w-2 h-2 rounded-full ${layer.color}`} />
            <span className="text-[10px] text-foreground">{layer.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapLayerControl;
