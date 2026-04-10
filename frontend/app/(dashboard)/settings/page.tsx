"use client";

import { useState } from "react";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { User, CreditCard, LogOut } from "lucide-react";

export default function SettingsPage() {
  const user = auth.getUser();
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<"basic" | "pro">("basic");
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");

  const handlePayment = async () => {
    if (!phone) return;
    setPaying(true);
    setPayMessage("");
    try {
      await api.initiatePayment(phone, plan);
      setPayMessage(
        "M-Pesa prompt sent to your phone. Enter your PIN to complete payment.",
      );
    } catch (err) {
      setPayMessage(
        err instanceof Error
          ? err.message
          : "Payment failed. Please try again.",
      );
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
          Settings
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage your account and subscription.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-[#0F172A]">Account</h2>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Full Name
            </p>
            <p className="text-sm font-medium text-[#0F172A]">
              {user?.full_name}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400 uppercase tracking-wide">
              Email
            </p>
            <p className="text-sm font-medium text-[#0F172A]">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-[#0F172A]">
            Subscription
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              Select Plan
            </label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as "basic" | "pro")}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
            >
              <option value="basic">Basic — KES 2,000/month</option>
              <option value="pro">Pro — KES 5,000/month</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#0F172A]">
              M-Pesa Phone Number
            </label>
            <input
              type="tel"
              placeholder="e.g. 0793790005"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
            />
          </div>
          {payMessage && (
            <div
              className={`text-sm px-4 py-3 rounded-lg ${
                payMessage.includes("sent")
                  ? "bg-green-50 text-[#075E54]"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {payMessage}
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={paying || !phone}
            className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            {paying ? "Processing..." : "Pay via M-Pesa"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <button
          onClick={() => auth.logout()}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}
