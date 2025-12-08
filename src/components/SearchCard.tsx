import { useState } from "react";
import { Search, MapPin, Lock, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchCardProps {
  onSearch: (address: string) => void;
}

const SearchCard = ({ onSearch }: SearchCardProps) => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      onSearch(address);
    }
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
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 shadow-glow">
                  <MapPin className="w-10 h-10 text-primary" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3 tracking-tight">
                  Start Your Due Diligence
                </h2>
                <p className="text-muted-foreground text-lg">
                  Enter any New Mexico property address or APN number
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
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
                
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="xl" 
                  className="w-full h-16 text-lg shadow-glow group"
                  disabled={!address.trim()}
                >
                  <Shield className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Run Environmental Analysis
                </Button>
              </form>

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