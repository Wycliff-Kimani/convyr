"use client";

import Link from "next/link";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";

export default function HeroSection() {
  return (
    <>
      <MarketingNavbar />

      {/* Hero */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20 mt-[-64px]">
        <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-[10px] sm:text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-green-100 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full shrink-0"></span>
          Built for African Businesses
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0F172A] max-w-3xl leading-[1.15] mb-5 sm:mb-6 tracking-tight px-2">
          Automate Your WhatsApp.
          <br className="hidden sm:block" />
          <span className="text-[#25D366] block sm:inline mt-1 sm:mt-0">
            Grow Your Business.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mb-8 sm:mb-10 leading-relaxed px-4">
          Stop losing customers to slow replies. Set up in 5 minutes and let
          Convyr handle your WhatsApp 24/7.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full px-6 sm:px-0">
          <Link
            href="/register"
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3.5 sm:py-3 rounded-lg text-base sm:text-sm font-semibold transition-colors flex items-center justify-center min-h-[44px]"
          >
            Start for Free
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto text-base sm:text-sm text-[#075E54] hover:underline font-medium py-3 flex items-center justify-center min-h-[44px]"
          >
            View Pricing →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-row items-center justify-center gap-0 mt-16 sm:mt-20 w-full max-w-xl mx-auto bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 border-r border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              5 min
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide text-center">
              Setup time
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 border-r border-gray-100">
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight">
              24/7
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide text-center">
              Auto replies
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-5 px-4">
            <p className="text-2xl sm:text-3xl font-bold text-[#25D366] tracking-tight">
              M-Pesa
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide text-center">
              Ready out of the box
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
