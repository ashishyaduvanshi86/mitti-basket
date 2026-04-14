import { Link } from "react-router-dom";
import { ArrowLeft, Sun, Leaf, Clock, ShieldCheck } from "lucide-react";
import Marquee from "react-fast-marquee";
import { ProductCard } from "@/components/ProductCard";
import FadeInSection from "@/components/FadeInSection";
import { IMAGES } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import SEO from "@/components/SEO";

export default function MangoHarvestPage() {
  const { seasonHarvest } = useProducts();
  return (
    <main className="pt-[84px] md:pt-[116px]">
      <SEO title="In Season - Mangoes & Litchi" description="Handpicked mangoes from Malda, Varanasi, Bihar — Langra, Chausa, Dashehari, Gulabkhas, Dudhiya Malda and Shahi Litchi. Direct from farms to your doorstep." path="/mango-harvest" products={seasonHarvest} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Season Harvest", path: "/mango-harvest" }]} />
      {/* Page Hero */}
      <section className="relative h-[55vh] min-h-[350px] md:min-h-[450px] flex items-end overflow-hidden" data-testid="mango-hero">
        <div className="absolute inset-0">
          <img src={IMAGES.mangoHero} alt="Mango harvest" className="w-full h-full object-cover hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pb-16 md:pb-20 w-full">
          <Link to="/" className="inline-flex items-center gap-2 font-inter text-sm text-white/60 hover:text-white mb-8 transition-colors" data-testid="mango-back-home-btn">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] mb-3">Summer 2026 Collection</p>
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl text-white tracking-tighter leading-[0.9]">
            Season Harvest<br /><span className="italic">Drop</span>
          </h1>
          <p className="font-inter text-base md:text-lg text-white/60 mt-6 max-w-xl">
            Tree-ripened mangoes and fresh litchis from the heritage orchards of Bihar and Bengal.
          </p>
        </div>
      </section>

      {/* Trust Marquee */}
      <section className="py-4 bg-[#3A5A40]">
        <Marquee speed={40} gradient={false}>
          {["No Carbide Ripening", "No Cold Storage", "Tree-Ripened Only", "Dispatched Within 24 Hours", "Direct from Orchards"].map((text, i) => (
            <span key={i} className="inline-flex items-center mx-8">
              <ShieldCheck className="w-4 h-4 text-[#DDB892] mr-2" />
              <span className="font-inter text-sm text-white/90">{text}</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* Why Different */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          <FadeInSection className="md:col-span-5" direction="left">
            <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40]">Natural Process</p>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mt-3 leading-[1.1]">
              Why Our Harvest Tastes <span className="italic">Different</span>
            </h2>
            <div className="w-16 h-[2px] bg-[#DDB892] mt-6" />
            <p className="font-inter text-base text-[#4B5563] mt-6 leading-[1.8]">
              Our mangoes ripen naturally on the tree until they reach peak sweetness. Handpicked at the right moment and dispatched within 24 hours.
            </p>
            <div className="mt-10 space-y-5">
              {[
                { Icon: Sun, text: "Tree-ripened for maximum sweetness" },
                { Icon: Leaf, text: "No chemical treatment or artificial ripening" },
                { Icon: Clock, text: "Dispatched within 24 hours of picking" },
              ].map(({ Icon, text }, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-[#3A5A40]" />
                  </div>
                  <p className="font-inter text-sm text-[#4B5563]">{text}</p>
                </div>
              ))}
            </div>
          </FadeInSection>
          <FadeInSection className="md:col-span-7" delay={200} direction="right">
            <img src={IMAGES.mangoDetail} alt="Fresh mangoes" className="w-full h-[450px] md:h-[550px] object-cover" />
          </FadeInSection>
        </div>
      </section>

      {/* Harvest Timeline */}
      <section className="py-14 md:py-18 bg-[#DDB892]/10 border-y border-[#DDB892]/20">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40] text-center">Season Calendar</p>
            <h3 className="font-playfair text-3xl md:text-4xl text-[#1A1A1A] text-center mt-2">Harvest Window</h3>
            <div className="mt-10 flex flex-wrap justify-center gap-16">
              {[
                { month: "May", status: "Early Season", active: false },
                { month: "June", status: "Peak Harvest", active: true },
                { month: "July", status: "Late Season", active: false },
              ].map((item) => (
                <div key={item.month} className={`text-center ${item.active ? "" : "opacity-50"}`}>
                  <p className={`font-playfair text-4xl md:text-5xl ${item.active ? "text-[#3A5A40]" : "text-[#4B5563]"}`}>{item.month}</p>
                  <p className="font-inter text-xs text-[#4B5563] mt-2 uppercase tracking-wider">{item.status}</p>
                  {item.active && <div className="w-8 h-[2px] bg-[#DDB892] mx-auto mt-3" />}
                </div>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Product Cards */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto" data-testid="mango-products">
        <FadeInSection>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight">
            Order Fresh <span className="italic">Harvest</span>
          </h2>
          <p className="font-inter text-sm text-[#4B5563] mt-3">Limited batches dispatched every week during the season.</p>
        </FadeInSection>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {seasonHarvest.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 150} direction="scale">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
      </section>
    </main>
  );
}
