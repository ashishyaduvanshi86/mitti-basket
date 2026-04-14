import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import Marquee from "react-fast-marquee";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";

const navLinks = [
  { label: "In Season", href: "/mango-harvest" },
  { label: "Village Pantry", href: "/village-pantry" },
  { label: "Festive", href: "/festive-collection" },
  { label: "Farm Basket", href: "/farm-basket-subscription" },
];

const announcements = [
  "Deliveries Begin 30th April \u2014 Pre Order Now",
  "Free Delivery in Bangalore on All Orders",
  "Summer Mango Harvest Now Live",
  "Join 500+ Families Who Trust Mitti Basket",
  "Subscribe & Save on Village Pantry Essentials",
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();

  const handleNavClick = (href) => (e) => {
    if (location.pathname === href) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        {/* Announcement Bar */}
        <div className="bg-[#3A5A40] overflow-hidden" data-testid="announcement-bar">
          <Marquee speed={35} gradient={false} className="py-1.5 md:py-2">
            {announcements.map((text, i) => (
              <span key={i} className="inline-flex items-center mx-8 md:mx-10">
                <span className="font-inter text-[10px] md:text-[11px] text-white/90 tracking-[0.15em] uppercase">
                  {text}
                </span>
                <span className="text-[#DDB892] mx-8 md:mx-10 text-[10px]">&#9670;</span>
              </span>
            ))}
          </Marquee>
        </div>

        {/* Main Nav */}
        <nav className="bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#3A5A40]/8">
          {/* Desktop Nav */}
          <div className="hidden md:grid max-w-[1400px] mx-auto px-6 md:px-10 grid-cols-3 items-center h-[68px]">
            <div className="flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={handleNavClick(link.href)}
                  className={`font-inter text-[13px] tracking-[0.02em] transition-colors hover:text-[#3A5A40] ${
                    location.pathname === link.href
                      ? "text-[#3A5A40] font-medium"
                      : "text-[#6B7280] font-normal"
                  }`}
                  data-testid={`nav-link-${link.href.slice(1)}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <Link
              to="/"
              onClick={handleNavClick("/")}
              className="font-playfair text-[26px] text-[#3A5A40] tracking-[-0.02em] text-center justify-self-center whitespace-nowrap"
              data-testid="navbar-logo"
            >
              MITTI BASKET
            </Link>
            <div className="flex items-center justify-end gap-8">
              <Link
                to="/contact"
                onClick={handleNavClick("/contact")}
                className={`font-inter text-[13px] tracking-[0.02em] transition-colors hover:text-[#3A5A40] ${
                  location.pathname === "/contact"
                    ? "text-[#3A5A40] font-medium"
                    : "text-[#6B7280] font-normal"
                }`}
                data-testid="nav-link-contact"
              >
                Contact Us
              </Link>
              <button
                onClick={() => setCartOpen(true)}
                className="relative font-inter text-[13px] font-medium text-[#3A5A40] hover:text-[#2c4430] transition-colors flex items-center gap-1.5"
                data-testid="navbar-cart-btn"
              >
                <ShoppingBag className="w-[18px] h-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-3 w-[18px] h-[18px] bg-[#3A5A40] text-white rounded-full text-[9px] font-bold flex items-center justify-center" data-testid="cart-count-badge">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden flex items-center justify-between px-5 h-[52px]">
            <Link
              to="/"
              onClick={handleNavClick("/")}
              className="font-playfair text-[20px] text-[#3A5A40] tracking-[-0.02em]"
              data-testid="navbar-logo-mobile"
            >
              MITTI BASKET
            </Link>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-1"
                data-testid="mobile-cart-btn"
              >
                <ShoppingBag className="w-5 h-5 text-[#3A5A40]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[16px] h-[16px] bg-[#3A5A40] text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 -mr-2" data-testid="mobile-menu-btn">
                    <Menu className="w-5 h-5 text-[#3A5A40]" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#FAF7F2] w-[280px] border-l border-[#3A5A40]/10 p-0">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="flex flex-col px-6 pt-14 pb-8 h-full">
                    <Link
                      to="/"
                      className="font-playfair text-2xl text-[#3A5A40] tracking-tight"
                      onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      MITTI BASKET
                    </Link>
                    <div className="w-10 h-[1px] bg-[#DDB892] mt-6 mb-6" />
                    <div className="flex flex-col gap-5">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`font-inter text-base transition-colors ${
                            location.pathname === link.href
                              ? "text-[#3A5A40] font-medium"
                              : "text-[#1A1A1A] hover:text-[#3A5A40]"
                          }`}
                          onClick={() => { setMenuOpen(false); if (location.pathname === link.href) window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          data-testid={`mobile-nav-${link.href.slice(1)}`}
                        >
                          {link.label}
                        </Link>
                      ))}
                      <Link
                        to="/contact"
                        className={`font-inter text-base transition-colors ${
                          location.pathname === "/contact"
                            ? "text-[#3A5A40] font-medium"
                            : "text-[#1A1A1A] hover:text-[#3A5A40]"
                        }`}
                        onClick={() => { setMenuOpen(false); if (location.pathname === "/contact") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        data-testid="mobile-nav-contact"
                      >
                        Contact Us
                      </Link>
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => { setMenuOpen(false); setCartOpen(true); }}
                        className="flex items-center justify-center gap-2 w-full bg-[#3A5A40] text-white px-6 py-3.5 font-inter font-medium text-sm"
                        data-testid="mobile-view-cart-btn"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        View Cart {itemCount > 0 && `(${itemCount})`}
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
