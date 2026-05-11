"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, DashboardStats, RecentActivityItem } from "@/lib/api";
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
  AlertTriangle,
  Trophy,
} from "lucide-react";

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.getUser();
  const userName = user?.full_name?.split(" ")[0] || "there";
  const router = useRouter();

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch((err) => console.error("Failed to fetch stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleMarkReplied = async (messageId: string) => {
    try {
      await api.markAsReplied(messageId);
      setStats((prev) =>
        prev
          ? {
              ...prev,
              needs_reply: Math.max(0, prev.needs_reply - 1),
              recent_activity: prev.recent_activity.map((m) =>
                m.id === messageId ? { ...m, replied_by_admin: true } : m
              ),
            }
          : prev
      );
    } catch (err) {
      console.error("Failed to mark as replied:", err);
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = stats
    ? [
        {
          label: "New Leads",
          value: stats.new_leads,
          sub: "Interested customers",
          icon: Users,
          color: "bg-blue-50 text-blue-500",
          href: "/contacts",
        },
        {
          label: "Waiting for Reply",
          value: stats.needs_reply,
          sub: "Needs your attention",
          icon: MessageSquare,
          color: "bg-orange-50 text-orange-500",
          href: "/conversations",
        },
        {
          label: "Orders Tracked",
          value: stats.orders_tracked,
          sub: "Potential sales",
          icon: TrendingUp,
          color: "bg-purple-50 text-purple-500",
          href: "/conversations",
        },
        {
          label: "Time Recouped",
          value: `~${stats.estimated_hours_saved}h`,
          sub: "Work handled by Convyr",
          icon: Zap,
          color: "bg-green-50 text-[#25D366]",
          href: "/automations",
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      {/* WhatsApp not connected banner */}
      {!loading && stats && !stats.is_whatsapp_connected && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                WhatsApp not connected
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Connect your WhatsApp Business number to start automating.
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
              : stats && stats.outbound_count > 0
                ? `Convyr saved you ~${stats.estimated_hours_saved} hours. ${stats.needs_reply} ${stats.needs_reply === 1 ? "customer is" : "customers are"} waiting for a reply.`
                : "Here's what's happening with your WhatsApp automation today."}
          </p>
        </div>
        <button
          onClick={() => router.push("/analytics")}
          className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          <Download size={15} /> View Analytics
        </button>
      </div>

      {/* ROI Summary */}
      {!loading && stats && stats.outbound_count > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-linear-to-br from-[#25D366] to-[#128C7E] rounded-2xl p-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={15} className="text-white/80" />
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                Time Saved
              </p>
            </div>
            <p className="text-3xl font-bold">{stats.estimated_hours_saved}h</p>
            <p className="text-xs text-white/70 mt-1">
              ≈ KES {stats.estimated_kes_saved.toLocaleString()} in labour
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 border ${
              stats.missed_opportunities > 0
                ? "bg-red-50 border-red-100"
                : "bg-gray-50 border-gray-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle
                size={15}
                className={
                  stats.missed_opportunities > 0
                    ? "text-red-400"
                    : "text-gray-300"
                }
              />
              <p
                className={`text-xs font-semibold uppercase tracking-wide ${
                  stats.missed_opportunities > 0
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                Missed Leads
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                stats.missed_opportunities > 0
                  ? "text-red-500"
                  : "text-gray-300"
              }`}
            >
              {stats.missed_opportunities}
            </p>
            <p
              className={`text-xs mt-1 ${
                stats.missed_opportunities > 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {stats.missed_opportunities > 0
                ? "No reply after 1 hour"
                : "All leads handled ✓"}
            </p>
            {stats.missed_opportunities > 0 && (
              <button
                onClick={() => router.push("/conversations")}
                className="mt-2 text-[10px] font-bold text-red-500 hover:text-red-700 underline underline-offset-2"
              >
                Reply now →
              </button>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={15} className="text-amber-500" />
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Sales Closed
              </p>
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {stats.sales_closed}
            </p>
            <p className="text-xs text-amber-400 mt-1">
              Marked as "Sale" in conversations
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 h-32 animate-pulse"
              />
            ))
          : statCards.map((stat) => (
              <button
                key={stat.label}
                onClick={() => router.push(stat.href)}
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
            {stats && !stats.is_whatsapp_connected && (
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
                  {stats
                    ? `${stats.total_contacts} customers saved`
                    : "View all messages"}
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
                  {stats
                    ? `${stats.total_contacts} customers saved`
                    : "All contacts"}
                </p>
              </div>
              <ArrowRight size={16} className="shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
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
        ) : !stats || stats.recent_activity.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <MessageSquare size={32} className="text-gray-200" />
            <p className="text-sm text-gray-400">No customer messages yet.</p>
            <p className="text-xs text-gray-300">
              Messages will appear here once customers contact you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {stats.recent_activity.map((message: RecentActivityItem, index: number) => {
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
                  className={`flex items-start justify-between gap-2 py-3 ${
                    index < stats.recent_activity.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                      {(message.contacts?.phone_number || "??").slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {message.contacts?.name ||
                            message.contacts?.phone_number}
                        </p>
                        {tag && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100 italic">
                            {tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-50ax-w-sm italic">
                        "{message.content}"
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-300" />
                          <p className="text-[10px] text-gray-300">
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                        {message.was_auto_replied ? (
                          <p className="text-[10px] text-blue-500 font-medium">
                            Convyr: Auto-replied
                          </p>
                        ) : message.replied_by_admin ? (
                          <p className="text-[10px] text-gray-400 font-medium">
                            Admin replied
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {!message.was_auto_replied && !message.replied_by_admin ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkReplied(message.id)}
                          className="text-[10px] font-bold text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          MARK AS REPLIED
                        </button>
                        <button
                          onClick={() =>
                            router.push(
                              `/conversations?contact=${message.contacts?.phone_number}`
                            )
                          }
                          className="text-[10px] font-bold text-white bg-[#25D366] px-3 py-1.5 rounded-lg hover:bg-[#128C7E] transition-colors"
                        >
                          REPLY NOW
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {message.replied_by_admin && (
                          <span className="text-[10px] font-medium text-gray-400 px-2">
                            Replied
                          </span>
                        )}
                        <button
                          onClick={() =>
                            router.push(
                              `/conversations?contact=${message.contacts?.phone_number}`
                            )
                          }
                          className="text-[10px] font-medium text-gray-400 hover:text-gray-600 underline underline-offset-2"
                        >
                          View Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Smart Suggestion */}
      {!loading && stats && stats.outbound_count > 10 && (
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
          <div className="absolute -right-8 -top-8 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </div>
      )}
    </div>
  );
}