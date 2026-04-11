import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/marketing/Footer";
import HeroSection from "@/components/marketing/HeroSection";

export default function AboutPage() {
  return (
    <main>
      {/* Navbar — reuse from HeroSection but we need just the nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 h-[64px] border-b border-gray-100 bg-white">
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
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-xs font-medium px-4 py-2 rounded-full mb-8 border border-green-100">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight mb-6">
            Built for Africa.
            <br />
            <span className="text-[#25D366]">Built for You.</span>
          </h1>
          <p className="text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
            Convyr was born from a simple observation — 90% of Kenyan businesses
            run their customer service on WhatsApp, manually, one message at a
            time. We built the tool we wished existed.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#0F172A] mb-4">
              Our Mission
            </h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              To give every small business in Africa the same automation tools
              that large corporations use — without the complexity, without the
              cost, and without needing a tech team.
            </p>
            <p className="text-gray-500 leading-relaxed">
              We believe a shoe shop, a salon owner, or a school admin should be
              able to automate their WhatsApp in 5 minutes and get back to doing
              what they do best.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "5 min", label: "Average setup time" },
              { value: "24/7", label: "Automated replies" },
              { value: "KES 2K", label: "Starting price" },
              { value: "Africa", label: "First. Then the world." },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-5 border border-gray-100 text-center"
              >
                <p className="text-2xl font-bold text-[#25D366]">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#0F172A] mb-12">
            The Founder
          </h2>
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
              WK
            </div>
            <h3 className="text-xl font-bold text-[#0F172A]">Wycliff Kimani</h3>
            <p className="text-sm text-[#25D366] font-medium mt-1">
              Founder & CEO — DevCraft Technologies
            </p> 
            <p className="text-gray-500 text-sm mt-4 leading-relaxed max-w-lg mx-auto">
              Software developer based in Kenya. Building tools that solve real
              African business problems. Convyr is the product I needed before I
              built it.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/in/wycliff-kimani/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#25D366] hover:underline font-medium"
              >
                LinkedIn →
              </a>
              <a
                href="mailto:wycliffkimani9@gmail.com"
                className="text-sm text-gray-400 hover:text-[#075E54] transition-colors"
              >
                wycliffkimani9@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0F172A] py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to automate your WhatsApp?
          </h2>
          <p className="text-gray-400 mb-8">
            Set up in 5 minutes. No tech skills needed.
          </p>
          <Link
            href="/register"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
