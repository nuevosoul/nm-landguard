import { Shield, Scroll, Droplet, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onRunReport: () => void;
}

const HeroSection = ({ onRunReport }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center gradient-hero overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted by 500+ NM Developers</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            Instant New Mexico
            <br />
            <span className="text-primary">Environmental Compliance</span> Reports
          </h1>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10" style={{ animationDelay: "0.1s" }}>
            Check Cultural, Water, and Habitat risks in 30 seconds. Make informed development decisions with confidence.
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" onClick={onRunReport}>
              Run Instant Report - $499
            </Button>
            <Button variant="outline" size="lg">
              View Sample Report
            </Button>
          </div>

          {/* Data sources */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-primary" />
              <span className="text-sm">NMCRIS Database</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-primary" />
              <span className="text-sm">OSE Water Records</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm">USFWS Habitat Data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
