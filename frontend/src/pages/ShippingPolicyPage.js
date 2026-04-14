import FadeInSection from "@/components/FadeInSection";

const sections = [
  {
    title: "Shipping Overview",
    content: "Please note that the free shipping policy will apply only if specified so as part of promotional campaigns or special offers.",
  },
  {
    title: "Address Requirements",
    content: "A complete postal address including pin code, email id and contact number is essential to help us ship your order. Kindly cross-check your pin-code and contact number before you complete your order.",
  },
  {
    title: "Dispatch Timeline",
    items: [
      "If the ordered item is in stock, it will be packed and dispatched from our warehouse within 3 working days.",
      "However if some of the ordered items are not in stock, then we will get them produced and have them dispatched within 10 working days of the order being placed. We will keep you informed under such circumstances.",
    ],
  },
  {
    title: "Delivery Schedule",
    content: "Our courier partners will be able to deliver the shipment to you between Monday to Saturday: 9am to 7pm. Working days exclude public holidays and Sundays. Delivery time is subject to factors beyond our control including unexpected travel delays from our courier partners and transporters due to weather conditions and strikes.",
  },
  {
    title: "Order Tracking",
    content: "As soon as your package is dispatched, we will email you your order tracking details. Kindly bear with us until then.",
  },
  {
    title: "Contact",
    content: "For any further clarifications, please contact us at:",
    email: "contact@mittibasket.com",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="pt-[84px] md:pt-[116px]" data-testid="shipping-policy-page">
      <section className="bg-[#3A5A40] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">Legal</p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white tracking-tighter mt-3 leading-[0.95]">
              Shipping & <span className="italic">Delivery</span>
            </h1>
          </FadeInSection>
        </div>
      </section>
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-3xl mx-auto">
        {sections.map((s, i) => (
          <FadeInSection key={i} delay={i * 50}>
            <div className="mb-10 md:mb-14">
              <h2 className="font-playfair text-xl md:text-2xl text-[#1A1A1A] tracking-tight">{s.title}</h2>
              <div className="w-8 h-[2px] bg-[#DDB892] mt-3 mb-4" />
              {s.content && <p className="font-inter text-sm text-[#4B5563] leading-relaxed">{s.content}</p>}
              {s.items && (
                <ul className="space-y-3 mt-2">
                  {s.items.map((item, j) => (
                    <li key={j} className="font-inter text-sm text-[#4B5563] leading-relaxed flex items-start gap-2.5">
                      <span className="text-[#DDB892] mt-1.5 text-[6px] flex-shrink-0">&#9670;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="font-inter text-sm text-[#3A5A40] font-medium hover:underline mt-2 inline-block">{s.email}</a>
              )}
            </div>
          </FadeInSection>
        ))}
      </section>
    </main>
  );
}
