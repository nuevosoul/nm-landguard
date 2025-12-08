import { Shield, Scroll, Droplet, Leaf, Award, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onRunReport: () => void;
  onViewSample: () => void;
}

const HeroSection = ({ onRunReport, onViewSample }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center gradient-hero overflow-hidden pt-20">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-24 left-8 w-32 h-32 border-l-2 border-t-2 border-primary/20 hidden lg:block" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-r-2 border-b-2 border-primary/20 hidden lg:block" />

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Official badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 text-primary mb-10 animate-fade-in">
            <Award className="w-4 h-4" />
            <span className="text-sm font-semibold uppercase tracking-wider">Trusted by 500+ New Mexico Developers</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold text-foreground leading-[1.1] mb-8 animate-slide-up">
            Instant New Mexico
            <br />
            <span className="text-gradient">Environmental Compliance</span>
            <br />
            Reports
          </h1>

          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/50" />
            <div className="w-2 h-2 rotate-45 border border-primary/50" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          {/* Subhead */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light" style={{ animationDelay: "0.1s" }}>
            Comprehensive Cultural, Water, and Habitat risk assessments delivered in 30 seconds. 
            <span className="text-foreground font-medium"> Make informed decisions with confidence.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" onClick={onRunReport} className="shadow-glow group">
              <FileCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Run Instant Report — $499
            </Button>
            <Button variant="outline" size="lg" onClick={onViewSample} className="border-border/50 hover:bg-muted/50">
              View Sample Report
            </Button>
          </div>

          {/* Data sources - more refined */}
          <div className="flex flex-wrap items-center justify-center gap-10 text-muted-foreground pt-8 border-t border-border/30">
            <span className="text-xs uppercase tracking-widest text-muted-foreground/70">Official Data Sources:</span>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Scroll className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">NMCRIS</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Droplet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">NM OSE</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">USFWS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;