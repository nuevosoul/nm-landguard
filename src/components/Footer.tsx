import { Shield, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-12 bg-surface-overlay border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg text-foreground">Rio Grande Due Diligence</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
              Professional environmental compliance screening for New Mexico land development. 
              Trusted by engineers, developers, and real estate professionals since 2019.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:reports@rgdd.com" className="hover:text-primary transition-colors">
                  reports@rgdd.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+15055551234" className="hover:text-primary transition-colors">
                  (505) 555-1234
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">Sample Report</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Data Sources</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">API Access</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Enterprise Plans</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2024 Rio Grande Due Diligence LLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
