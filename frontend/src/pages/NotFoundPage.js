import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SEO from "@/components/SEO";

export default function NotFoundPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <div className="text-center max-w-md">
        <p className="font-inter text-[10px] uppercase tracking-[0.3em] text-[#DDB892] font-bold">404</p>
        <h1 className="font-playfair text-4xl sm:text-5xl text-[#1A1A1A] tracking-tight mt-3 leading-[1.1]">
          Page Not <span className="italic">Found</span>
        </h1>
        <p className="font-inter text-sm text-[#6B6B60] mt-4 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back to something fresh.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 mt-8 bg-[#3A5A40] text-white px-6 py-3 font-inter font-semibold text-[12px] uppercase tracking-[0.1em] hover:bg-[#2c4430] transition-colors"
          data-testid="404-home-btn">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </main>
  );
}
