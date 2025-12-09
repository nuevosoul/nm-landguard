import { Mail, Phone, MapPin, AlertCircle } from "lucide-react";
import logoImage from "@/assets/logo-dark.png";

const Footer = () => {
  return (
    <footer className="py-10 bg-card border-t border-border relative">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        {/* Disclaimer - prominent */}
        <div className="mb-8 p-4 rounded-lg border border-border/50 bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground/80">Disclaimer:</strong> Rio Grande Due Diligence is a pre-compliance screening tool and does not substitute for official regulatory consultation. 
              This report does not constitute a Phase I ESA under ASTM E1527-21. Always consult with qualified professionals and relevant agencies before making development decisions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logoImage} alt="Rio Grande Due Diligence" className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="font-display text-lg font-semibold text-foreground">Rio Grande</span>
                <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Due Diligence</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-4">
              Professional environmental compliance screening for New Mexico land development.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-mono">
              <MapPin className="w-3 h-3" />
              Albuquerque, NM 87102
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-primary" />
                <a href="mailto:reports@rgdd.com" className="hover:text-primary transition-colors font-mono text-xs">
                  reports@rgdd.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-primary" />
                <a href="tel:+15055551234" className="hover:text-primary transition-colors font-mono text-xs">
                  (505) 555-1234
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors text-xs">Sample Report</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-xs">Data Sources</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-xs">API Access</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-xs">Enterprise Plans</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p className="font-mono">© 2024 Rio Grande Due Diligence LLC</p>
          <div className="flex items-center gap-6 font-mono">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <span className="text-muted-foreground/50">v2.1.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
