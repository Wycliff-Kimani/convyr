import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-gray-400 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-10">
        <div className="flex flex-col gap-3">
          <Image
            src="/images/logo-icon.png"
            alt="Convyr"
            width={120}
            height={40}
            className="object-contain"
          />
          <p className="text-sm max-w-xs">
            WhatsApp Business Automation for African SMEs. Simple, affordable,
            powerful.
          </p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-white font-medium mb-1">Product</p>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="hover:text-white transition-colors">
            About
          </Link>
          <Link href="/contact" className="hover:text-white transition-colors">
            Contact
          </Link>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="text-white font-medium mb-1">Account</p>
          <Link href="/login" className="hover:text-white transition-colors">
            Log in
          </Link>
          <Link href="/register" className="hover:text-white transition-colors">
            Sign up
          </Link>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-10 pt-6 border-t border-gray-800 text-xs text-center">
        © {new Date().getFullYear()} Convyr by DevCraft Technologies. All rights
        reserved.
      </div>
    </footer>
  );
}
