import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress } from "@/lib/geocoding";
import { Loader2 } from "lucide-react";

interface GISMapProps {
  address: string;
}

const GISMap = ({ address }: GISMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);
  const [isApproximate, setIsApproximate] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // Cleanup existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      setIsLoading(true);

      // Geocode the address
      let center: L.LatLngExpression = [35.0844, -106.6504]; // Default: Albuquerque
      const result = await geocodeAddress(address);
      
      if (result) {
        center = [result.lat, result.lng];
        setGeocodedAddress(result.displayName);
        setIsApproximate(result.accuracy === "approximate");
      } else {
        setGeocodedAddress(null);
        setIsApproximate(false);
      }

      setIsLoading(false);

      // Initialize map
      const map = L.map(mapRef.current, {
        center,
        zoom: 16,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const lat = Array.isArray(center) ? center[0] : (center as L.LatLng).lat;
      const lng = Array.isArray(center) ? center[1] : (center as L.LatLng).lng;

      // Create parcel boundary around the geocoded location
      const parcelOffset = 0.001; // ~100m
      const parcelCoords: L.LatLngExpression[] = [
        [lat + parcelOffset, lng - parcelOffset],
        [lat + parcelOffset, lng + parcelOffset],
        [lat - parcelOffset, lng + parcelOffset],
        [lat - parcelOffset, lng - parcelOffset],
      ];

      const parcelPolygon = L.polygon(parcelCoords, {
        color: "#3b82f6",
        weight: 3,
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
      }).addTo(map);

      parcelPolygon.bindPopup(
        `<div class="text-sm">
          <strong>Subject Parcel</strong><br/>
          ${address}
        </div>`
      );

      // Cultural/Historic Risk Zone (RED - overlapping NW corner)
      const historicZone: L.LatLngExpression[] = [
        [lat + parcelOffset * 2, lng - parcelOffset * 2],
        [lat + parcelOffset * 2, lng],
        [lat, lng],
        [lat, lng - parcelOffset * 2],
      ];

      L.polygon(historicZone, {
        color: "#ef4444",
        weight: 2,
        fillColor: "#ef4444",
        fillOpacity: 0.25,
        dashArray: "5, 5",
      }).addTo(map).bindPopup(
        `<div class="text-sm">
          <strong class="text-red-600">Historic District Zone</strong><br/>
          NMCRIS LA #45892<br/>
          <span class="text-red-500">High Risk - Archaeological Survey Required</span>
        </div>`
      );

      // Water Restriction Zone (AMBER - larger area covering the parcel)
      const waterZone: L.LatLngExpression[] = [
        [lat + parcelOffset * 3, lng - parcelOffset * 3],
        [lat + parcelOffset * 3, lng + parcelOffset * 3],
        [lat - parcelOffset * 3, lng + parcelOffset * 3],
        [lat - parcelOffset * 3, lng - parcelOffset * 3],
      ];

      L.polygon(waterZone, {
        color: "#f59e0b",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.12,
        dashArray: "10, 5",
      }).addTo(map).bindPopup(
        `<div class="text-sm">
          <strong class="text-amber-600">Middle Rio Grande Declared Basin</strong><br/>
          Declared since 1956<br/>
          <span class="text-amber-500">Caution - Permit Requirements Apply</span>
        </div>`
      );

      // Add legend
      const LegendControl = L.Control.extend({
        onAdd: () => {
          const div = L.DomUtil.create("div", "leaflet-legend");
          div.innerHTML = `
            <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 12px;">
              <div style="font-weight: 600; margin-bottom: 8px; color: #0f172a;">Risk Zone Legend</div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 16px; height: 16px; background: #3b82f6; opacity: 0.5; border: 2px solid #3b82f6; border-radius: 2px;"></div>
                <span style="color: #334155;">Subject Parcel</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 16px; height: 16px; background: #ef4444; opacity: 0.5; border: 2px dashed #ef4444; border-radius: 2px;"></div>
                <span style="color: #334155;">Historic Zone (High Risk)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 16px; height: 16px; background: #f59e0b; opacity: 0.5; border: 2px dashed #f59e0b; border-radius: 2px;"></div>
                <span style="color: #334155;">Water Basin (Caution)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #22c55e; opacity: 0.5; border: 2px solid #22c55e; border-radius: 2px;"></div>
                <span style="color: #334155;">Critical Habitat (Clear)</span>
              </div>
            </div>
          `;
          return div;
        },
      });
      new LegendControl({ position: "bottomright" }).addTo(map);

      // Add marker for property location
      const markerIcon = L.divIcon({
        html: `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
        className: "custom-marker",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([lat, lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<strong>Property Location</strong><br/>${address}`)
        .openPopup();

      // Fit bounds to show parcel and zones
      const bounds = L.latLngBounds(waterZone as L.LatLngTuple[]);
      map.fitBounds(bounds, { padding: [30, 30] });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address]);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Geocoding address...</span>
          </div>
        </div>
      )}
      {geocodedAddress && !isLoading && (
        <div className={`absolute top-2 left-2 z-10 backdrop-blur px-3 py-2 rounded-lg text-xs border max-w-[70%] ${isApproximate ? 'bg-status-caution-bg/95 border-[hsl(var(--status-caution)/0.3)] text-[hsl(var(--status-caution))]' : 'bg-background/95 border-border text-muted-foreground'}`}>
          <div className="flex items-center gap-2">
            <span>{isApproximate ? '⚠️' : '✓'}</span>
            <span className="truncate">{geocodedAddress}</span>
          </div>
          {isApproximate && (
            <p className="text-[10px] mt-1 opacity-80">Approximate - verify location manually</p>
          )}
        </div>
      )}
      <div 
        ref={mapRef} 
        className="h-80 w-full rounded-b-xl"
        style={{ minHeight: "320px" }}
      />
    </div>
  );
};

export default GISMap;
