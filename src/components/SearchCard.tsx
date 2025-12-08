import { useState } from "react";
import { Search, MapPin } from "lucide-react";
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
    <section className="py-24 bg-background" id="search">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Card */}
          <div className="relative p-8 md:p-10 rounded-2xl gradient-card border border-border shadow-elevated">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-primary/5 rounded-2xl blur-xl" />
            
            <div className="relative">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Start Your Due Diligence
                </h2>
                <p className="text-muted-foreground">
                  Enter any New Mexico property address or APN number
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g., 1234 Rio Grande Blvd, Albuquerque, NM or APN 123-456-789"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-12 h-14 text-base bg-muted border-border focus:border-primary"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="xl" 
                  className="w-full"
                  disabled={!address.trim()}
                >
                  Run Environmental Analysis
                </Button>
              </form>

              {/* Trust indicators */}
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-safe" />
                  Secure & Encrypted
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-safe" />
                  Instant Results
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
