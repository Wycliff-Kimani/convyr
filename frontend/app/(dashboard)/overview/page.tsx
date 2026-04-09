"use client";

import { useEffect, useState } from "react";
import { api, Contact, Message } from "@/lib/api";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import { Users, MessageSquare, Zap, TrendingUp } from "lucide-react";

export default function OverviewPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, messagesRes] = await Promise.all([
          api.getContacts(),
          api.getMessages(),
        ]);
        setContacts(contactsRes.contacts);
        setMessages(messagesRes.messages);
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
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
          Good morning, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Here's what's happening with your WhatsApp automation today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Messages */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-[#0F172A] mb-4">
          Recent Messages
        </h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading messages...</p>
        ) : recentMessages.length === 0 ? (
          <p className="text-sm text-gray-400">
            No messages yet. They'll appear here once customers start messaging
            you.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentMessages.map((message) => (
              <div
                key={message.id}
                className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                    {message.contacts?.phone_number?.slice(-2)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">
                      {message.contacts?.name || message.contacts?.phone_number}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 max-w-sm truncate">
                      {message.content}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      message.direction === "inbound"
                        ? "bg-blue-50 text-blue-500"
                        : "bg-green-50 text-[#25D366]"
                    }`}
                  >
                    {message.direction === "inbound" ? "Received" : "Sent"}
                  </span>
                  <p className="text-xs text-gray-400">
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
