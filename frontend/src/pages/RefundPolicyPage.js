import FadeInSection from "@/components/FadeInSection";

const policies = [
  {
    title: "Refund & Cancellation Overview",
    content: "Once an order is confirmed, Mitti Basket will not accept return or refund requests. However, in any of the below situations, we are more than happy to work with our patrons to find an amicable solution that is fair to all parties.",
  },
  {
    title: "In Case of Damaged Product",
    items: [
      "We will be happy to re-send and replace the product and it will take 7 to 10 days.",
      "Mitti Basket needs to be notified of damaged product within 2 days from delivery date via email to contact@mittibasket.com.",
      "In the email, order number, image of invoice, 1 outer box image, 2 clear images & we also need unboxing videos of damaged products to be sent.",
      "In case of multiple item shipments, only the affected product can be returned and replaced.",
      "We will be happy to re-send and replace the product(s) promptly and we will work with you on providing an amicable solution.",
      "Email will be responded to within 24-48 hrs and full assistance will be provided thereafter.",
    ],
  },
  {
    title: "In Case of Missing Product",
    items: [
      "Mitti Basket needs to be notified of missing product within 2 days from delivery date via email to contact@mittibasket.com.",
      "In the email, order number, image of the invoice, 1 outer box image, 2 clear images of the opened box & unboxing video with all items received to be sent.",
      "We will be unable to accept a refund request. But, we will be happy to promptly re-send the missing product.",
      "Email will be responded to within 24-48 hrs and full assistance will be provided thereafter.",
    ],
  },
  {
    title: "In Case of Spoiled Product",
    items: [
      "Mitti Basket needs to be notified of spoilage of product within 2 days from delivery date via email to contact@mittibasket.com.",
      "In the email, order number, date of packaging/date of manufacture, clear images or video of the product to be shared.",
      "We will be unable to accept returns due to variance in taste, texture, colour or aroma. This is because our products are completely natural and made mostly by hand so no two batches will be identical. No compromise is made in the natural production process, use of best and natural ingredients and we will ensure that maximum nutritional value is retained.",
      "We will work with you on providing an amicable solution.",
      "Product will be replaced after due investigation and diligence and we assure a fair outcome at all times.",
      "Email will be responded to within 24-48 hrs, and full assistance will be provided thereafter.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="pt-[84px] md:pt-[116px]" data-testid="refund-policy-page">
      <section className="bg-[#3A5A40] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">Legal</p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white tracking-tighter mt-3 leading-[0.95]">
              Refund & Cancellation <span className="italic">Policy</span>
            </h1>
          </FadeInSection>
        </div>
      </section>
      <section className="py-12 md:py-20 px-6 md:px-12 max-w-3xl mx-auto">
        {policies.map((s, i) => (
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
            </div>
          </FadeInSection>
        ))}
      </section>
    </main>
  );
}
