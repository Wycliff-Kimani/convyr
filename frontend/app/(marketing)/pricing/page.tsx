import Link from "next/link";
import Footer from "@/components/marketing/Footer";
import PricingCard from "@/components/marketing/PricingCard";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";

const basicFeatures = [
  "Up to 500 automated replies/month",
  "Keyword-based auto-replies",
  "Contact management",
  "Message history",
  "M-Pesa subscription payments",
  "Email support",
];

const proFeatures = [
  "Unlimited automated replies",
  "Advanced automation rules",
  "Full conversation dashboard",
  "Analytics and reports",
  "Priority support",
  "M-Pesa + card payments",
];

const faqs = [
  {
    q: "Do I need technical skills to set up Convyr?",
    a: "No. If you can use WhatsApp, you can use Convyr. Setup takes under 5 minutes.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. No contracts, no lock-in. Cancel anytime from your dashboard settings.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa (STK push directly to your phone). More payment options coming soon.",
  },
  {
    q: "What happens when I hit the 500 reply limit on Basic?",
    a: "Your automations pause until the next billing cycle. Upgrade to Pro for unlimited replies.",
  },
  {
    q: "Is my WhatsApp number safe?",
    a: "Yes. We use the official Meta WhatsApp Business API. Your number and data are secure.",
  },
];

export default function PricingPage() {
  return (
    <main>
      <MarketingNavbar />

      {/* Header */}
      <section className="bg-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
            Simple, honest pricing
          </h1>
          <p className="text-gray-400 text-base">
            No hidden fees. No surprises. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="bg-gray-50 py-10 px-6 pb-20">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <PricingCard
            name="Basic"
            price="KES 2,000/mo"
            description="Perfect for small businesses just getting started."
            features={basicFeatures}
          />
          <PricingCard
            name="Pro"
            price="KES 5,000/mo"
            description="For growing businesses that need more power."
            features={proFeatures}
            highlighted={true}
          />
        </div>
        <p className="text-center text-sm text-gray-400 mt-8">
          Need something custom?{" "}
          <Link href="/contact" className="text-[#25D366] hover:underline">
            Contact us for Enterprise pricing &rarr;
          </Link>
        </p>
      </section>

      {/* FAQ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-[#0F172A] text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
              >
                <p className="text-sm font-semibold text-[#0F172A] mb-2">
                  {faq.q}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
