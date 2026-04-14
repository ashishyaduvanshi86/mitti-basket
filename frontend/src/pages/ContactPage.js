import { useState } from "react";
import { MapPin, Clock, Send, Mail, Phone } from "lucide-react";
import FadeInSection from "@/components/FadeInSection";
import SEO from "@/components/SEO";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState(null); // null | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API}/contact`, form);
      setStatus("sent");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="pt-[84px] md:pt-[116px]">
      <SEO title="Contact Us" description="Get in touch with Mitti Basket. We'd love to hear from you. Reach us at contact@mittibasket.com or +91 98803 92340." path="/contact" />
      <section className="bg-[#3A5A40] py-20 md:py-28" data-testid="contact-hero">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <FadeInSection>
            <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">
              Get In Touch
            </p>
            <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl text-white tracking-tighter mt-3 leading-[0.95]">
              We'd Love to<br />Hear From <span className="italic">You</span>
            </h1>
            <p className="font-inter text-base md:text-lg text-white/50 mt-6 max-w-xl leading-relaxed">
              Questions about our products, delivery, or sourcing? Reach out and we'll get back to you within a few hours.
            </p>
          </FadeInSection>
        </div>
      </section>

      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20">
          <FadeInSection className="md:col-span-5" direction="left">
            <div className="space-y-10">
              <div>
                <h2 className="font-playfair text-2xl md:text-3xl text-[#1A1A1A] tracking-tight">Reach Us Directly</h2>
                <div className="w-12 h-[2px] bg-[#DDB892] mt-4" />
              </div>
              <div className="space-y-8">
                <a href="mailto:contact@mittibasket.com" className="flex items-start gap-4 group" data-testid="contact-email">
                  <div className="w-12 h-12 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0 group-hover:bg-[#3A5A40]/10 transition-colors">
                    <Mail className="w-5 h-5 text-[#3A5A40]" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#1A1A1A]">Email</p>
                    <p className="font-inter text-sm text-[#4B5563] mt-0.5">contact@mittibasket.com</p>
                  </div>
                </a>
                <div className="flex items-start gap-4" data-testid="contact-phone">
                  <div className="w-12 h-12 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#3A5A40]" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#1A1A1A]">Phone</p>
                    <p className="font-inter text-sm text-[#4B5563] mt-0.5">+91 98803 92340</p>
                  </div>
                </div>
                <div className="flex items-start gap-4" data-testid="contact-location">
                  <div className="w-12 h-12 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#3A5A40]" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#1A1A1A]">Delivery Area</p>
                    <p className="font-inter text-sm text-[#4B5563] mt-0.5">Currently delivering across Bangalore</p>
                  </div>
                </div>
                <div className="flex items-start gap-4" data-testid="contact-hours">
                  <div className="w-12 h-12 bg-[#3A5A40]/5 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#3A5A40]" />
                  </div>
                  <div>
                    <p className="font-inter text-sm font-semibold text-[#1A1A1A]">Response Time</p>
                    <p className="font-inter text-sm text-[#4B5563] mt-0.5">We typically respond within 2-3 hours</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection className="md:col-span-7" delay={200} direction="right">
            <div className="bg-[#F0EDE8] p-8 md:p-12">
              <h3 className="font-playfair text-2xl md:text-3xl text-[#1A1A1A] tracking-tight">Send Us a Message</h3>
              <p className="font-inter text-sm text-[#4B5563] mt-2">We'll get back to you via email.</p>

              {status === "sent" ? (
                <div className="mt-8 py-10 text-center" data-testid="contact-success">
                  <div className="w-14 h-14 bg-[#3A5A40]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-[#3A5A40]" />
                  </div>
                  <p className="font-playfair text-xl text-[#1A1A1A]">Message Sent!</p>
                  <p className="font-inter text-sm text-[#4B5563] mt-2">We'll reply to your email shortly.</p>
                  <button
                    onClick={() => setStatus(null)}
                    className="mt-6 font-inter text-sm text-[#3A5A40] font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-5" data-testid="contact-form">
                  <div>
                    <label className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Name *</label>
                    <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full mt-2 bg-white border border-[#3A5A40]/10 px-4 py-3 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                      placeholder="Your name" data-testid="contact-name-input" />
                  </div>
                  <div>
                    <label className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Email *</label>
                    <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full mt-2 bg-white border border-[#3A5A40]/10 px-4 py-3 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                      placeholder="your@email.com" data-testid="contact-email-input" />
                  </div>
                  <div>
                    <label className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Phone *</label>
                    <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full mt-2 bg-white border border-[#3A5A40]/10 px-4 py-3 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors"
                      placeholder="10-digit phone number" data-testid="contact-phone-input" />
                  </div>
                  <div>
                    <label className="font-inter text-[11px] uppercase tracking-[0.15em] text-[#4B5563] font-medium">Message *</label>
                    <textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full mt-2 bg-white border border-[#3A5A40]/10 px-4 py-3 font-inter text-sm text-[#1A1A1A] focus:outline-none focus:border-[#3A5A40]/30 transition-colors resize-none"
                      placeholder="Tell us how we can help..." data-testid="contact-message-input" />
                  </div>
                  {status === "error" && (
                    <p className="font-inter text-xs text-red-500">Something went wrong. Please try again.</p>
                  )}
                  <button type="submit" disabled={status === "sending"}
                    className="w-full bg-[#3A5A40] text-white py-3.5 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="contact-submit-btn"
                  >
                    <Send className="w-4 h-4" />
                    {status === "sending" ? "Sending..." : "Submit"}
                  </button>
                </form>
              )}
            </div>
          </FadeInSection>
        </div>
      </section>
    </main>
  );
}
