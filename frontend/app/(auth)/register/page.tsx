"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await auth.register(fullName, businessName, email, password);
      router.push("/overview");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/images/logo-light.svg"
              alt="Convyr"
              width={200}
              height={200}
              style={{ width: "auto", height: "96px" }}
              className="object-contain"
            />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Get started with Convyr in under 5 minutes
          </p>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Wycliff Kimani"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Business Name
              </label>
              <input
                type="text"
                placeholder="DevCraft Technologies"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-1"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#25D366] hover:underline font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
