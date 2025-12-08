import { Building2 } from "lucide-react";

const SocialProof = () => {
  const companies = [
    "Jaynes Corporation",
    "Bradbury Stamm",
    "Dekker Perich Sabatini",
    "Wilson & Company",
    "Molzen Corbin",
  ];

  return (
    <section className="py-20 border-y border-border/50 bg-muted/30 relative">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, hsl(var(--foreground)) 0, hsl(var(--foreground)) 1px, transparent 1px, transparent 80px)`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
          <Building2 className="w-4 h-4 text-primary" />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.25em]">
            Trusted by New Mexico's Leading Firms
          </p>
          <Building2 className="w-4 h-4 text-primary" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="h-14 px-8 flex items-center justify-center rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <span className="text-muted-foreground font-medium text-sm whitespace-nowrap tracking-wide">
                {company}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;