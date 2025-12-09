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
    <section className="py-6 border-y border-border/50 bg-muted/30 relative">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, hsl(var(--foreground)) 0, hsl(var(--foreground)) 1px, transparent 1px, transparent 80px)`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
          <Building2 className="w-4 h-4 text-primary" />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.25em]">
            Trusted by New Mexico's Leading Firms
          </p>
          <Building2 className="w-4 h-4 text-primary" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="h-10 px-5 flex items-center justify-center rounded-md bg-card border border-border/50 hover:border-primary/30 transition-colors"
            >
              <span className="text-muted-foreground font-medium text-xs whitespace-nowrap tracking-wide">
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