import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShoppingBag, Check, Lock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ProductCard } from "@/components/ProductCard";
import FadeInSection from "@/components/FadeInSection";
import { useCart } from "@/context/CartContext";
import { IMAGES } from "@/data/products";
import { useProducts } from "@/context/ProductContext";
import SEO from "@/components/SEO";

const faqs = [
  { q: "What's inside the Secret Garden Box?", a: "Each season brings a different curation of seven handmade pantry creations — preserves, condiments, confections, and experimental recipes. The contents are intentionally kept a surprise." },
  { q: "How is the Secret Garden Box different from regular orders?", a: "The Secret Garden Box is a specially curated collection of seven handmade pantry treasures that you won't find individually on our store. Each box is themed around the season and includes experimental recipes, rare preserves, and limited-edition creations." },
  { q: "Can I gift the Secret Garden Box to someone?", a: "Absolutely! The Secret Garden Box makes a perfect gift. Simply enter the recipient's delivery address during checkout. Each box arrives beautifully packed, ready to delight." },
  { q: "What areas do you deliver to?", a: "Currently delivering in Bangalore. We plan to expand to Hyderabad, Chennai, and Mumbai soon." },
  { q: "What's the value of the box contents?", a: "Each box contains over Rs.5,100 worth of products, curated and packed exclusively for subscribers and one-time buyers." },
];

function SecretGardenHero() {
  const { items, addToCart } = useCart();
  const { secretGardenBox } = useProducts();
  const inCart = items.some((i) => i.id === secretGardenBox.id);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(secretGardenBox, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <section className="relative" data-testid="secret-garden-hero">
      {/* Full-width dark bg with botanical image */}
      <div className="relative min-h-[90vh] md:min-h-[85vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={IMAGES.secretGardenPath}
            alt="Secret Garden"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#1A1A1A]/75" />
        </div>

        <div className="relative z-10 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto w-full py-16">
          <Link to="/" className="inline-flex items-center gap-2 font-inter text-sm text-white/40 hover:text-white mb-10 transition-colors" data-testid="subscription-back-home-btn">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Content */}
            <div>
              <FadeInSection direction="left">
                <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">
                  Seasonal Curation
                </p>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white tracking-tighter leading-[0.9] mt-4">
                  The Secret<br />
                  Garden <span className="italic">Box</span>
                </h1>
                <div className="flex items-baseline gap-4 mt-6">
                  <span className="font-playfair text-3xl md:text-4xl text-[#DDB892]">&#8377;2,599</span>
                  <span className="font-inter text-sm text-white/30">
                    <span className="line-through">&#8377;5,100+</span> value
                  </span>
                </div>
                <p className="font-inter text-sm md:text-base text-white/50 mt-6 leading-relaxed max-w-lg">
                  Each season, the garden reveals something new. Unexpected flavors, fleeting
                  harvests, and ideas we can't wait to bring into the kitchen.
                </p>
                <p className="font-inter text-sm md:text-base text-white/50 mt-4 leading-relaxed max-w-lg">
                  The Secret Garden Box is our way of sharing those discoveries. Inside, you'll
                  find seven small-batch pantry creations, each one handmade in limited quantities
                  and inspired by what's growing.
                </p>
              </FadeInSection>
            </div>

            {/* Right: Product Card / Purchase Options */}
            <div>
              <FadeInSection direction="right" delay={200}>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10">
                  {/* Image */}
                  <div className="relative h-[240px] md:h-[280px] overflow-hidden mb-8">
                    <img
                      src="https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/djkihpsx_Gemini_Generated_Image_re3u47re3u47re3u.png"
                      alt="Secret Garden Box Contents"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.1em] bg-[#DDB892] text-[#1A1A1A]">
                        <Lock className="w-3 h-3" /> Exclusive
                      </span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div className="flex items-center justify-between py-3 border-t border-white/10 mb-6">
                    <span className="font-inter text-[11px] uppercase tracking-[0.1em] text-white/40">
                      Total
                    </span>
                    <span className="font-playfair text-2xl text-white">&#8377;2,599</span>
                  </div>

                  {/* CTA */}
                  {justAdded ? (
                    <div className="w-full bg-[#3A5A40] text-white py-4 flex items-center justify-center gap-2 font-inter font-semibold text-[12px] uppercase tracking-[0.08em]">
                      <Check className="w-4 h-4" /> Added to Basket!
                    </div>
                  ) : inCart ? (
                    <div className="w-full bg-[#3A5A40] text-white py-4 flex items-center justify-center gap-2 font-inter font-semibold text-[12px] uppercase tracking-[0.08em]">
                      <Check className="w-4 h-4" /> In Your Basket
                    </div>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-[#DDB892] text-[#1A1A1A] py-4 flex items-center justify-center gap-2 font-inter font-semibold text-[12px] uppercase tracking-[0.08em] hover:bg-[#c9a67e] transition-colors"
                      data-testid="secret-garden-add-to-cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Basket
                    </button>
                  )}
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecretGardenStory() {
  return (
    <section className="bg-[#FAF7F2]" data-testid="secret-garden-story">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Dark story text */}
        <div className="bg-[#1A1A1A] flex items-center px-8 md:px-16 lg:px-20 py-16 md:py-24 order-2 lg:order-1">
          <FadeInSection direction="left">
            <div className="max-w-lg">
              <div className="w-10 h-[2px] bg-[#DDB892] mb-8" />
              <p className="font-playfair text-xl md:text-2xl text-white/80 leading-relaxed italic">
                "Expect a collection of sweet, savory, and everything in between."
              </p>
              <p className="font-inter text-sm text-white/40 mt-8 leading-relaxed">
                From preserves and condiments to confections and experimental recipes
                we've been quietly perfecting. Every item reflects our commitment to slow
                production, thoughtful sourcing, and the people who make it all possible.
              </p>
              <p className="font-inter text-sm text-white/40 mt-4 leading-relaxed">
                This is a box for the curious. For those who like to taste first, ask
                questions later. For those who understand that the best things are often
                the hardest to find.
              </p>
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="font-playfair text-lg text-[#DDB892] italic">
                  Seven treasures. One seasonal mystery.<br />
                  Unlock the Secret Garden.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>

        {/* Right: Botanical image */}
        <div className="relative h-[350px] lg:h-auto overflow-hidden order-1 lg:order-2">
          <img
            src="https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/0mtinto1_Gemini_Generated_Image_5ewl9c5ewl9c5ewl.png"
            alt="Botanical arrangement"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

export default function SubscriptionPage() {
  const { villagePantry } = useProducts();
  return (
    <main className="pt-[84px] md:pt-[116px]">
      <SEO title="The Secret Garden Box" description="Seven handmade pantry treasures curated each season. Limited edition, small-batch creations from Mitti Basket. Rs.2,599." path="/farm-basket-subscription" breadcrumbs={[{ name: "Home", path: "/" }, { name: "Secret Garden Box", path: "/farm-basket-subscription" }]} />
      <SecretGardenHero />
      <SecretGardenStory />

      {/* What's Inside Indicators */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40] text-center">
            Inside Every Box
          </p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mt-3 leading-[1.1] text-center">
            What to <span className="italic">Expect</span>
          </h2>
        </FadeInSection>
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { num: "7", label: "Handmade Items", sub: "Small-batch creations" },
            { num: "Rs.5,100+", label: "Actual Value", sub: "Yours for Rs.2,599" },
            { num: "3 mo", label: "New Basket", sub: "Every 3 months" },
            { num: "0", label: "Repeats", sub: "Every box is different" },
          ].map((item, idx) => (
            <FadeInSection key={item.label} delay={idx * 100} direction="up">
              <div className="border border-[#3A5A40]/10 p-6 md:p-8 text-center hover:border-[#DDB892] transition-colors duration-500">
                <p className="font-playfair text-2xl md:text-3xl text-[#3A5A40]">{item.num}</p>
                <p className="font-inter text-xs font-semibold text-[#1A1A1A] mt-2 uppercase tracking-[0.1em]">{item.label}</p>
                <p className="font-inter text-[11px] text-[#4B5563] mt-1">{item.sub}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* Also Available: Subscribable Pantry */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 max-w-[1400px] mx-auto bg-[#DDB892]/5" data-testid="subscription-products">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40]">Also Available</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight mt-3 leading-[1.1]">
            Village Pantry <span className="italic">Essentials</span>
          </h2>
          <p className="font-inter text-sm text-[#4B5563] mt-3">
            Browse individual products or add them to your cart alongside the Secret Garden Box.
          </p>
        </FadeInSection>
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {villagePantry.map((product, idx) => (
            <FadeInSection key={product.id} delay={idx * 80} direction="up">
              <ProductCard product={product} />
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-24 max-w-3xl mx-auto">
        <FadeInSection>
          <p className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold text-[#3A5A40] text-center">Questions</p>
          <h2 className="font-playfair text-3xl md:text-4xl lg:text-5xl text-[#1A1A1A] tracking-tight text-center mt-3" data-testid="faq-heading">
            Frequently <span className="italic">Asked</span>
          </h2>
        </FadeInSection>
        <FadeInSection delay={200}>
          <Accordion type="single" collapsible className="mt-12">
            {faqs.map(({ q, a }, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-b border-[#3A5A40]/10" data-testid={`faq-item-${idx}`}>
                <AccordionTrigger className="font-playfair text-lg text-[#1A1A1A] hover:text-[#3A5A40] py-6 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="font-inter text-sm text-[#4B5563] leading-relaxed pb-6">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </FadeInSection>
      </section>
    </main>
  );
}
