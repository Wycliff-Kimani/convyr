"use client";

import { useEffect, useState } from "react";
import { api, Message } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TrendingUp, MessageSquare, Zap, Users } from "lucide-react";

export default function AnalyticsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getMessages();
        setMessages(res.messages);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inbound = messages.filter((m) => m.direction === "inbound");
  const outbound = messages.filter((m) => m.direction === "outbound");
  const responseRate =
    inbound.length > 0
      ? Math.round((outbound.length / inbound.length) * 100)
      : 0;

  const byDate = new Map<string, { inbound: number; outbound: number }>();
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    if (!byDate.has(date)) byDate.set(date, { inbound: 0, outbound: 0 });
    byDate.get(date)![msg.direction]++;
  });

  const dateEntries = Array.from(byDate.entries()).slice(-7);
  const maxCount = Math.max(
    ...Array.from(byDate.values()).map((v) => v.inbound + v.outbound),
    1,
  );

  const stats = [
    {
      label: "Total Messages",
      value: messages.length,
      icon: MessageSquare,
      color: "text-blue-500 bg-blue-50",
    },
    {
      label: "Messages Received",
      value: inbound.length,
      icon: Users,
      color: "text-purple-500 bg-purple-50",
    },
    {
      label: "Auto-Replies Sent",
      value: outbound.length,
      icon: Zap,
      color: "text-[#25D366] bg-green-50",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: "text-orange-500 bg-orange-50",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
          Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your WhatsApp automation performance.
        </p>
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
                {loading ? "..." : stat.value}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 leading-tight">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-[#0F172A] mb-6">
          Messages — Last 7 Days
        </h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : dateEntries.length === 0 ? (
          <p className="text-sm text-gray-400">
            No message data available yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {dateEntries.map(([date, counts]) => (
              <div key={date} className="flex items-center gap-3">
                <p className="text-xs text-gray-400 w-24 shrink-0">{date}</p>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-blue-200"
                      style={{ width: `${(counts.inbound / maxCount) * 100}%` }}
                    />
                    <span className="text-xs text-gray-400 shrink-0">
                      {counts.inbound}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-[#25D366]"
                      style={{
                        width: `${(counts.outbound / maxCount) * 100}%`,
                      }}
                    />
                    <span className="text-xs text-gray-400 shrink-0">
                      {counts.outbound}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-full bg-blue-200" />
                <span className="text-xs text-gray-400">Received</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-2 rounded-full bg-[#25D366]" />
                <span className="text-xs text-gray-400">Sent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
