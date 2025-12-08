import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/logo-dark.png";

interface NavbarProps {
  onRunReport: () => void;
}

const Navbar = ({ onRunReport }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Rio Grande Due Diligence" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl font-semibold text-foreground tracking-tight">
                Rio Grande
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                Due Diligence
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Data Sources
            </a>
            <a href="#search" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Run Report
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* CTA */}
          <Button variant="hero" size="sm" onClick={onRunReport} className="shadow-glow">
            <Shield className="w-4 h-4 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;