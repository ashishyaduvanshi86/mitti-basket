import FadeInSection from "@/components/FadeInSection";

const sections = [
  { title: "Overview", content: "This website is operated by Mitti Basket. By visiting our website or placing an order, you agree to the terms and conditions described below. These Terms apply to all users of the site including customers, browsers, and contributors of information." },
  { title: "Products & Availability", content: "Mitti Basket offers seasonal fruits, village-made pantry essentials, and traditional festive foods sourced directly from farms and small producers. Many products are seasonal and available in limited quantities. Availability may change without prior notice." },
  { title: "Pricing", content: "All prices listed on the website are subject to change without notice. We reserve the right to modify or discontinue any product at any time." },
  { title: "Order Confirmation", content: "Orders placed through the website are confirmed only after availability verification and payment confirmation (where applicable). Mitti Basket reserves the right to cancel or limit any order if required." },
  { title: "Delivery", content: "Delivery timelines are estimates and may vary depending on product type, location, and seasonal sourcing conditions. We are not responsible for delays caused by logistics partners, weather, or harvest variations." },
  { title: "Payments", content: "Payments may be collected through secure third-party payment providers such as Razorpay. Customers agree to provide accurate billing and contact details." },
  { title: "Returns & Refunds", content: "Due to the perishable nature of many products (such as fruits and fresh items), returns may not be accepted unless items arrive damaged or incorrect. In such cases, customers should contact us within 24 hours of delivery for resolution." },
  { title: "User Responsibilities", content: "Users agree not to misuse the website, submit false information, or engage in unlawful activity while using our services." },
  { title: "Intellectual Property", content: "All content on this website including text, images, and branding belongs to Mitti Basket and may not be copied or reused without permission." },
  { title: "Limitation of Liability", content: "Mitti Basket shall not be liable for any indirect or incidental damages arising from the use of our products or website services beyond the value of the order placed." },
  { title: "Changes to Terms", content: "We reserve the right to update these Terms at any time. Continued use of the website indicates acceptance of any changes." },
  { title: "Contact", content: "For questions regarding these Terms, please contact:", email: "contact@mittibasket.com" },
];

export default function TermsPage() {
  return (
    <main className="pt-[84px] md:pt-[116px]" data-testid="terms-page">
      <section className="bg-[#3A5A40] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">Legal</p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white tracking-tighter mt-3 leading-[0.95]">
              Terms & <span className="italic">Conditions</span>
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
              <p className="font-inter text-sm text-[#4B5563] leading-relaxed">{s.content}</p>
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
