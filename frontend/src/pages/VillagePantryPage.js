import { Link } from "react-router-dom";
import { ArrowLeft, Flame, Heart, Shield } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import FadeInSection from "@/components/FadeInSection";
import { IMAGES } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import SEO from "@/components/SEO";

export default function VillagePantryPage() {
  const { villagePantry } = useProducts();
  return (
    <main className="pt-[84px] md:pt-[116px]">
      <SEO title="Village Pantry" description="A2 Desi Ghee, Stone-ground Sattu, Premium Makhana, Cold Pressed Mustard Oil, and farm-fresh dals. Heritage pantry essentials from Bihar's villages." path="/village-pantry" products={villagePantry} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Village Pantry", path: "/village-pantry" }]} />
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[350px] md:min-h-[450px] flex items-end overflow-hidden" data-testid="pantry-hero">
        <div className="absolute inset-0">
          <img src={IMAGES.pantryHero} alt="Village pantry" className="w-full h-full object-cover hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pb-16 md:pb-20 w-full">
          <Link to="/" className="inline-flex items-center gap-2 font-inter text-sm text-white/60 hover:text-white mb-8 transition-colors" data-testid="pantry-back-home-btn">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] mb-3">Heritage Collection</p>
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl text-white tracking-tighter leading-[0.9]">
            Village Pantry<br /><span className="italic">Essentials</span>
          </h1>
          <p className="font-inter text-base md:text-lg text-white/60 mt-6 max-w-xl">
            Small-batch, chemical-free pantry essentials made the traditional way in Indian villages.
          </p>
        </div>
      </section>

      {/* Process Strip */}
      <section className="py-14 md:py-18 bg-white border-b border-[#3A5A40]/5">
        <div className="px-6 md:px-12 lg:px-24 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { Icon: Flame, title: "Traditional Methods", desc: "Time-honored techniques passed down through generations." },
            { Icon: Shield, title: "Chemical Free", desc: "No preservatives, no artificial colors, no shortcuts." },
            { Icon: Heart, title: "Small Batch", desc: "Limited quantities to ensure the highest quality." },
          ].map(({ Icon, title, desc }, idx) => (
            <FadeInSection key={title} delay={idx * 120} direction="up">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#3A5A40]" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg text-[#1A1A1A]">{title}</h3>
                  <p className="font-inter text-sm text-[#4B5563] mt-1">{desc}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* All Pantry Products — Card Grid */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto" data-testid="pantry-products">
        <FadeInSection>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight">
            Pantry <span className="italic">Essentials</span>
          </h2>
          <p className="font-inter text-sm text-[#4B5563] mt-3">{villagePantry.length} products sourced directly from village kitchens and small farms.</p>
        </FadeInSection>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {villagePantry.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 100} direction="up">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
      </section>
    </main>
  );
}
