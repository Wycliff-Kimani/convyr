"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Contact, Message, Business } from "@/lib/api";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  MessageSquare,
  Zap,
  TrendingUp,
  Download,
  AlertCircle,
} from "lucide-react";

export default function OverviewPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.getUser();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, messagesRes, businessRes] = await Promise.all([
          api.getContacts(),
          api.getMessages(),
          api.getBusiness(),
        ]);
        setContacts(contactsRes.contacts);
        setMessages(messagesRes.messages);
        setBusiness(businessRes);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inboundMessages = messages.filter((m) => m.direction === "inbound");
  const outboundMessages = messages.filter((m) => m.direction === "outbound");
  const recentMessages = messages.slice(0, 5);
  const isWhatsAppConnected = !!business?.whatsapp_phone_number_id;

  const stats = [
    {
      label: "Total Contacts",
      value: loading ? "..." : contacts.length,
      icon: Users,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "Messages Received",
      value: loading ? "..." : inboundMessages.length,
      icon: MessageSquare,
      color: "bg-green-50 text-[#25D366]",
    },
    {
      label: "Auto-Replies Sent",
      value: loading ? "..." : outboundMessages.length,
      icon: Zap,
      color: "bg-purple-50 text-purple-500",
    },
    {
      label: "Response Rate",
      value: loading
        ? "..."
        : inboundMessages.length > 0
          ? `${Math.round((outboundMessages.length / inboundMessages.length) * 100)}%`
          : "0%",
      icon: TrendingUp,
      color: "bg-orange-50 text-orange-500",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* WhatsApp connection banner */}
      {!loading && !isWhatsAppConnected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                WhatsApp not connected
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Connect your WhatsApp Business number to start automating
                customer replies.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/connect-whatsapp")}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shrink-0"
          >
            Connect WhatsApp
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Good morning, {user?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Here's what's happening with your WhatsApp automation today.
          </p>
        </div>
        <button
          onClick={() => router.push("/analytics?print=true")}
          className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Download size={15} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex items-center gap-3 sm:gap-4"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
            >
              <stat.icon size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                {stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-[#0F172A] mb-4">
          Recent Messages
        </h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading messages...</p>
        ) : recentMessages.length === 0 ? (
          <p className="text-sm text-gray-400">No messages yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start justify-between gap-2 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-start gap-2 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                    {message.contacts?.phone_number?.slice(-2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#0F172A] truncate">
                      {message.contacts?.name || message.contacts?.phone_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-37.5 sm:max-w-sm">
                      {message.content}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                      message.direction === "inbound"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-green-50 text-[#25D366]"
                    }`}
                  >
                    {message.direction === "inbound" ? "Received" : "Sent"}
                  </span>
                  <p className="text-[10px] text-gray-400">
                    {formatDateTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
