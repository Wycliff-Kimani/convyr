"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function HeroSection() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Navbar — outside section so sticky works across entire page */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 h-16 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-light.png"
            alt="Convyr"
            width={240}
            height={80}
            style={{ width: "auto", height: "32px" }}
            className="object-contain sm:!h-[36px]"
            priority
          />
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
          <Link
            href="/pricing"
            className="hover:text-[#075E54] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            className="hover:text-[#075E54] transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hover:text-[#075E54] transition-colors"
          >
            Contact
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-[#075E54] transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2 rounded-lg transition-colors font-medium"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-xl flex flex-col px-4 py-6 gap-6 h-[calc(100vh-64px)] overflow-y-auto">
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-700">Pricing</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-700">About</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-700">Contact</Link>
          <hr className="border-gray-100" />
          <Link href="/login" onClick={() => setIsMenuOpen(false)} className="text-base font-medium text-gray-700">Log in</Link>
          <Link href="/register" onClick={() => setIsMenuOpen(false)} className="text-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-lg transition-colors font-medium">Get Started for Free</Link>
        </div>
      )}

      {/* Hero */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20 mt-[-64px]">
        <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-[10px] sm:text-xs font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-green-100 whitespace-nowrap">
          <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full shrink-0"></span>
          Built for African Businesses
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#0F172A] max-w-3xl leading-[1.15] mb-5 sm:mb-6 tracking-tight px-2">
          Automate Your WhatsApp.
          <br className="hidden sm:block" />
          <span className="text-[#25D366] block sm:inline mt-1 sm:mt-0">Grow Your Business.</span>
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
        <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-10 mt-16 sm:mt-20 text-center w-full max-w-lg mx-auto">
          <div className="w-full sm:w-auto">
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              5 min
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Setup time
            </p>
          </div>
          <div className="w-16 h-px sm:w-px sm:h-8 bg-gray-200 my-2 sm:my-0"></div>
          <div className="w-full sm:w-auto">
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              24/7
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Automated replies
            </p>
          </div>
          <div className="w-16 h-px sm:w-px sm:h-8 bg-gray-200 my-2 sm:my-0"></div>
          <div className="w-full sm:w-auto">
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              M-Pesa
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Ready out of the box
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
