import FadeInSection from "@/components/FadeInSection";

const sections = [
  { title: "Overview", content: "Mitti Basket values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit our website or place an order." },
  { title: "Information We Collect", content: "We may collect the following information when you use our website or place an order:", list: ["Name", "Phone number", "Email address", "Delivery address", "Pincode", "Order details"], after: "This information is collected when you fill forms on our website or place an order." },
  { title: "How We Use Your Information", content: "We use your information to:", list: ["Process and manage your orders", "Communicate order updates and delivery details", "Provide customer support", "Improve our products and services", "Send important updates related to your orders"], after: "We do not sell or rent your personal information to third parties." },
  { title: "Data Sharing", content: "We may share your information only with:", list: ["Delivery partners for order fulfillment", "Payment service providers for secure transactions", "Service tools (such as Google Sheets) required to process orders"], after: "All third-party services are used only to support operations." },
  { title: "Data Security", content: "We take reasonable measures to protect your personal information from unauthorized access, misuse, or disclosure.\n\nHowever, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security." },
  { title: "Cookies", content: "Our website may use basic cookies to enhance user experience and improve website functionality." },
  { title: "Your Rights", content: "You have the right to:", list: ["Request access to your personal data", "Request correction or deletion of your data"], after: "You can contact us for any such requests." },
  { title: "Third-Party Links", content: "Our website may contain links to third-party platforms (such as payment providers). We are not responsible for their privacy practices." },
  { title: "Changes to Policy", content: "We may update this Privacy Policy from time to time. Continued use of the website indicates acceptance of any updates." },
  { title: "Contact", content: "For any privacy-related questions, contact us at:", email: "contact@mittibasket.com" },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="pt-[84px] md:pt-[116px]" data-testid="privacy-policy-page">
      <section className="bg-[#3A5A40] py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">Legal</p>
            <h1 className="font-playfair text-4xl sm:text-5xl text-white tracking-tighter mt-3 leading-[0.95]">
              Privacy <span className="italic">Policy</span>
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
              <p className="font-inter text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">{s.content}</p>
              {s.list && (
                <ul className="mt-3 space-y-2">
                  {s.list.map((item, j) => (
                    <li key={j} className="font-inter text-sm text-[#4B5563] flex items-start gap-2">
                      <span className="text-[#DDB892] mt-1.5 text-[6px]">&#9670;</span> {item}
                    </li>
                  ))}
                </ul>
              )}
              {s.after && <p className="font-inter text-sm text-[#4B5563] leading-relaxed mt-3">{s.after}</p>}
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
