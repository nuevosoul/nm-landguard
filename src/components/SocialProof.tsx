const SocialProof = () => {
  const companies = [
    "Jaynes Corporation",
    "Bradbury Stamm",
    "Dekker Perich Sabatini",
    "Wilson & Company",
    "Molzen Corbin",
  ];

  return (
    <section className="py-16 border-y border-border bg-surface-elevated">
      <div className="container mx-auto px-4">
        <p className="text-center text-muted-foreground text-sm font-medium mb-10 uppercase tracking-wider">
          Trusted by New Mexico's Top Developers & Engineering Firms
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {companies.map((company, index) => (
            <div 
              key={index}
              className="h-12 px-6 flex items-center justify-center rounded-lg bg-muted/50 border border-border"
            >
              <span className="text-muted-foreground font-semibold text-sm whitespace-nowrap">
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
