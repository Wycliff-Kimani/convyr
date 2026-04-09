import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <>
      {/* Navbar — outside section so sticky works across entire page */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-16 border-b border-gray-100 bg-white">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo-light.png"
            alt="Convyr"
            width={240}
            height={80}
            style={{ width: "auto", height: "36px" }}
            className="object-contain"
            priority
          />
        </Link>
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
        <div className="flex items-center gap-4">
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
      </nav>

      {/* Hero */}
      <section className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-xs font-medium px-4 py-2 rounded-full mb-8 border border-green-100">
          <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
          Built for African Businesses
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] max-w-3xl leading-[1.1] mb-6 tracking-tight">
          Automate Your WhatsApp.
          <br />
          <span className="text-[#25D366]">Grow Your Business.</span>
        </h1>
        <p className="text-base text-gray-400 max-w-lg mb-10 leading-relaxed">
          Stop losing customers to slow replies. Set up in 5 minutes and let
          Convyr handle your WhatsApp 24/7.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/register"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Start for Free
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-[#075E54] hover:underline font-medium"
          >
            View Pricing →
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-col sm:flex-row items-center gap-10 mt-20 text-center">
          <div>
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              5 min
            </p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Setup time
            </p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
          <div>
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              24/7
            </p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Automated replies
            </p>
          </div>
          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
          <div>
            <p className="text-3xl font-bold text-[#0F172A] tracking-tight">
              M-Pesa
            </p>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
              Ready out of the box
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
