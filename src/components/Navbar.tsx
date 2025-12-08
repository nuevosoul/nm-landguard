import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onRunReport: () => void;
}

const Navbar = ({ onRunReport }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">Rio Grande Due Diligence</span>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Data Sources
            </a>
            <a href="#search" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Run Report
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* CTA */}
          <Button variant="default" size="sm" onClick={onRunReport}>
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
