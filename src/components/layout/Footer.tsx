import { Link } from "react-router-dom";
import { Leaf, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">{APP_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering farmers and connecting agricultural communities with technology-driven solutions for a sustainable future.
            </p>
            {/* Social media links - placeholder URLs until official accounts are set up */}
            <div className="flex gap-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                aria-label="Follow us on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/marketplace" className="text-muted-foreground transition-colors hover:text-primary">Marketplace</Link></li>
              <li><Link to="/advisory" className="text-muted-foreground transition-colors hover:text-primary">Expert Advisory</Link></li>
              <li><Link to="/diagnostics" className="text-muted-foreground transition-colors hover:text-primary">Crop Diagnostics</Link></li>
              <li><Link to="/community" className="text-muted-foreground transition-colors hover:text-primary">Community</Link></li>
            </ul>
          </div>

          {/* Resources - Links route to founders page with relevant anchors */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/founders" className="text-muted-foreground transition-colors hover:text-primary cursor-pointer">About Us</Link></li>
              <li><Link to="/founders#contact" className="text-muted-foreground transition-colors hover:text-primary cursor-pointer">Help Center</Link></li>
              <li><Link to="/founders#privacy" className="text-muted-foreground transition-colors hover:text-primary cursor-pointer">Privacy Policy</Link></li>
              <li><Link to="/founders#terms" className="text-muted-foreground transition-colors hover:text-primary cursor-pointer">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>support@agrihub.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>123 Farm Road, Agricultural District, AG 12345</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with 💚 for farmers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
