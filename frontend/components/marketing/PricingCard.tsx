import Link from "next/link";

interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  highlighted = false,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 flex flex-col gap-6 border ${
        highlighted
          ? "bg-[#25D366] border-[#25D366] text-white"
          : "bg-white border-gray-200 text-[#0F172A]"
      }`}
    >
      <div>
        <p
          className={`text-xs font-medium uppercase tracking-wide ${highlighted ? "text-white/80" : "text-gray-400"}`}
        >
          {name}
        </p>
        <p className="text-3xl sm:text-4xl font-bold mt-2">{price}</p>
        <p
          className={`text-sm mt-2 ${highlighted ? "text-white/80" : "text-gray-500"}`}
        >
          {description}
        </p>
      </div>
      <ul className="flex flex-col gap-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <span
              className={`text-lg shrink-0 ${highlighted ? "text-white" : "text-[#25D366]"}`}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`text-center py-3 rounded-lg font-medium text-sm transition-colors ${
          highlighted
            ? "bg-white text-[#25D366] hover:bg-gray-100"
            : "bg-[#25D366] text-white hover:bg-[#128C7E]"
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}
