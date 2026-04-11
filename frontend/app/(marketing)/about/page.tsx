import Link from "next/link";
import Footer from "@/components/marketing/Footer";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";

export default function AboutPage() {
  return (
    <main>
      <MarketingNavbar />

      {/* Hero */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#075E54] text-xs font-medium px-4 py-2 rounded-full mb-8 border border-green-100">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full"></span>
            Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] leading-tight mb-6">
            Built for African businesses.
            <br />
            <span className="text-[#25D366]">Built to save you time.</span>
          </h1>
          <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
            Every day, thousands of Kenyan businesses handle hundreds of
            customer messages manually on WhatsApp. Replies are slow,
            opportunities are lost, and owners waste hours they don't have.
            Convyr was created to change that.
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
            <p className="text-gray-600 leading-relaxed mb-4">
              We exist to give every small and growing business in Africa the
              same powerful WhatsApp automation tools that big companies use —
              but without the high cost, complexity, or need for technical
              skills.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Whether you run a shop, salon, school, clinic, or delivery
              service, you should be able to set up professional automated
              replies in under 5 minutes and focus on running your business
              instead of chasing messages.
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
            <p className="text-gray-600 text-sm mt-4 leading-relaxed max-w-lg mx-auto">
              I'm a software developer based in Kenya. After watching too many
              local businesses lose customers due to slow WhatsApp replies, I
              decided to build the exact tool I wished existed — simple,
              affordable, and built specifically for African businesses.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <a
                href="https://www.linkedin.com/in/wycliff-kimani/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#25D366] hover:underline font-medium"
              >
                LinkedIn &rarr;
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
            Ready to stop losing customers to slow replies?
          </h2>
          <p className="text-gray-400 mb-8">
            Set up automated WhatsApp in 5 minutes. No technical skills
            required.
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
