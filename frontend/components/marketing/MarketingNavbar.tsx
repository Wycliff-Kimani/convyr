"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function MarketingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
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
          <Link href="/" className="hover:text-[#075E54] transition-colors">
            Home
          </Link>
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
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-medium text-gray-700"
          >
            Home
          </Link>
          <Link
            href="/pricing"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-medium text-gray-700"
          >
            Pricing
          </Link>
          <Link
            href="/about"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-medium text-gray-700"
          >
            About
          </Link>
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-medium text-gray-700"
          >
            Contact
          </Link>
          <hr className="border-gray-100" />
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="text-base font-medium text-gray-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            onClick={() => setIsMenuOpen(false)}
            className="text-center w-full bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-lg transition-colors font-medium"
          >
            Get Started for Free
          </Link>
        </div>
      )}
    </>
  );
}
