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
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function OverviewPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.getUser();
  const userName = user?.full_name?.split(" ")[0] || "there";
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
  const isWhatsAppConnected = !!business?.whatsapp_phone_number_id;

  // Business Value Logic
  const newLeads = contacts.filter((c) => {
    const contactMessages = messages.filter((m) => m.contact_id === c.id);
    return contactMessages.length <= 3; // Basic definition of a new lead
  });

  const needsReply = contacts.filter((c) => {
    const contactMessages = messages.filter((m) => m.contact_id === c.id);
    if (contactMessages.length === 0) return false;
    const lastMsg = contactMessages[contactMessages.length - 1];
    return lastMsg.direction === "inbound";
  });

  const responseRate =
    inboundMessages.length > 0
      ? Math.round((outboundMessages.length / inboundMessages.length) * 100)
      : 0;

  const estimatedHoursSaved =
    Math.round(((outboundMessages.length * 2.5) / 60) * 10) / 10;

  // Recent activity — last 5 inbound messages
  const recentActivity = messages
    .filter((m) => m.direction === "inbound")
    .slice(-5)
    .reverse();

  // Get hour of day for greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "New Leads",
      value: loading ? "..." : newLeads.length,
      sub: "Interested customers",
      icon: Users,
      color: "bg-blue-50 text-blue-500",
      action: () => router.push("/contacts"),
    },
    {
      label: "Waiting for Reply",
      value: loading ? "..." : needsReply.length,
      sub: "Needs your attention",
      icon: MessageSquare,
      color: "bg-orange-50 text-orange-500",
      action: () => router.push("/conversations"),
    },
    {
      label: "Orders Tracked",
      value: loading
        ? "..."
        : messages.filter(
            (m) =>
              m.content.toLowerCase().includes("order") ||
              m.content.toLowerCase().includes("buy"),
          ).length,
      sub: "Potential sales",
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-500",
      action: () => router.push("/conversations"),
    },
    {
      label: "Time Recouped",
      value: loading ? "..." : `~${estimatedHoursSaved}h`,
      sub: "Work handled by Convyr",
      icon: Zap,
      color: "bg-green-50 text-[#25D366]",
      action: () => router.push("/automations"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* WhatsApp not connected banner */}
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            {greeting}, {userName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {loading
              ? "Loading your stats..."
              : outboundMessages.length > 0
                ? `Convyr saved you ~${estimatedHoursSaved} hours today. ${needsReply.length} ${needsReply.length === 1 ? "customer is" : "customers are"} waiting for a reply.`
                : "Here's what's happening with your WhatsApp automation today."}
          </p>
        </div>
        <button
          onClick={() => router.push("/analytics")}
          className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Download size={15} /> Download Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.action}
            className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col gap-3 text-left hover:border-[#25D366]/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}
              >
                <stat.icon size={16} />
              </div>
              <ArrowRight
                size={14}
                className="text-gray-300 group-hover:text-[#25D366] transition-colors"
              />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                {stat.label}
              </p>
              <p className="text-[10px] text-gray-300 mt-1">{stat.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {!isWhatsAppConnected && (
              <button
                onClick={() => router.push("/connect-whatsapp")}
                className="flex items-center justify-between gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-3 rounded-xl transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold">Connect WhatsApp</p>
                  <p className="text-xs text-white/70 mt-0.5">
                    Start automating today
                  </p>
                </div>
                <ArrowRight size={16} className="shrink-0" />
              </button>
            )}
            <button
              onClick={() => router.push("/automations")}
              className="flex items-center justify-between gap-3 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-xl transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">Manage Automations</p>
                <p className="text-xs text-purple-500 mt-0.5">
                  Set up auto-reply rules
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0" />
            </button>
            <button
              onClick={() => router.push("/conversations")}
              className="flex items-center justify-between gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">View Conversations</p>
                <p className="text-xs text-blue-500 mt-0.5">
                  {inboundMessages.length} messages received
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0" />
            </button>
            <button
              onClick={() => router.push("/contacts")}
              className="flex items-center justify-between gap-3 bg-orange-50 hover:bg-orange-100 text-orange-700 px-4 py-3 rounded-xl transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-semibold">View Contacts</p>
                <p className="text-xs text-orange-500 mt-0.5">
                  {contacts.length} customers saved
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Customer Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Recent Customer Activity
          </h2>
          <button
            onClick={() => router.push("/conversations")}
            className="text-xs text-[#25D366] hover:text-[#128C7E] font-medium flex items-center gap-1"
          >
            View all <ArrowRight size={12} />
          </button>
        </div>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : recentActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <MessageSquare size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400">No customer messages yet.</p>
            <p className="text-xs text-gray-300">
              Messages will appear here once customers contact you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {recentActivity.map((message, index) => {
              const contactData = contacts.find(
                (c) => c.id === message.contact_id,
              );
              const labelKey = contactData?.label || "new";

              const isAutoReplied = messages.some(
                (m) =>
                  m.direction === "outbound" &&
                  m.contact_id === message.contact_id &&
                  new Date(m.created_at).getTime() >
                    new Date(message.created_at).getTime() &&
                  new Date(m.created_at).getTime() -
                    new Date(message.created_at).getTime() <
                    60000,
              );

              // Simple tag logic based on keywords
              const lowerMsg = message.content.toLowerCase();
              const tag =
                lowerMsg.includes("order") || lowerMsg.includes("buy")
                  ? "Potential Order"
                  : lowerMsg.includes("price") ||
                      lowerMsg.includes("cost") ||
                      lowerMsg.includes("how much")
                    ? "Price Inquiry"
                    : lowerMsg.includes("pay") || lowerMsg.includes("mpesa")
                      ? "Payment"
                      : null;

              return (
                <div
                  key={message.id}
                  className={`flex items-start justify-between gap-2 py-3 ${index < recentActivity.length - 1 ? "border-b border-gray-50" : ""}`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {(message.contacts?.phone_number || "??").slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {message.contacts?.name ||
                            message.contacts?.phone_number}
                        </p>
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 border border-gray-100`}
                        >
                          {labelKey}
                        </span>
                        {tag && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 italic">
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-50 sm:max-w-sm italic">
                        "{message.content}"
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-300" />
                          <p className="text-[10px] text-gray-300">
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                        {isAutoReplied && (
                          <p className="text-[10px] text-blue-500 font-medium">
                            Convyr: Auto-replied
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!isAutoReplied ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/conversations?contact=${message.contacts?.phone_number}`,
                          )
                        }
                        className="text-[10px] font-bold text-white bg-[#25D366] px-3 py-1.5 rounded-lg hover:bg-[#128C7E] transition-colors"
                      >
                        REPLY NOW
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          router.push(
                            `/conversations?contact=${message.contacts?.phone_number}`,
                          )
                        }
                        className="text-[10px] font-medium text-gray-400 hover:text-gray-600 underline underline-offset-2"
                      >
                        View Chat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Coach / Smart Suggestion */}
      {!loading && outboundMessages.length > 10 && (
        <div className="bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} className="text-yellow-300 fill-yellow-300" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Smart Suggestion
              </h3>
            </div>
            <p className="text-lg font-medium max-w-xl">
              "You received several messages about 'price' but have no automatic
              price list. Create a rule to handle these instantly."
            </p>
            <button
              onClick={() => router.push("/automations")}
              className="mt-4 bg-white text-blue-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors flex items-center gap-2"
            >
              Configure Pricing Rule <ArrowRight size={16} />
            </button>
          </div>
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all"></div>
        </div>
      )}
    </div>
  );
}
