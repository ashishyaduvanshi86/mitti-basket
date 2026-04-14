import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function WaitlistForm({ type = "subscription", dark = false, className = "" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/waitlist`, {
        email,
        name: name || undefined,
        waitlist_type: type,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`flex items-center gap-3 p-6 ${
          dark ? "bg-white/10" : "bg-[#3A5A40]/10"
        } ${className}`}
        data-testid="waitlist-success"
      >
        <CheckCircle className={`w-5 h-5 flex-shrink-0 ${dark ? "text-[#DDB892]" : "text-[#3A5A40]"}`} />
        <p className={`font-inter text-sm ${dark ? "text-white" : "text-[#3A5A40]"}`}>
          You're on the list! We'll reach out soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row gap-3 ${className}`}
      data-testid="waitlist-form"
    >
      <Input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-white border-[#3A5A40]/20 font-inter h-12 rounded-none focus-visible:ring-[#3A5A40]"
        data-testid="waitlist-name-input"
      />
      <Input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="bg-white border-[#3A5A40]/20 font-inter h-12 rounded-none focus-visible:ring-[#3A5A40]"
        data-testid="waitlist-email-input"
      />
      <button
        type="submit"
        disabled={loading}
        className={`px-8 py-3 h-12 font-inter font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap ${
          dark
            ? "bg-[#DDB892] text-[#1A1A1A] hover:bg-[#c9a67e]"
            : "bg-[#3A5A40] text-white hover:bg-[#2c4430]"
        }`}
        data-testid="waitlist-submit-btn"
      >
        {loading ? "Joining..." : "Join Waitlist"}
      </button>
    </form>
  );
}
