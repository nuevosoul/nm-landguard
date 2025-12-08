import { Scroll, Droplet, Leaf, LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  source: string;
}

const FeatureCard = ({ icon: Icon, title, description, source }: FeatureCardProps) => {
  return (
    <div className="group relative p-8 rounded-xl gradient-card border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 shadow-card hover:shadow-elevated">
      {/* Icon */}
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      
      {/* Content */}
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-4 leading-relaxed">{description}</p>
      
      {/* Source tag */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
        Data: {source}
      </div>
    </div>
  );
};

const FeaturesGrid = () => {
  const features = [
    {
      icon: Scroll,
      title: "NMCRIS Cultural & Historic Review",
      description: "Comprehensive screening against New Mexico's Cultural Resource Information System for archaeological sites, historic structures, and traditional cultural properties.",
      source: "NMCRIS",
    },
    {
      icon: Droplet,
      title: "OSE Water Rights & Well Restrictions",
      description: "Real-time verification of water availability, declared basins, well permit requirements, and Rio Grande Compact restrictions affecting your parcel.",
      source: "NM OSE",
    },
    {
      icon: Leaf,
      title: "USFWS Critical Habitat Screening",
      description: "Federal endangered species analysis including Rio Grande Silvery Minnow habitat, Southwestern Willow Flycatcher zones, and other protected areas.",
      source: "USFWS",
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Three Critical Databases. One Instant Report.
          </h2>
          <p className="text-lg text-muted-foreground">
            We aggregate data from New Mexico's primary regulatory sources to give you a complete risk assessment.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
