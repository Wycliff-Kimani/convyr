"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";
import { api, Business } from "@/lib/api";
import {
  User,
  CreditCard,
  LogOut,
  Smartphone,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function SettingsPage() {
  const user = auth.getUser();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState<"basic" | "pro">("basic");
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState("");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .getBusiness()
      .then(setBusiness)
      .finally(() => setLoadingBusiness(false));
  }, []);

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

  const handleDisconnectWhatsApp = async () => {
    setDisconnecting(true);
    try {
      await api.disconnectWhatsApp();
      setBusiness((prev) =>
        prev
          ? {
              ...prev,
              whatsapp_phone_number_id: null,
              whatsapp_business_account_id: null,
            }
          : prev,
      );
    } catch (err) {
      console.error("Failed to disconnect WhatsApp", err);
    } finally {
      setDisconnecting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== "DELETE") return;
    setDeleting(true);
    try {
      await api.deleteAccount();
      auth.logout();
      router.push("/");
    } catch (err) {
      console.error("Failed to delete account", err);
      setDeleting(false);
    }
  };

  const isConnected = !!business?.whatsapp_phone_number_id;

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

      {/* Account */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
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

      {/* WhatsApp Connection */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone size={16} className="text-gray-400" />
          <h2 className="text-base font-semibold text-[#0F172A]">
            WhatsApp Connection
          </h2>
        </div>

        {loadingBusiness ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : isConnected ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-[#25D366] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#075E54]">
                  WhatsApp connected
                </p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  Phone ID: {business?.whatsapp_phone_number_id}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/connect-whatsapp")}
                className="flex-1 border border-gray-200 hover:border-[#25D366] text-[#0F172A] hover:text-[#25D366] py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Change Number
              </button>
              <button
                onClick={handleDisconnectWhatsApp}
                disabled={disconnecting}
                className="flex-1 border border-red-100 hover:border-red-300 text-red-500 hover:text-red-600 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <XCircle size={16} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Not connected
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect your WhatsApp Business number to start automating
                  replies.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/connect-whatsapp")}
              className="bg-[#25D366] hover:bg-[#128C7E] text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Connect WhatsApp
            </button>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
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
              placeholder="e.g. 0712345678"
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

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={16} className="text-red-400" />
          <h2 className="text-base font-semibold text-red-500">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-gray-50">
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Log out</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Sign out of your Convyr account.
            </p>
          </div>
          <button
            onClick={() => auth.logout()}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-100 hover:border-red-300 px-4 py-2 rounded-lg transition-colors font-medium shrink-0"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-sm font-medium text-[#0F172A]">Delete account</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Permanently delete your account and all data. This cannot be
              undone.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 border border-red-100 hover:border-red-300 px-4 py-2 rounded-lg transition-colors font-medium shrink-0"
          >
            <Trash2 size={14} /> Delete account
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="text-base font-bold text-[#0F172A]">
                  Delete account
                </p>
                <p className="text-xs text-gray-400">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              All your data including contacts, messages, and automations will
              be permanently deleted. Type{" "}
              <span className="font-bold text-red-500">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              placeholder="Type DELETE to confirm"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteInput("");
                }}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:border-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteInput !== "DELETE" || deleting}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {deleting ? "Deleting..." : "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
