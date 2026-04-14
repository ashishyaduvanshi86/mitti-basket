import { Link } from "react-router-dom";
import { MapPin, Phone, Instagram, ArrowUpRight, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await axios.post(`${API}/waitlist`, { email, waitlist_type: "newsletter" });
      setSubscribed(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Newsletter Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-6">
              <h3 className="font-playfair text-3xl md:text-4xl tracking-tight">
                Stay Connected to the Soil
              </h3>
              <p className="font-inter text-sm text-white/50 mt-3">
                Harvest updates, recipes, and stories from Indian farms.
              </p>
            </div>
            <div className="md:col-span-6">
              {subscribed ? (
                <p className="font-inter text-[#DDB892]" data-testid="newsletter-success">
                  Welcome to the Mitti Basket family.
                </p>
              ) : (
                <form
                  onSubmit={handleNewsletter}
                  className="flex flex-col sm:flex-row gap-0"
                  data-testid="newsletter-form"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-inter h-12 rounded-none focus-visible:ring-[#DDB892] flex-1"
                    data-testid="newsletter-email-input"
                  />
                  <button
                    type="submit"
                    className="bg-[#DDB892] text-[#1A1A1A] px-8 h-12 font-inter font-semibold text-sm hover:bg-[#c9a67e] transition-colors whitespace-nowrap"
                    data-testid="newsletter-submit-btn"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <h2 className="font-playfair text-4xl md:text-5xl tracking-tight text-white">
              Mitti Basket
            </h2>
            <p className="font-inter text-sm text-white/40 leading-relaxed max-w-sm mt-6">
              From India's soil to your home. Seasonal harvests and heritage
              foods, delivered with care.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href="https://wa.me/919880392340?text=Hey%21%20I%27d%20like%20to%20know%20more%20about%20Mitti%20Basket.%20How%20can%20you%20help%20me%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-[#DDB892] hover:text-[#DDB892] transition-colors"
                data-testid="footer-whatsapp"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@mittibasket.com"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-[#DDB892] hover:text-[#DDB892] transition-colors"
                data-testid="footer-email-icon"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/mittibasket?igsh=M2hvbWY5MGttODZ6&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:border-[#DDB892] hover:text-[#DDB892] transition-colors"
                data-testid="footer-instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-2">
            <h4 className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold text-[#DDB892] mb-6">
              Shop
            </h4>
            <nav className="flex flex-col gap-3" data-testid="footer-nav">
              {[
                { to: "/mango-harvest", label: "Mango Harvest" },
                { to: "/village-pantry", label: "Village Pantry" },
                { to: "/festive-collection", label: "Festive Collection" },
                { to: "/farm-basket-subscription", label: "Farm Baskets" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-inter text-sm text-white/50 hover:text-white transition-colors animated-underline"
                  data-testid={`footer-link-${link.to.slice(1)}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Menu */}
          <div className="md:col-span-2">
            <h4 className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold text-[#DDB892] mb-6">
              Policies
            </h4>
            <nav className="flex flex-col gap-3" data-testid="footer-policies-nav">
              {[
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/refund-policy", label: "Refund & Cancellation" },
                { to: "/shipping-policy", label: "Shipping & Delivery" },
                { to: "/contact", label: "Contact Us" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="font-inter text-sm text-white/50 hover:text-white transition-colors animated-underline"
                  data-testid={`footer-policy-${link.to.slice(1)}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Delivery */}
          <div className="md:col-span-4">
            <h4 className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold text-[#DDB892] mb-6">
              Delivery
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-inter text-sm text-white/70">Currently delivering in Bangalore</p>
                  <p className="font-inter text-xs text-white/30 mt-1">
                    Expanding to Hyderabad, Chennai & Mumbai soon
                  </p>
                </div>
              </div>
              <a
                href="mailto:contact@mittibasket.com"
                className="inline-flex items-center gap-2 font-inter text-sm text-[#DDB892] hover:text-white transition-colors mt-2"
                data-testid="footer-order-email"
              >
                Contact Us <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-white/5" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-playfair text-xl md:text-2xl text-white/30 italic">
            Rooted in India. Delivered with care.
          </p>
          <p className="font-inter text-[11px] text-white/20 tracking-wider">
            &copy; 2026 MITTI BASKET. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
}
