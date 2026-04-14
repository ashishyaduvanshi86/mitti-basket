import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Truck, Package, Leaf, Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Marquee from "react-fast-marquee";
import { ProductCard } from "@/components/ProductCard";
import FadeInSection from "@/components/FadeInSection";
import SEO from "@/components/SEO";
import {
  heroSlides,
  testimonials,
  IMAGES,
} from "@/data/products";
import { useProducts } from "@/context/ProductContext";

/* ─── HERO CAROUSEL ─── */
function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((idx) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % heroSlides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden" data-testid="hero-section">
      {heroSlides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className={`w-full h-full object-cover ${idx === current ? "hero-zoom" : ""}`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-5 md:px-6">
        <div className="mb-4 md:mb-6 stagger-1">
          <span className="inline-block bg-[#DDB892] text-[#1A1A1A] px-4 py-1.5 md:px-5 md:py-2 font-inter text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em]">
            {heroSlides[current].badge}
          </span>
        </div>
        <h1
          key={current}
          className="font-playfair text-[52px] sm:text-6xl md:text-7xl lg:text-[110px] text-white tracking-tighter leading-[0.9] hero-title-enter"
          data-testid="hero-title"
        >
          {heroSlides[current].title}
        </h1>
        <p className="mt-4 md:mt-6 font-inter text-sm md:text-lg text-white/60 max-w-xs md:max-w-md hero-subtitle-enter">
          {heroSlides[current].subtitle}
        </p>
        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 stagger-4 w-full sm:w-auto">
          <Link
            to="/mango-harvest"
            className="bg-[#DDB892] text-[#1A1A1A] px-8 py-3.5 md:px-10 md:py-4 font-inter font-semibold text-xs md:text-sm hover:bg-[#c9a67e] transition-all duration-300 inline-flex items-center justify-center gap-2 uppercase tracking-[0.06em]"
            data-testid="hero-shop-btn"
          >
            Shop Now <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/farm-basket-subscription"
            className="group relative border border-white/25 text-white px-6 py-2.5 md:px-8 md:py-3 font-inter font-medium text-[10px] md:text-xs inline-flex items-center justify-center gap-2 uppercase tracking-[0.08em] overflow-hidden transition-all duration-500 hover:border-[#DDB892]/60 hover:shadow-[0_0_30px_rgba(221,184,146,0.15)]"
            data-testid="hero-garden-btn"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#DDB892]/0 via-[#DDB892]/5 to-[#DDB892]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <span className="relative flex items-center gap-2">
              Secret Garden Box
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110">&#10022;</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {heroSlides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-500 ${
              idx === current ? "w-8 h-[3px] bg-[#DDB892]" : "w-3 h-[3px] bg-white/30 hover:bg-white/60"
            }`}
            data-testid={`hero-slide-${idx}`}
          />
        ))}
      </div>

      <button
        onClick={() => goTo((current - 1 + heroSlides.length) % heroSlides.length)}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 items-center justify-center hover:border-white/60 hover:bg-white/10 transition-all duration-300 hidden md:flex"
        data-testid="hero-prev"
      >
        <ChevronLeft className="w-5 h-5 text-white/60" />
      </button>
      <button
        onClick={() => next()}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 border border-white/20 items-center justify-center hover:border-white/60 hover:bg-white/10 transition-all duration-300 hidden md:flex"
        data-testid="hero-next"
      >
        <ChevronRight className="w-5 h-5 text-white/60" />
      </button>
    </section>
  );
}

/* ─── TRUST STRIP ─── */
function TrustStripSection() {
  const pillars = [
    { number: "50+", label: "Partner Farms", sublabel: "Across Bihar & Bengal" },
    { number: "100%", label: "Chemical Free", sublabel: "No pesticides or preservatives" },
    { number: "Direct", label: "From Farmers", sublabel: "Zero middlemen, honest pricing" },
    { number: "Small", label: "Batch Only", sublabel: "Limited quantities per cycle" },
  ];
  return (
    <section className="bg-[#DDB892]/15 border-y border-[#DDB892]/20" data-testid="trust-strip">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {pillars.map((p, idx) => (
            <FadeInSection key={idx} delay={idx * 100} direction="up">
              <div className="text-center md:text-left">
                <p className="font-playfair text-3xl md:text-4xl text-[#3A5A40] tracking-tight">{p.number}</p>
                <p className="font-inter text-sm font-semibold text-[#1A1A1A] mt-1">{p.label}</p>
                <p className="font-inter text-xs text-[#4B5563] mt-1">{p.sublabel}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── COMPACT EDITORIAL MARQUEE ─── */
function EditorialMarquee({ items, speed = 25, bgClass = "bg-transparent" }) {
  return (
    <section className={`py-4 md:py-5 overflow-hidden border-y border-[#3A5A40]/5 ${bgClass}`}>
      <Marquee speed={speed} gradient={false}>
        {items.map((text, i) => (
          <span key={i} className="inline-flex items-center mx-10 md:mx-14">
            <span className="font-playfair text-xl md:text-2xl lg:text-3xl italic text-[#3A5A40]/20 whitespace-nowrap">
              {text}
            </span>
            <span className="text-[#DDB892]/40 mx-10 md:mx-14 text-sm">&#9670;</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ─── SEASON HARVEST — "They're Back" ─── */
function SeasonHarvestSection() {
  const { seasonHarvest } = useProducts();
  return (
    <section className="pt-0 pb-16 md:pb-24" data-testid="season-harvest-section">
      <div className="relative h-[40vh] md:h-[55vh] min-h-[280px] overflow-hidden mb-8 md:mb-16">
        <img src={IMAGES.hero} alt="Summer harvest" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3A5A40]/80 via-[#3A5A40]/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="px-5 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full">
            <p className="font-inter text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#DDB892] font-bold mb-2 md:mb-3">Summer 2026</p>
            <h2 className="font-playfair text-3xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[0.95]">
              They're <span className="italic">Back</span>
            </h2>
            <p className="font-inter text-xs md:text-base text-white/60 mt-3 md:mt-4 max-w-md leading-relaxed">
              Tree-ripened mangoes and fresh litchis from the heritage orchards of Bihar and Bengal.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-10">
        <div className="flex flex-wrap gap-3 md:gap-4">
          {["Dudhiya Malda", "Langra", "Bambai", "Chausa", "Dashehari", "Gulabkhas", "Kishen Bhog", "Shahi Litchi"].map((v) => (
            <span key={v} className="px-5 py-2 border border-[#3A5A40]/20 font-inter text-[12px] uppercase tracking-[0.1em] text-[#3A5A40] hover:bg-[#3A5A40] hover:text-white transition-all duration-300 cursor-default">{v}</span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {seasonHarvest.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 100} direction="up">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
        <FadeInSection>
          <div className="mt-12 text-center">
            <Link to="/mango-harvest" className="inline-flex items-center gap-3 font-inter text-[13px] font-semibold text-[#3A5A40] uppercase tracking-[0.08em] animated-underline group" data-testid="shop-season-harvest-btn">
              Shop Our Season Harvest <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── VILLAGE PANTRY ─── */
function VillagePantrySection() {
  const { featuredPantry } = useProducts();
  return (
    <section className="pt-0 pb-16 md:pb-24 bg-white" data-testid="village-pantry-section">
      <div className="relative h-[40vh] md:h-[55vh] min-h-[280px] overflow-hidden mb-8 md:mb-16">
        <img src={IMAGES.pantryHero} alt="Village pantry" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-[#1A1A1A]/80 via-[#1A1A1A]/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-end">
          <div className="px-5 md:px-10 lg:px-20 max-w-[1400px] mx-auto w-full text-right">
            <p className="font-inter text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-[#DDB892] font-bold mb-2 md:mb-3">Village Pantry</p>
            <h2 className="font-playfair text-3xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[0.95]">
              Made the<br /><span className="italic">Traditional</span> Way
            </h2>
            <p className="font-inter text-xs md:text-base text-white/60 mt-3 md:mt-4 max-w-md leading-relaxed ml-auto">
              Ghee, makhana, sattu, dals, and cold-pressed oils sourced directly from village kitchens.
            </p>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-10 flex gap-2 md:gap-3 flex-wrap z-10">
          {["A2 Ghee", "Makhana", "Sattu", "Dals", "Mustard Oil"].map((item) => (
            <span key={item} className="bg-white/90 backdrop-blur-sm text-[#1A1A1A] px-3 py-1.5 md:px-4 md:py-2 font-inter text-[9px] md:text-[11px] uppercase tracking-[0.1em] font-semibold">{item}</span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {featuredPantry.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 100} direction="up">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
        <FadeInSection>
          <div className="mt-12 text-center">
            <Link to="/village-pantry" className="inline-flex items-center gap-3 font-inter text-[13px] font-semibold text-[#3A5A40] uppercase tracking-[0.08em] animated-underline group" data-testid="view-all-pantry-btn">
              View All Pantry Essentials <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── FESTIVE FOODS ─── */
function FestiveFoodsSection() {
  const { festiveCollection } = useProducts();
  return (
    <section className="py-14 md:py-28 bg-[#DDB892]/10 px-5 md:px-10" data-testid="festive-section">
      <div className="max-w-[1400px] mx-auto">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40]">Heritage Foods</p>
          <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-[#1A1A1A] tracking-tight mt-3 leading-[1]">
            Festivals Taste Better<br />When They Come <span className="italic">From Home</span>
          </h2>
          <p className="font-inter text-xs md:text-sm text-[#4B5563] mt-4 md:mt-5 max-w-lg leading-relaxed">
            Prepared using recipes passed across generations in Bihar households. Available in 2 kg boxes.
          </p>
        </FadeInSection>
        <div className="mt-10 md:mt-14 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {festiveCollection.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 120} direction="scale">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
        <FadeInSection>
          <div className="mt-12 text-center">
            <Link to="/festive-collection" className="inline-flex items-center gap-3 font-inter text-[13px] font-semibold text-[#3A5A40] uppercase tracking-[0.08em] animated-underline group" data-testid="view-all-festive-btn">
              View Festive Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── BRAND STORY ─── */
function BrandStorySection() {
  return (
    <section className="py-14 md:py-28 bg-white" data-testid="brand-story-section">
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
          <FadeInSection className="md:col-span-7" direction="left">
            <div className="relative">
              <img src={IMAGES.farmer} alt="Indian farmer" className="w-full h-[300px] md:h-[600px] object-cover" />
              <div className="absolute -bottom-6 -right-4 md:-right-8 bg-[#3A5A40] text-white p-6 md:p-8 max-w-[220px] shadow-2xl">
                <p className="font-playfair text-4xl">50+</p>
                <p className="font-inter text-xs mt-1 text-white/70">Partner farms across India</p>
              </div>
            </div>
          </FadeInSection>
          <FadeInSection className="md:col-span-5" delay={200} direction="right">
            <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40]">Our Story</p>
            <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mt-3 leading-[1.1]">
              Why <span className="italic">Mitti Basket</span> Exists
            </h2>
            <div className="w-16 h-[2px] bg-[#DDB892] mt-6" />
            <p className="font-inter text-base text-[#4B5563] mt-6 leading-[1.8]">
              We started Mitti Basket to bring back the taste of food that once came directly from farms, villages, and family kitchens.
            </p>
            <p className="font-inter text-base text-[#4B5563] mt-4 leading-[1.8]">
              No warehouses. No artificial ripening. No shortcuts. Only seasonal harvests and honest ingredients.
            </p>
            <div className="mt-10 flex gap-10">
              <div>
                <p className="font-playfair text-3xl text-[#3A5A40]">100%</p>
                <p className="font-inter text-[11px] text-[#4B5563] mt-1 uppercase tracking-wider">Chemical Free</p>
              </div>
              <div>
                <p className="font-playfair text-3xl text-[#3A5A40]">0</p>
                <p className="font-inter text-[11px] text-[#4B5563] mt-1 uppercase tracking-wider">Middlemen</p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ─── HOW IT WORKS ─── */
function HowItWorksSection() {
  const steps = [
    { num: "01", title: "Harvested from\nTrusted Farms", desc: "Direct sourcing from Bihar, Bengal, and other heritage regions at the right season.", Icon: Leaf },
    { num: "02", title: "Packed in\nSmall Batches", desc: "No bulk warehousing. Each order prepared fresh to maintain quality.", Icon: Package },
    { num: "03", title: "Delivered Fresh\nto Your Home", desc: "Farm to doorstep in the shortest time. Currently serving Bangalore.", Icon: Truck },
  ];
  return (
    <section className="py-14 md:py-28 bg-[#3A5A40] relative overflow-hidden" data-testid="how-it-works-section">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 font-playfair text-[80px] md:text-[200px] text-white/[0.03] leading-none tracking-tighter select-none">Process</div>
      <div className="px-5 md:px-10 max-w-[1400px] mx-auto relative z-10">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#DDB892]">The Process</p>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white tracking-tight mt-3 leading-[1]">
            How Mitti Basket <span className="italic">Works</span>
          </h2>
        </FadeInSection>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
          {steps.map(({ num, title, desc, Icon }, idx) => (
            <FadeInSection key={num} delay={idx * 200} direction="up">
              <div className={`text-white relative ${idx < 2 ? "md:border-r md:border-white/10" : ""} md:px-10 first:md:pl-0 last:md:pr-0`}>
                <p className="font-playfair text-6xl md:text-7xl text-white/10">{num}</p>
                <Icon className="w-6 h-6 text-[#DDB892] mt-4" />
                <h3 className="font-playfair text-xl md:text-2xl mt-4 whitespace-pre-line leading-tight">{title}</h3>
                <p className="font-inter text-sm text-white/50 mt-4 leading-relaxed">{desc}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── COMPARISON TABLE ─── */
function ComparisonSection() {
  const features = [
    { feature: "Direct from Farms", mitti: true, grocery: false, online: false },
    { feature: "Chemical Free Processing", mitti: true, grocery: false, online: "Sometimes" },
    { feature: "Small Batch Only", mitti: true, grocery: false, online: false },
    { feature: "Seasonal Sourcing", mitti: true, grocery: false, online: false },
    { feature: "Traditional Methods", mitti: true, grocery: false, online: false },
    { feature: "Directly from Farmers", mitti: true, grocery: false, online: false },
  ];
  const CellIcon = ({ value }) => {
    if (value === true) return <Check className="w-5 h-5 text-[#3A5A40] mx-auto" />;
    if (value === false) return <X className="w-5 h-5 text-red-300 mx-auto" />;
    return <span className="font-inter text-xs text-[#4B5563]">{value}</span>;
  };
  return (
    <section className="py-14 md:py-28 px-5 md:px-10" data-testid="comparison-section">
      <div className="max-w-4xl mx-auto">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40] text-center">Why Choose Us</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mt-3 text-center leading-[1.1]">
            What Sets <span className="italic">Mitti Basket</span> Apart
          </h2>
        </FadeInSection>
        <FadeInSection delay={200}>
          <div className="mt-12 border border-[#3A5A40]/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#3A5A40] hover:bg-[#3A5A40]">
                  <TableHead className="text-white font-inter text-xs tracking-wider w-[200px]">Feature</TableHead>
                  <TableHead className="text-[#DDB892] font-inter text-xs tracking-wider text-center font-bold">Mitti Basket</TableHead>
                  <TableHead className="text-white/60 font-inter text-xs tracking-wider text-center">Regular Grocery</TableHead>
                  <TableHead className="text-white/60 font-inter text-xs tracking-wider text-center">Online Marketplace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((row, idx) => (
                  <TableRow key={idx} className="border-b border-[#3A5A40]/5 hover:bg-[#DDB892]/5">
                    <TableCell className="font-inter text-sm text-[#1A1A1A] font-medium">{row.feature}</TableCell>
                    <TableCell className="text-center bg-[#3A5A40]/[0.03]"><CellIcon value={row.mitti} /></TableCell>
                    <TableCell className="text-center"><CellIcon value={row.grocery} /></TableCell>
                    <TableCell className="text-center"><CellIcon value={row.online} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── SECRET GARDEN BOX CTA ─── */
function SecretGardenSection() {
  return (
    <section className="relative py-0 overflow-hidden" data-testid="secret-garden-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] md:min-h-[600px]">
        {/* Left: Image */}
        <div className="relative h-[350px] lg:h-auto overflow-hidden">
          <img
            src={IMAGES.secretGardenPath}
            alt="Secret Garden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A1A1A]/30 hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1A1A1A]/50 lg:hidden" />
        </div>

        {/* Right: Content */}
        <div className="bg-[#1A1A1A] flex items-center px-8 md:px-16 lg:px-20 py-14 md:py-20">
          <FadeInSection direction="right">
            <div className="max-w-lg">
              <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">
                Seasonal Curation
              </p>
              <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-white tracking-tight mt-4 leading-[1.05]">
                The Secret<br />
                Garden <span className="italic">Box</span>
              </h2>
              <div className="flex items-baseline gap-3 mt-5">
                <span className="font-playfair text-2xl md:text-3xl text-[#DDB892]">&#8377;2,599</span>
                <span className="font-inter text-xs text-white/30 line-through">&#8377;5,100+ value</span>
              </div>
              <p className="font-inter text-sm md:text-base text-white/50 mt-5 leading-relaxed">
                Seven handmade treasures. One seasonal mystery. Preserves, condiments,
                confections, and flavors you won't find anywhere else.
              </p>
              <Link
                to="/farm-basket-subscription"
                className="mt-8 inline-flex items-center gap-2 bg-[#DDB892] text-[#1A1A1A] px-8 py-3.5 md:px-10 md:py-4 font-inter font-semibold text-xs md:text-sm uppercase tracking-[0.06em] hover:bg-[#c9a67e] transition-all duration-300"
                data-testid="secret-garden-cta"
              >
                Unlock the Box <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

/* ─── AUTO-SCROLLING TESTIMONIALS ─── */
function TestimonialSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-14 md:py-28 px-5 md:px-10 overflow-hidden" data-testid="testimonial-section">
      <div className="max-w-4xl mx-auto text-center relative">
        <FadeInSection direction="scale">
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40] mb-8">What Our Customers Say</p>

          {/* Testimonial Carousel */}
          <div className="relative min-h-[200px] flex items-center justify-center">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                  idx === current
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8 pointer-events-none"
                }`}
              >
                <div className="decorative-quote relative">
                  <p className="font-playfair text-2xl md:text-4xl lg:text-5xl text-[#1A1A1A] italic leading-[1.2] tracking-tight max-w-3xl">
                    "{t.quote}"
                  </p>
                </div>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="w-8 h-[1px] bg-[#DDB892]" />
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#3A5A40]">{t.name}</p>
                    <p className="font-inter text-xs text-[#4B5563]">{t.city}</p>
                  </div>
                  <div className="w-8 h-[1px] bg-[#DDB892]" />
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-400 ${
                  idx === current
                    ? "w-6 h-[3px] bg-[#3A5A40]"
                    : "w-2.5 h-[3px] bg-[#3A5A40]/20 hover:bg-[#3A5A40]/40"
                }`}
                data-testid={`testimonial-dot-${idx}`}
              />
            ))}
          </div>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── SCARCITY ─── */
function ScarcitySection() {
  return (
    <section className="py-14 md:py-16 bg-[#1A1A1A]" data-testid="scarcity-section">
      <div className="px-6 md:px-10 max-w-4xl mx-auto text-center">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">Limited Supply</p>
          <h2 className="font-playfair text-2xl md:text-4xl text-white tracking-tight mt-4">
            We Deliver Only What's Harvested Fresh
          </h2>
          <p className="font-inter text-sm text-white/50 mt-4">Once a batch closes, ordering resumes next cycle.</p>
        </FadeInSection>
      </div>
    </section>
  );
}

/* ─── MAIN HOMEPAGE ─── */
export default function HomePage() {
  const marqueeQuotes = [
    "Seasonal harvests from India's heritage farms",
    "No warehouses — only honest ingredients",
    "Village kitchens to modern homes",
    "Chemical-free, small-batch, farm-fresh",
  ];

  const pressQuotes = [
    '"Bringing back the taste of real food" — Food Culture India',
    '"A new standard for farm-to-home" — The Better India',
    '"Heritage meets modern convenience" — YourStory',
  ];

  return (
    <main>
      <SEO path="/" />
      <HeroCarousel />
      {/* Delivery Launch Strip */}
      <section className="bg-[#1A1A1A] py-4 md:py-5 text-center" data-testid="delivery-notice">
        <div className="px-5 md:px-10 max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="font-inter text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#DDB892] font-bold">Deliveries begin 30th April</span>
          <span className="hidden sm:block w-[1px] h-4 bg-white/20" />
          <span className="font-inter text-[11px] md:text-[12px] text-white/50">Pre order today and be first in line when we go live</span>
        </div>
      </section>
      <TrustStripSection />
      <EditorialMarquee items={marqueeQuotes} speed={20} />
      <SeasonHarvestSection />
      <EditorialMarquee items={pressQuotes} speed={30} bgClass="bg-white" />
      <VillagePantrySection />
      <FestiveFoodsSection />
      <BrandStorySection />
      <HowItWorksSection />
      <SecretGardenSection />
      <TestimonialSection />
      <ScarcitySection />
    </main>
  );
}
