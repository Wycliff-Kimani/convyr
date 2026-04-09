import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo */}
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            Get started with Convyr in under 5 minutes
          </p>

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Wycliff Kimani"
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
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors mt-1"
            >
              Create Account
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
