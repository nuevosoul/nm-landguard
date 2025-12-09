import { FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onRunReport: () => void;
  onViewSample: () => void;
}

const HeroSection = ({ onRunReport, onViewSample }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center gradient-hero overflow-hidden pt-14">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Gold accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline - tighter */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold text-foreground leading-[1.1] mb-4 animate-slide-up">
            Instant New Mexico
            <br />
            <span className="text-gradient">Environmental Compliance</span>
            <br />
            Reports
          </h1>

          {/* Subhead - compact */}
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Comprehensive Cultural, Water, and Habitat risk assessments delivered in 30 seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" onClick={onRunReport} className="shadow-glow group">
              <FileCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Run Instant Report — $499
            </Button>
            <Button variant="outline" size="lg" onClick={onViewSample} className="border-border/50 hover:bg-muted/50">
              View Sample Report
            </Button>
          </div>

          {/* Trust badges - regulatory weight */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-xs text-muted-foreground/80 font-mono">
              Aligned with ASTM E1527-21
            </span>
            <span className="text-border/50">|</span>
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-xs text-muted-foreground/80 font-mono">
              Direct OSE Data Connection
            </span>
            <span className="text-border/50">|</span>
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-xs text-muted-foreground/80 font-mono">
              Live NMCRIS Proximity Check
            </span>
          </div>

          {/* Compact data sources */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/70 pt-4 border-t border-border/20">
            <span className="uppercase tracking-widest">Official Data Sources:</span>
            <span className="font-mono text-foreground/80">NMCRIS</span>
            <span className="text-border/30">•</span>
            <span className="font-mono text-foreground/80">NM OSE</span>
            <span className="text-border/30">•</span>
            <span className="font-mono text-foreground/80">USFWS</span>
            <span className="text-border/30">•</span>
            <span className="font-mono text-foreground/80">FEMA</span>
            <span className="text-border/30">•</span>
            <span className="font-mono text-foreground/80">EPA</span>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
