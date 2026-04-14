import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import FadeInSection from "@/components/FadeInSection";
import { IMAGES } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import SEO from "@/components/SEO";

export default function FestiveCollectionPage() {
  const { festiveCollection } = useProducts();
  return (
    <main className="pt-[84px] md:pt-[116px]">
      <SEO title="Festive Collection" description="Thekua, Tilkut, Khajur Sweets — traditional Bihar festive delicacies made with pure ghee and heritage recipes." path="/festive-collection" products={festiveCollection} breadcrumbs={[{ name: "Home", path: "/" }, { name: "Festive Collection", path: "/festive-collection" }]} />
      {/* Hero */}
      <section className="relative h-[55vh] min-h-[350px] md:min-h-[450px] flex items-end overflow-hidden" data-testid="festive-hero">
        <div className="absolute inset-0">
          <img src={IMAGES.festiveHero} alt="Festive foods" className="w-full h-full object-cover hero-zoom" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </div>
        <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pb-16 md:pb-20 w-full">
          <Link to="/" className="inline-flex items-center gap-2 font-inter text-sm text-white/60 hover:text-white mb-8 transition-colors" data-testid="festive-back-home-btn">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] mb-3">India's Heritage</p>
          <h1 className="font-playfair text-5xl sm:text-6xl lg:text-7xl text-white tracking-tighter leading-[0.9]">
            Heritage<br /><span className="italic">Festive</span> Foods
          </h1>
          <p className="font-inter text-base md:text-lg text-white/60 mt-6 max-w-xl">
            Authentic festive foods prepared in Bihar households using traditional recipes and seasonal ingredients.
          </p>
        </div>
      </section>

      {/* Heritage Quote */}
      <section className="py-20 md:py-24 bg-[#DDB892]/10 border-y border-[#DDB892]/20">
        <div className="px-6 md:px-12 lg:px-24 max-w-3xl mx-auto text-center">
          <FadeInSection direction="scale">
            <div className="decorative-quote relative">
              <p className="font-playfair text-2xl md:text-4xl text-[#1A1A1A] italic leading-relaxed">
                Every bite carries the warmth of a Bihar kitchen and the love of generations.
              </p>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Products */}
      <section className="py-24 md:py-36 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto" data-testid="festive-products">
        <FadeInSection>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight">
            Festive <span className="italic">Collection</span>
          </h2>
          <p className="font-inter text-sm text-[#4B5563] mt-3 max-w-lg">
            Prepared using recipes passed across generations in Bihar households. Available in 2 kg boxes.
          </p>
        </FadeInSection>
        <div className="mt-12 md:mt-14 grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-8">
          {festiveCollection.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 150} direction="scale">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Bihar Heritage */}
      <section className="py-16 md:py-36 bg-[#3A5A40]">
        <div className="px-5 md:px-12 lg:px-24 max-w-4xl mx-auto text-center">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#DDB892]">Our Heritage</p>
            <h2 className="font-playfair text-2xl md:text-4xl lg:text-5xl text-white tracking-tight mt-3 leading-[1.1]">
              Rooted in India's<br /><span className="italic">Food Culture</span>
            </h2>
            <div className="w-16 h-[2px] bg-[#DDB892] mx-auto mt-6" />
            <p className="font-inter text-sm md:text-base text-white/60 mt-6 md:mt-8 leading-[1.8] max-w-2xl mx-auto">
              Bihar's food traditions are among the oldest in India. From the sacred Thekua of Chhath Puja to the sesame-rich Tilkut of Gaya, every sweet tells a story of harvest celebrations, family gatherings, and seasonal rhythms that have defined this land for centuries.
            </p>
          </FadeInSection>
        </div>
      </section>
    </main>
  );
}
