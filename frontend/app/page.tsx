import Image from "next/image";
import HeroSection from "@/components/marketing/HeroSection";
import PricingCard from "@/components/marketing/PricingCard";
import Footer from "@/components/marketing/Footer";

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

const features = [
  {
    icon: "/images/Instant-Auto-Replies.svg",
    alt: "Instant Auto-Replies",
    title: "Instant Auto-Replies",
    desc: "Reply to customers instantly with keyword-based automation. Never miss a message again.",
  },
  {
    icon: "/images/order-management.svg",
    alt: "Order Management",
    title: "Order Management",
    desc: "Let customers place orders via WhatsApp. Track and manage everything from your dashboard.",
  },
  {
    icon: "/images/M-Pesa-Ready.svg",
    alt: "M-Pesa Ready",
    title: "M-Pesa Ready",
    desc: "Accept M-Pesa payments directly. No extra setup — it works out of the box.",
  },
];

export default function Home() {
  return (
    <main>
      <HeroSection />

      {/* Features Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-[#0F172A]">
            Everything your business needs
          </h2>
          <p className="text-gray-500 mt-3">Set it up once. Let it run 24/7.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-14 h-14 mb-5">
                <Image
                  src={feature.icon}
                  alt={feature.alt}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full"
                />
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-[#0F172A]">
            Simple, honest pricing
          </h2>
          <p className="text-gray-500 mt-3">No hidden fees. Cancel anytime.</p>
        </div>
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
      </section>

      <Footer />
    </main>
  );
}
