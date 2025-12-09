import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Lock, Zap, Shield, FileText, Navigation, Loader2, Map, Crosshair } from "lucide-react";
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
  const [legalDescription, setLegalDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [mapCoords, setMapCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"address" | "map">("address");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [legalCheckbox, setLegalCheckbox] = useState(false);
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

  const handleDropPin = () => {
    // Simulate dropping pin at center of New Mexico
    setMapCoords({ lat: "35.0844", lng: "-106.6504" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalCheckbox) return;
    setShowSuggestions(false);
    
    if (activeTab === "address" && address.trim()) {
      onSearch(address, "address");
    } else if (activeTab === "map" && mapCoords) {
      onSearch(`${mapCoords.lat},${mapCoords.lng}`, "coordinates");
    }
  };

  const isSubmitDisabled = () => {
    if (!legalCheckbox) return true;
    if (activeTab === "address") return !address.trim();
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
          {/* Card */}
          <div className="relative rounded-xl border border-border bg-card shadow-elevated overflow-hidden">
            {/* Top gold accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            <div className="relative p-6 md:p-8">
              {/* Header - compact */}
              <div className="text-center mb-5">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 mb-4">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground mb-1 tracking-tight">
                  Start Your Due Diligence
                </h2>
                <p className="text-muted-foreground text-sm">
                  Search by address or drop a pin on the map
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-4">
                <TabsList className="grid w-full grid-cols-2 h-10">
                  <TabsTrigger value="address" className="flex items-center gap-2 text-sm">
                    <Search className="w-4 h-4" />
                    Search by Address
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2 text-sm">
                    <Map className="w-4 h-4" />
                    Search by Map
                  </TabsTrigger>
                </TabsList>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <TabsContent value="address" className="mt-0 space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      {isLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin z-10" />
                      )}
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

                  <TabsContent value="map" className="mt-0 space-y-3">
                    {/* Map placeholder */}
                    <div className="relative h-48 rounded-lg border border-border overflow-hidden bg-muted/30">
                      {/* Fake map grid */}
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: `
                          linear-gradient(hsl(var(--border)) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px',
                      }} />
                      
                      {/* Map placeholder content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {mapCoords ? (
                          <>
                            <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center animate-pulse">
                              <Crosshair className="w-4 h-4 text-primary" />
                            </div>
                            <p className="text-xs text-foreground font-mono mt-2">
                              {mapCoords.lat}°N, {mapCoords.lng}°W
                            </p>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="mt-1 text-xs h-6"
                              onClick={() => setMapCoords(null)}
                            >
                              Clear Pin
                            </Button>
                          </>
                        ) : (
                          <>
                            <Map className="w-10 h-10 text-muted-foreground/50 mb-2" />
                            <p className="text-xs text-muted-foreground mb-2">Click to drop a pin on parcel center</p>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={handleDropPin}
                            >
                              <Crosshair className="w-3 h-3 mr-1.5" />
                              Drop Pin on Parcel Center
                            </Button>
                          </>
                        )}
                      </div>

                      {/* Map attribution */}
                      <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground/50 font-mono">
                        © OpenStreetMap
                      </div>
                    </div>
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
                    Run Environmental Analysis — $499
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
