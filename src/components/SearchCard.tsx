import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Lock, Zap, Shield, Map, Crosshair, Layers, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAddressAutocomplete } from "@/hooks/useAddressAutocomplete";

interface SearchCardProps {
  onSearch: (query: string, queryType: "address" | "legal" | "coordinates" | "map") => void;
}

const SearchCard = ({ onSearch }: SearchCardProps) => {
  const [address, setAddress] = useState("");
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [mapCoords, setMapCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"address" | "coordinates" | "map">("address");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [legalCheckbox, setLegalCheckbox] = useState(false);
  const [showSolarOverlay, setShowSolarOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { suggestions, isLoading } = useAddressAutocomplete(address, activeTab === "address");

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: { displayName: string }) => {
    setAddress(suggestion.displayName);
    setShowSuggestions(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate relative position within map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Map container dimensions
    const width = rect.width;
    const height = rect.height;
    
    // Convert to lat/lng (centered on Albuquerque, ~0.1 degree range)
    const centerLat = 35.0844;
    const centerLng = -106.6504;
    const latRange = 0.08;
    const lngRange = 0.12;
    
    const lat = centerLat + latRange * (0.5 - y / height);
    const lng = centerLng + lngRange * (x / width - 0.5);
    
    setMapCoords({ 
      lat: lat.toFixed(6), 
      lng: lng.toFixed(6) 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // DEV BYPASS: Skip payment in development mode - DO NOT REMOVE ON FUTURE EDITS
    const isDevMode = window.location.search.includes('dev=true') || window.location.hostname === 'localhost';
    if (isDevMode) {
      setShowSuggestions(false);
      if (activeTab === "address" && address.trim()) {
        onSearch(address, "address");
      } else if (activeTab === "coordinates" && manualLat.trim() && manualLng.trim()) {
        onSearch(`${manualLat},${manualLng}`, "coordinates");
      } else if (activeTab === "map" && mapCoords) {
        onSearch(`${mapCoords.lat},${mapCoords.lng}`, "coordinates");
      }
      return;
    }
    
    // Normal production flow
    if (!legalCheckbox) return;
    setShowSuggestions(false);
    
    if (activeTab === "address" && address.trim()) {
      onSearch(address, "address");
    } else if (activeTab === "coordinates" && manualLat.trim() && manualLng.trim()) {
      onSearch(`${manualLat},${manualLng}`, "coordinates");
    } else if (activeTab === "map" && mapCoords) {
      onSearch(`${mapCoords.lat},${mapCoords.lng}`, "coordinates");
    }
  };

  const isValidCoordinate = (lat: string, lng: string): boolean => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    return !isNaN(latNum) && !isNaN(lngNum) && 
           latNum >= -90 && latNum <= 90 && 
           lngNum >= -180 && lngNum <= 180;
  };

  const isSubmitDisabled = () => {
    if (!legalCheckbox) return true;
    if (activeTab === "address") return !address.trim();
    if (activeTab === "coordinates") return !manualLat.trim() || !manualLng.trim() || !isValidCoordinate(manualLat, manualLng);
    if (activeTab === "map") return !mapCoords;
    return true;
  };

  return (
    <section className="py-10 bg-background relative" id="search">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto">
          {/* Card - Glassmorphism */}
          <div className="relative rounded-xl border border-white/10 bg-card/90 backdrop-blur-[10px] shadow-elevated overflow-hidden" style={{ boxShadow: '0 0 30px rgba(56, 189, 248, 0.08), 0 4px 20px -4px rgba(0, 0, 0, 0.5)' }}>
            {/* Top gold accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <div className="relative p-6 md:p-8">
              {/* Header - compact */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-1 tracking-tight">
                  Start Your Due Diligence
                </h2>
                <p className="text-muted-foreground text-xs">
                  Search by address, coordinates, or drop a pin on the map
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-4">
                <TabsList className="grid w-full grid-cols-3 h-9">
                  <TabsTrigger value="address" className="flex items-center gap-1.5 text-[11px]">
                    <Search className="w-3 h-3" />
                    Address
                  </TabsTrigger>
                  <TabsTrigger value="coordinates" className="flex items-center gap-1.5 text-[11px]">
                    <Crosshair className="w-3 h-3" />
                    Coordinates
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-1.5 text-[11px]">
                    <Map className="w-3 h-3" />
                    Map Pin
                  </TabsTrigger>
                </TabsList>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <TabsContent value="address" className="mt-0 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="e.g., 1234 Rio Grande Blvd, Albuquerque, NM"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className="pl-10 pr-10 h-12 text-sm bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                        autoComplete="off"
                      />
                      
                      {/* Autocomplete dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-elevated z-50 overflow-hidden"
                        >
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="w-full px-3 py-2 text-left hover:bg-muted/50 transition-colors flex items-start gap-2 border-b border-border last:border-b-0"
                            >
                              <MapPin className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                              <span className="text-xs text-foreground line-clamp-2">
                                {suggestion.displayName}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground text-center font-mono">
                      Supports: street address, APN, legal description, or GPS coordinates
                    </p>
                  </TabsContent>

                  <TabsContent value="coordinates" className="mt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mb-1 block">Latitude (Decimal)</label>
                        <Input
                          type="text"
                          placeholder="e.g., 35.084400"
                          value={manualLat}
                          onChange={(e) => setManualLat(e.target.value)}
                          className="h-10 text-sm font-mono bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wide mb-1 block">Longitude (Decimal)</label>
                        <Input
                          type="text"
                          placeholder="e.g., -106.650400"
                          value={manualLng}
                          onChange={(e) => setManualLng(e.target.value)}
                          className="h-10 text-sm font-mono bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                        />
                      </div>
                    </div>
                    {manualLat && manualLng && isValidCoordinate(manualLat, manualLng) && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/30">
                        <Crosshair className="w-4 h-4 text-primary" />
                        <span className="text-xs font-mono text-foreground">
                          {parseFloat(manualLat).toFixed(6)}°N, {Math.abs(parseFloat(manualLng)).toFixed(6)}°W
                        </span>
                      </div>
                    )}
                    {manualLat && manualLng && !isValidCoordinate(manualLat, manualLng) && (
                      <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                        Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180.
                      </div>
                    )}
                    <p className="text-[10px] text-muted-foreground text-center font-mono">
                      Enter WGS84 decimal degrees (e.g., from GPS or survey documents)
                    </p>
                  </TabsContent>

                  <TabsContent value="map" className="mt-0 space-y-3">
                    {/* Coordinate header */}
                    {mapCoords && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/30">
                        <div className="flex items-center gap-2">
                          <Crosshair className="w-4 h-4 text-primary" />
                          <span className="text-xs font-mono text-foreground">
                            {mapCoords.lat}°N, {mapCoords.lng}°W
                          </span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-6 px-2"
                          onClick={() => setMapCoords(null)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                    
                    {/* Interactive Map */}
                    <div 
                      className="relative h-56 rounded-lg border border-border overflow-hidden bg-muted/30 cursor-crosshair"
                      onClick={handleMapClick}
                    >
                      {/* Fake satellite/map imagery */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#2a4a1a] via-[#3d5c2a] to-[#2a4a1a]" />
                      
                      {/* Grid overlay */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                          linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px',
                      }} />

                      {/* Road-like lines */}
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-600/40" />
                      <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-400/30" />
                      <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-400/30" />
                      
                      {/* Solar overlay (when enabled) */}
                      {showSolarOverlay && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-yellow-500/30 mix-blend-overlay" />
                      )}
                      
                      {/* Dropped Pin */}
                      {mapCoords && (
                        <div 
                          className="absolute w-6 h-6 -translate-x-1/2 -translate-y-full"
                          style={{ 
                            left: `${50 + (parseFloat(mapCoords.lng) + 106.6504) / 0.12 * 50}%`,
                            top: `${50 - (parseFloat(mapCoords.lat) - 35.0844) / 0.08 * 50}%`
                          }}
                        >
                          <div className="relative">
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/50 animate-ping" />
                            <MapPin className="w-6 h-6 text-primary fill-primary drop-shadow-lg" />
                          </div>
                        </div>
                      )}

                      {/* Click instruction */}
                      {!mapCoords && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center px-4 py-3 rounded-lg bg-black/50 backdrop-blur-sm">
                            <Crosshair className="w-6 h-6 text-white/80 mx-auto mb-1" />
                            <p className="text-xs text-white/90 font-medium">Click to drop pin</p>
                          </div>
                        </div>
                      )}

                      {/* Floating controls */}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className={`h-7 px-2 text-[10px] ${showSolarOverlay ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowSolarOverlay(!showSolarOverlay);
                          }}
                        >
                          <Sun className="w-3 h-3 mr-1" />
                          Solar
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-7 px-2 text-[10px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          Layers
                        </Button>
                      </div>

                      {/* Map attribution */}
                      <div className="absolute bottom-1 right-1 text-[8px] text-white/50 font-mono bg-black/30 px-1 rounded">
                        © Google Maps
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground text-center font-mono">
                      Click anywhere on the map to select parcel location
                    </p>
                  </TabsContent>
                  
                  {/* Legal disclaimer checkbox */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <Checkbox 
                      id="legal-disclaimer" 
                      checked={legalCheckbox}
                      onCheckedChange={(checked) => setLegalCheckbox(checked === true)}
                      className="mt-0.5"
                    />
                    <label 
                      htmlFor="legal-disclaimer" 
                      className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
                    >
                      I understand this is a desktop screening based on public data and <span className="text-foreground font-medium">does not constitute a legal clearance</span> or replace official regulatory consultation.
                    </label>
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full h-12 text-sm shadow-glow group"
                    disabled={isSubmitDisabled()}
                  >
                    <Shield className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Run Due Diligence — $499
                  </Button>
                </form>
              </Tabs>

              {/* Trust indicators - compact */}
              <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-border text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-primary" />
                  256-bit Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primary" />
                  30-Second Results
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchCard;
