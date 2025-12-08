import { Scale, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-16 bg-card border-t border-border relative">
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-semibold text-foreground">Rio Grande</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Due Diligence</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-6">
              Professional environmental compliance screening for New Mexico land development. 
              Trusted by engineers, developers, and real estate professionals since 2019.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 uppercase tracking-wider">
              <MapPin className="w-3 h-3" />
              Albuquerque, New Mexico
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <a href="mailto:reports@rgdd.com" className="hover:text-primary transition-colors">
                  reports@rgdd.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <a href="tel:+15055551234" className="hover:text-primary transition-colors">
                  (505) 555-1234
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-lg font-semibold text-foreground mb-5">Resources</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  Sample Report
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  Data Sources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  API Access
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  Enterprise Plans
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="text-xs uppercase tracking-wider">© 2024 Rio Grande Due Diligence LLC. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-primary transition-colors text-xs uppercase tracking-wider">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors text-xs uppercase tracking-wider">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;