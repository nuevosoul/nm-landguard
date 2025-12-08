import { useState } from "react";
import { Search, MapPin, Lock, Zap, Shield, FileText, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchCardProps {
  onSearch: (query: string, queryType: "address" | "legal" | "coordinates") => void;
}

const SearchCard = ({ onSearch }: SearchCardProps) => {
  const [address, setAddress] = useState("");
  const [legalDescription, setLegalDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [activeTab, setActiveTab] = useState<"address" | "legal" | "coordinates">("address");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === "address" && address.trim()) {
      onSearch(address, "address");
    } else if (activeTab === "legal" && legalDescription.trim()) {
      onSearch(legalDescription, "legal");
    } else if (activeTab === "coordinates" && latitude.trim() && longitude.trim()) {
      onSearch(`${latitude},${longitude}`, "coordinates");
    }
  };

  const isSubmitDisabled = () => {
    if (activeTab === "address") return !address.trim();
    if (activeTab === "legal") return !legalDescription.trim();
    if (activeTab === "coordinates") return !latitude.trim() || !longitude.trim();
    return true;
  };

  return (
    <section className="py-28 bg-background relative" id="search">
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
          <div className="relative rounded-2xl border border-border bg-card shadow-elevated overflow-hidden">
            {/* Top gold accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
            
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl pointer-events-none" />
            
            <div className="relative p-10 md:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-glow">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight">
                  Start Your Due Diligence
                </h2>
                <p className="text-muted-foreground text-lg">
                  Search by address, legal description, or GPS coordinates
                </p>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="mb-6">
                <TabsList className="grid w-full grid-cols-3 h-12">
                  <TabsTrigger value="address" className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="hidden sm:inline">Address</span>
                  </TabsTrigger>
                  <TabsTrigger value="legal" className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Legal Desc.</span>
                  </TabsTrigger>
                  <TabsTrigger value="coordinates" className="flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4" />
                    <span className="hidden sm:inline">GPS</span>
                  </TabsTrigger>
                </TabsList>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <TabsContent value="address" className="mt-0 space-y-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., 1234 Rio Grande Blvd, Albuquerque, NM"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="pl-12 h-16 text-lg bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Enter a street address or APN (Assessor's Parcel Number)
                    </p>
                  </TabsContent>

                  <TabsContent value="legal" className="mt-0 space-y-4">
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="e.g., Lot 12, Block 3, Rio Grande Estates"
                        value={legalDescription}
                        onChange={(e) => setLegalDescription(e.target.value)}
                        className="pl-12 h-16 text-lg bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Enter the legal description from a deed or title document
                    </p>
                  </TabsContent>

                  <TabsContent value="coordinates" className="mt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          Lat
                        </span>
                        <Input
                          type="text"
                          placeholder="35.0844"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          className="pl-12 h-16 text-lg bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                        />
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                          Lng
                        </span>
                        <Input
                          type="text"
                          placeholder="-106.6504"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          className="pl-12 h-16 text-lg bg-muted/50 border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Enter GPS coordinates in decimal degrees (WGS84)
                    </p>
                  </TabsContent>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="xl" 
                    className="w-full h-16 text-lg shadow-glow group"
                    disabled={isSubmitDisabled()}
                  >
                    <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Run Environmental Analysis
                  </Button>
                </form>
              </Tabs>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-border">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="w-4 h-4 text-primary" />
                  <span>256-bit Encrypted</span>
                </span>
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>30-Second Results</span>
                </span>
              </div>
            </div>
          </div>

          {/* Additional trust element */}
          <p className="text-center text-xs text-muted-foreground/70 mt-6 uppercase tracking-wider">
            Professional-grade environmental screening for New Mexico land development
          </p>
        </div>
      </div>
    </section>
  );
};

export default SearchCard;