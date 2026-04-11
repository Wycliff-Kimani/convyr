"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/marketing/Footer";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now — opens email client with pre-filled message
    window.location.href = `mailto:wycliffkimani9@gmail.com?subject=Convyr Enquiry from ${form.name}&body=${encodeURIComponent(form.message)}%0A%0AFrom: ${form.name} (${form.email})`;
    setSubmitted(true);
  };

  return (
    <main>
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

      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div>
            <h1 className="text-4xl font-bold text-[#0F172A] mb-4">
              Get in touch
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Have a question about Convyr? Want to discuss Enterprise pricing?
              Or just want to say hi? We'd love to hear from you.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#25D366] font-bold text-sm">
                  @
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <a
                    href="mailto:wycliffkimani9@gmail.com"
                    className="text-sm font-medium text-[#0F172A] hover:text-[#25D366] transition-colors"
                  >
                    wycliffkimani9@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#25D366] font-bold text-sm">
                  W
                </div>
                <div>
                  <p className="text-xs text-gray-400">WhatsApp</p>
                  <a
                    href="https://wa.me/254793790005"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0F172A] hover:text-[#25D366] transition-colors"
                  >
                    +254 793 790 005
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#25D366] font-bold text-sm">
                  in
                </div>
                <div>
                  <p className="text-xs text-gray-400">LinkedIn</p>
                  <a
                    href="https://www.linkedin.com/in/wycliff-kimani/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0F172A] hover:text-[#25D366] transition-colors"
                  >
                    Wycliff Kimani
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">
                  Message sent!
                </h3>
                <p className="text-sm text-gray-400">
                  Your email client should have opened. We'll get back to you
                  soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#0F172A]">
                    Message
                  </label>
                  <textarea
                    placeholder="How can we help?"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    required
                    rows={4}
                    className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
