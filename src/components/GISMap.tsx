import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GISMapProps {
  address: string;
}

const GISMap = ({ address }: GISMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Center on Albuquerque, NM (Rio Grande area)
    const center: L.LatLngExpression = [35.0844, -106.6504];

    // Initialize map
    const map = L.map(mapRef.current, {
      center,
      zoom: 14,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Simulated parcel boundary (polygon)
    const parcelCoords: L.LatLngExpression[] = [
      [35.0864, -106.6534],
      [35.0864, -106.6474],
      [35.0824, -106.6474],
      [35.0824, -106.6534],
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
        ${address || "1234 Rio Grande Blvd"}
      </div>`
    );

    // Cultural/Historic Risk Zone (RED - overlapping corner)
    const historicZone: L.LatLngExpression[] = [
      [35.0880, -106.6560],
      [35.0880, -106.6500],
      [35.0840, -106.6500],
      [35.0840, -106.6560],
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

    // Water Restriction Zone (AMBER - declared basin boundary)
    const waterZone: L.LatLngExpression[] = [
      [35.0900, -106.6600],
      [35.0900, -106.6400],
      [35.0780, -106.6400],
      [35.0780, -106.6600],
    ];

    L.polygon(waterZone, {
      color: "#f59e0b",
      weight: 2,
      fillColor: "#f59e0b",
      fillOpacity: 0.15,
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

    L.marker([35.0844, -106.6504], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<strong>Property Location</strong><br/>${address || "1234 Rio Grande Blvd"}`);

    // Fit bounds to show all zones
    const bounds = L.latLngBounds(waterZone as L.LatLngTuple[]);
    map.fitBounds(bounds, { padding: [20, 20] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address]);

  return (
    <div 
      ref={mapRef} 
      className="h-80 w-full rounded-b-xl"
      style={{ minHeight: "320px" }}
    />
  );
};

export default GISMap;
