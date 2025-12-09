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
            New Mexico
            <br />
            <span className="text-gradient">Regulatory Risk Intelligence</span>
          </h1>

          {/* Subhead - compact */}
          <p className="text-base text-muted-foreground max-w-xl mx-auto mb-6 leading-relaxed" style={{ animationDelay: "0.1s" }}>
            Real-time aggregation of OSE, USFWS, and HPD data layers for preliminary desktop due diligence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6" style={{ animationDelay: "0.2s" }}>
            <div className="relative">
              <Button variant="hero" size="xl" onClick={onRunReport} className="shadow-glow group">
                <FileCheck className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Generate Site Assessment — $499
              </Button>
              {/* Live Query Badge */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live-Query Data Guarantee: Zero Caching
                </span>
              </div>
            </div>
            <Button variant="outline" size="lg" onClick={onViewSample} className="border-border/50 hover:bg-muted/50">
              View Sample Report
            </Button>
          </div>

          {/* Trust badges - regulatory weight */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 mt-10">
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wide">
              Aligned with ASTM E1527-21
            </span>
            <span className="text-border/50">|</span>
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wide">
              Direct OSE Data Connection
            </span>
            <span className="text-border/50">|</span>
            <span className="px-3 py-1.5 rounded border border-border/50 bg-muted/30 text-[10px] text-muted-foreground/80 font-mono uppercase tracking-wide">
              Live NMCRIS Proximity Check
            </span>
          </div>

          {/* Compact data sources */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground/70 pt-4 border-t border-border/20">
            <span className="uppercase tracking-widest font-medium">Official Data Sources:</span>
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
