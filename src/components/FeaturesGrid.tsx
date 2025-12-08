import { Scroll, Droplet, Leaf, LucideIcon, ChevronRight } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  source: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, source, index }: FeatureCardProps) => {
  return (
    <div 
      className="group relative p-8 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 shadow-card hover:shadow-elevated"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Icon */}
      <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      
      {/* Content */}
      <h3 className="font-display text-2xl font-semibold text-foreground mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
      
      {/* Source tag */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
          {source} Database
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const FeaturesGrid = () => {
  const features = [
    {
      icon: Scroll,
      title: "Cultural & Historic Review",
      description: "Comprehensive screening against New Mexico's Cultural Resource Information System for archaeological sites, historic structures, and traditional cultural properties.",
      source: "NMCRIS",
    },
    {
      icon: Droplet,
      title: "Water Rights & Well Restrictions",
      description: "Real-time verification of water availability, declared basins, well permit requirements, and Rio Grande Compact restrictions affecting your parcel.",
      source: "NM OSE",
    },
    {
      icon: Leaf,
      title: "Critical Habitat Screening",
      description: "Federal endangered species analysis including Rio Grande Silvery Minnow habitat, Southwestern Willow Flycatcher zones, and other protected areas.",
      source: "USFWS",
    },
  ];

  return (
    <section className="py-28 bg-background relative" id="features">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold mb-4 block">
            Comprehensive Analysis
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6 tracking-tight">
            Three Critical Databases.
            <br />
            <span className="text-gradient">One Authoritative Report.</span>
          </h2>
          
          {/* Decorative divider */}
          <div className="flex items-center justify-center gap-4 mt-6 mb-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-border" />
            <div className="w-1.5 h-1.5 rotate-45 bg-primary" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-border" />
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We aggregate data from New Mexico's primary regulatory sources to deliver a complete environmental risk assessment for your property.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;