"use client";

import { useEffect, useState } from "react";
import { api, Message, Contact, Automation } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TrendingUp, MessageSquare, Zap, Users } from "lucide-react";

export default function AnalyticsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, contactRes, autoRes] = await Promise.all([
          api.getMessages(),
          api.getContacts(),
          api.getAutomations(),
        ]);
        setMessages(msgRes.messages);
        setContacts(contactRes.contacts);
        setAutomations(autoRes.automations);
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

  // Last 7 days chart data
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

  // Top contacts by message count
  const contactMessageCount = new Map<
    string,
    { phone: string; count: number }
  >();
  messages.forEach((msg) => {
    const phone = msg.contacts?.phone_number;
    if (!phone) return;
    if (!contactMessageCount.has(phone)) {
      contactMessageCount.set(phone, { phone, count: 0 });
    }
    contactMessageCount.get(phone)!.count++;
  });
  const topContacts = Array.from(contactMessageCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxContactCount = topContacts[0]?.count || 1;

  // Top automations by keyword match count in outbound messages
  const keywordHits = new Map<string, { name: string; count: number }>();
  automations.forEach((auto) => {
    if (!auto.keyword) return;
    const count = outbound.filter((m) =>
      m.content?.toLowerCase().includes(auto.keyword!.toLowerCase()),
    ).length;
    if (count > 0) {
      keywordHits.set(auto.keyword, { name: auto.name, count });
    }
  });
  const topAutomations = Array.from(keywordHits.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxAutoCount = topAutomations[0]?.count || 1;

  // Peak hours
  const hourCounts = new Array(24).fill(0);
  inbound.forEach((msg) => {
    const hour = new Date(msg.created_at).getHours();
    hourCounts[hour]++;
  });
  const maxHourCount = Math.max(...hourCounts, 1);
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  const stats = [
    {
      label: "Total Messages",
      value: messages.length,
      icon: MessageSquare,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      label: "Messages Received",
      value: inbound.length,
      icon: Users,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
    },
    {
      label: "Auto-Replies Sent",
      value: outbound.length,
      icon: Zap,
      iconColor: "text-[#25D366]",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
          Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Track your WhatsApp automation performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-white rounded-2xl border ${stat.borderColor} p-4 sm:p-5`}
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}
            >
              <stat.icon size={18} className={stat.iconColor} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
              {loading ? "..." : stat.value}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Chart + Peak Hour row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 7-day bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
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
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-blue-200 transition-all"
                        style={{
                          width: `${(counts.inbound / maxCount) * 100}%`,
                          minWidth: counts.inbound > 0 ? "4px" : "0",
                        }}
                      />
                      <span className="text-xs text-gray-400 shrink-0">
                        {counts.inbound}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-[#25D366] transition-all"
                        style={{
                          width: `${(counts.outbound / maxCount) * 100}%`,
                          minWidth: counts.outbound > 0 ? "4px" : "0",
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

        {/* Peak Hour */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 flex flex-col justify-between">
          <h2 className="text-base font-semibold text-[#0F172A] mb-4">
            Peak Hour
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : inbound.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <>
              <div className="flex-1 flex flex-col justify-center items-center py-4">
                <p className="text-5xl font-bold text-[#25D366]">
                  {peakHour.toString().padStart(2, "0")}:00
                </p>
                <p className="text-sm text-gray-400 mt-2">Most active hour</p>
                <p className="text-xs text-gray-300 mt-1">
                  {hourCounts[peakHour]} messages received
                </p>
              </div>
              <div className="flex items-end gap-0.5 h-12 mt-4">
                {hourCounts.map((count, hour) => (
                  <div
                    key={hour}
                    title={`${hour}:00 — ${count} msgs`}
                    className={`flex-1 rounded-sm transition-all ${hour === peakHour ? "bg-[#25D366]" : "bg-gray-100"}`}
                    style={{
                      height: `${(count / maxHourCount) * 100}%`,
                      minHeight: count > 0 ? "2px" : "0",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-gray-300">12am</span>
                <span className="text-[10px] text-gray-300">12pm</span>
                <span className="text-[10px] text-gray-300">11pm</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Contacts + Top Automations row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Contacts */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-[#0F172A] mb-6">
            Top Contacts
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : topContacts.length === 0 ? (
            <p className="text-sm text-gray-400">No contacts yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {topContacts.map(({ phone, count }) => (
                <div key={phone} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                    {phone.slice(-2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-[#0F172A] truncate">
                        {phone}
                      </p>
                      <p className="text-xs text-gray-400 shrink-0 ml-2">
                        {count} msgs
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-purple-400 h-1.5 rounded-full"
                        style={{ width: `${(count / maxContactCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Automations */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
          <h2 className="text-base font-semibold text-[#0F172A] mb-6">
            Top Automations
          </h2>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : topAutomations.length === 0 ? (
            <p className="text-sm text-gray-400">
              No automation triggers fired yet.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {topAutomations.map(({ name, count }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Zap size={14} className="text-[#25D366]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-[#0F172A] truncate">
                        {name}
                      </p>
                      <p className="text-xs text-gray-400 shrink-0 ml-2">
                        {count} triggers
                      </p>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-[#25D366] h-1.5 rounded-full"
                        style={{ width: `${(count / maxAutoCount) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
