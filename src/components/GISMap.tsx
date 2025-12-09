import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAddress, type QueryType } from "@/lib/geocoding";
import { Loader2, AlertTriangle, RefreshCw, Droplets, Satellite, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface GISMapProps {
  address: string;
  queryType?: QueryType;
  onWellDataLoaded?: (data: WellDataResponse | null) => void;
  parcelGeometry?: number[][][] | null;
}

interface WellData {
  objectId: number;
  lat: number;
  lng: number;
  podType: string;
  podId: string;
  waterUse: string;
  status: string;
  permitNumber: string;
  distance: number;
}

interface WellDataResponse {
  wells: WellData[];
  summary: {
    totalWells: number;
    withinHalfMile: number;
    withinOneMile: number;
    byType: Record<string, number>;
    byUse: Record<string, number>;
  };
  searchRadius: number;
  centerLat: number;
  centerLng: number;
  source: string;
  dataDescription: string;
}

const GISMap = ({ address, queryType = "address", onWellDataLoaded, parcelGeometry }: GISMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geocodedAddress, setGeocodedAddress] = useState<string | null>(null);
  const [accuracyLevel, setAccuracyLevel] = useState<"exact" | "street" | "approximate" | "area">("exact");
  const [geocodeSource, setGeocodeSource] = useState<string | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [wellData, setWellData] = useState<WellDataResponse | null>(null);
  const [isLoadingWells, setIsLoadingWells] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(true);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satelliteLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      // Cleanup existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      setIsLoading(true);
      setGeocodeError(null);

      // Geocode the address (supports address, legal description, and coordinates)
      let center: L.LatLngExpression = [35.0844, -106.6504]; // Default: Albuquerque
      const result = await geocodeAddress(address, queryType);
      
      let lat = 35.0844;
      let lng = -106.6504;

      if (result) {
        center = [result.lat, result.lng];
        lat = result.lat;
        lng = result.lng;
        setGeocodedAddress(result.displayName);
        setAccuracyLevel(result.accuracy);
        setGeocodeSource(result.source);
        
        if (result.isError && result.error) {
          setGeocodeError(result.error);
        }
      } else {
        setGeocodedAddress(null);
        setAccuracyLevel("area");
        setGeocodeSource(null);
        setGeocodeError("Unable to geocode address. Please verify and try again.");
      }

      setIsLoading(false);

      // Initialize map
      const map = L.map(mapRef.current, {
        center,
        zoom: 16,
        scrollWheelZoom: true,
      });

      mapInstanceRef.current = map;

      // Create tile layers
      const streetLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      });

      // Google Satellite tiles (using publicly available endpoint)
      const satelliteLayer = L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          attribution: '&copy; Google',
          maxZoom: 20,
        }
      );

      streetLayerRef.current = streetLayer;
      satelliteLayerRef.current = satelliteLayer;

      // Start with satellite view
      satelliteLayer.addTo(map);

      // Create parcel boundary - use real geometry if available, otherwise approximate
      let parcelPolygon: L.Polygon;
      
      if (parcelGeometry && parcelGeometry.length > 0) {
        // Use actual parcel geometry from county assessor
        const coords = parcelGeometry.map(ring =>
          ring.map(coord => [coord[0], coord[1]] as L.LatLngTuple)
        );
        parcelPolygon = L.polygon(coords, {
          color: "#fbbf24", // Gold/amber for visibility on satellite
          weight: 4,
          fillColor: "#fbbf24",
          fillOpacity: 0.15,
        }).addTo(map);
        
        // Fit to actual parcel bounds
        map.fitBounds(parcelPolygon.getBounds(), { padding: [50, 50] });
      } else {
        // Fallback to approximate boundary
        const parcelOffset = 0.001; // ~100m
        const parcelCoords: L.LatLngExpression[] = [
          [lat + parcelOffset, lng - parcelOffset],
          [lat + parcelOffset, lng + parcelOffset],
          [lat - parcelOffset, lng + parcelOffset],
          [lat - parcelOffset, lng - parcelOffset],
        ];
        parcelPolygon = L.polygon(parcelCoords, {
          color: "#fbbf24",
          weight: 4,
          fillColor: "#fbbf24",
          fillOpacity: 0.15,
          dashArray: "8, 4", // Dashed to indicate approximate
        }).addTo(map);
      }

      parcelPolygon.bindPopup(
        `<div class="text-sm">
          <strong>Subject Parcel</strong><br/>
          ${address}
        </div>`
      );

      // Zone offset for overlay zones
      const zoneOffset = 0.001; // ~100m

      // Cultural/Historic Risk Zone (RED - overlapping NW corner)
      const historicZone: L.LatLngExpression[] = [
        [lat + zoneOffset * 2, lng - zoneOffset * 2],
        [lat + zoneOffset * 2, lng],
        [lat, lng],
        [lat, lng - zoneOffset * 2],
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
        [lat + zoneOffset * 3, lng - zoneOffset * 3],
        [lat + zoneOffset * 3, lng + zoneOffset * 3],
        [lat - zoneOffset * 3, lng + zoneOffset * 3],
        [lat - zoneOffset * 3, lng - zoneOffset * 3],
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

      // Fetch OSE well data
      if (!result?.isError) {
        fetchOSEWellData(lat, lng, map);
      }

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
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <div style="width: 16px; height: 16px; background: #22c55e; opacity: 0.5; border: 2px solid #22c55e; border-radius: 2px;"></div>
                <span style="color: #334155;">Critical Habitat (Clear)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 16px; height: 16px; background: #06b6d4; border-radius: 50%; border: 2px solid #0891b2;"></div>
                <span style="color: #334155;">OSE Well/POD</span>
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

    const fetchOSEWellData = async (lat: number, lng: number, map: L.Map) => {
      setIsLoadingWells(true);
      try {
        console.log('Fetching OSE well data...');
        const { data, error } = await supabase.functions.invoke('ose-wells', {
          body: { lat, lng, radiusMiles: 1 }
        });

        if (error) {
          console.error('Error fetching well data:', error);
          setIsLoadingWells(false);
          return;
        }

        console.log('OSE well data received:', data);
        setWellData(data);
        onWellDataLoaded?.(data);

        // Add well markers to map
        if (data?.wells && Array.isArray(data.wells)) {
          const wellIcon = L.divIcon({
            html: `<div style="background: #06b6d4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #0891b2; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
            className: "well-marker",
            iconSize: [12, 12],
            iconAnchor: [6, 6],
          });

          data.wells.forEach((well: WellData) => {
            if (well.lat && well.lng) {
              L.marker([well.lat, well.lng], { icon: wellIcon })
                .addTo(map)
                .bindPopup(`
                  <div style="font-size: 12px;">
                    <strong style="color: #0891b2;">OSE Point of Diversion</strong><br/>
                    <strong>ID:</strong> ${well.podId}<br/>
                    <strong>Type:</strong> ${well.podType}<br/>
                    <strong>Use:</strong> ${well.waterUse}<br/>
                    <strong>Status:</strong> ${well.status}<br/>
                    <strong>Permit:</strong> ${well.permitNumber}<br/>
                    <strong>Distance:</strong> ${well.distance} mi
                  </div>
                `);
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch OSE well data:', err);
      } finally {
        setIsLoadingWells(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [address, retryCount, parcelGeometry]);

  // Handle layer toggle
  const toggleMapView = () => {
    if (!mapInstanceRef.current) return;
    
    if (isSatelliteView) {
      satelliteLayerRef.current?.remove();
      streetLayerRef.current?.addTo(mapInstanceRef.current);
    } else {
      streetLayerRef.current?.remove();
      satelliteLayerRef.current?.addTo(mapInstanceRef.current);
    }
    setIsSatelliteView(!isSatelliteView);
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    setTimeout(() => setIsRetrying(false), 100);
  };

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
      
      {/* Error Banner */}
      {geocodeError && !isLoading && (
        <div className="absolute top-2 left-2 right-2 z-20 bg-status-danger-bg border border-[hsl(var(--status-danger)/0.3)] rounded-lg p-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[hsl(var(--status-danger))] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[hsl(var(--status-danger))]">
                  Geocoding Error
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="h-7 px-2 text-xs border-[hsl(var(--status-danger)/0.3)] hover:bg-[hsl(var(--status-danger)/0.1)]"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                  Retry
                </Button>
              </div>
              <p className="text-xs text-[hsl(var(--status-danger)/0.8)] mt-1">
                {geocodeError}
              </p>
              <p className="text-[10px] text-muted-foreground mt-2">
                The map is showing a default location. Report data may not be accurate for this property.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Success/Accuracy Indicator */}
      {geocodedAddress && !isLoading && !geocodeError && (
        <div className={`absolute top-2 left-2 z-10 backdrop-blur px-3 py-2 rounded-lg text-xs border max-w-[70%] ${
          accuracyLevel === 'exact' ? 'bg-status-safe-bg/95 border-[hsl(var(--status-safe)/0.3)] text-[hsl(var(--status-safe))]' :
          accuracyLevel === 'street' ? 'bg-background/95 border-border text-muted-foreground' :
          'bg-status-caution-bg/95 border-[hsl(var(--status-caution)/0.3)] text-[hsl(var(--status-caution))]'
        }`}>
          <div className="flex items-center gap-2">
            <span>{accuracyLevel === 'exact' ? '✓' : accuracyLevel === 'street' ? '◉' : '⚠️'}</span>
            <span className="truncate">{geocodedAddress}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] opacity-80">
              {accuracyLevel === 'exact' ? 'Rooftop accuracy' : 
               accuracyLevel === 'street' ? 'Street-level accuracy' : 
               'Approximate - verify manually'}
            </span>
            {geocodeSource && <span className="text-[10px] opacity-60 uppercase">{geocodeSource}</span>}
          </div>
        </div>
      )}

      {/* Well Data Loading Indicator */}
      {isLoadingWells && !isLoading && (
        <div className="absolute top-2 right-2 z-10 bg-cyan-900/90 backdrop-blur px-3 py-2 rounded-lg text-xs border border-cyan-600/30 text-cyan-300">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 animate-pulse" />
            <span>Loading OSE well data...</span>
          </div>
        </div>
      )}

      {/* Well Data Summary */}
      {wellData && !isLoadingWells && !isLoading && (
        <div className="absolute top-2 right-2 z-10 bg-cyan-900/90 backdrop-blur px-3 py-2 rounded-lg text-xs border border-cyan-600/30 text-cyan-300 max-w-[35%]">
          <div className="flex items-center gap-2 font-medium">
            <Droplets className="w-4 h-4" />
            <span>OSE Wells/PODs</span>
          </div>
          <div className="mt-1 text-[10px] text-cyan-400/80">
            {wellData.summary.totalWells} within 1 mile
            {wellData.summary.withinHalfMile > 0 && ` (${wellData.summary.withinHalfMile} within ½ mi)`}
          </div>
        </div>
      )}

      {/* Map View Toggle */}
      {!isLoading && (
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMapView}
          className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur hover:bg-background border-border"
        >
          {isSatelliteView ? (
            <>
              <Map className="w-4 h-4 mr-2" />
              Street View
            </>
          ) : (
            <>
              <Satellite className="w-4 h-4 mr-2" />
              Satellite
            </>
          )}
        </Button>
      )}
      
      <div 
        ref={mapRef} 
        className="h-80 w-full rounded-b-xl"
        style={{ minHeight: "320px" }}
      />
      
      {/* RGDD Watermark */}
      {!isLoading && (
        <div className="absolute bottom-2 right-20 z-10 text-white/30 font-mono text-[10px] font-bold tracking-widest pointer-events-none select-none">
          RGDD INTELLIGENCE
        </div>
      )}
    </div>
  );
};

export default GISMap;
