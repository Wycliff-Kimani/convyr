"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, Message, Automation, Business } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { TrendingUp, MessageSquare, Zap, Users, Download } from "lucide-react";

export default function AnalyticsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [msgRes, autoRes, bizRes] = await Promise.all([
          api.getMessages(),
          api.getAutomations(),
          api.getBusiness(),
        ]);
        setMessages(msgRes.messages);
        setAutomations(autoRes.automations);
        setBusiness(bizRes);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (searchParams.get("print") === "true" && !loading) {
      setTimeout(() => window.print(), 500);
    }
  }, [loading, searchParams]);

  // Trend — last 7 days vs 7 days before that
  const now = new Date();
  const last7Start = new Date(now);
  last7Start.setDate(now.getDate() - 7);
  last7Start.setHours(0, 0, 0, 0);
  const prev7Start = new Date(last7Start);
  prev7Start.setDate(last7Start.getDate() - 7);

  const last7Msgs = messages.filter(
    (m) => new Date(m.created_at) >= last7Start,
  );
  const prev7Msgs = messages.filter((m) => {
    const d = new Date(m.created_at);
    return d >= prev7Start && d < last7Start;
  });

  const inbound = messages.filter((m) => m.direction === "inbound");
  const outbound = messages.filter((m) => m.direction === "outbound");
  const responseRate =
    inbound.length > 0
      ? Math.round((outbound.length / inbound.length) * 100)
      : 0;

  const last7Inbound = last7Msgs.filter(
    (m) => m.direction === "inbound",
  ).length;
  const prev7Inbound = prev7Msgs.filter(
    (m) => m.direction === "inbound",
  ).length;
  const inboundTrend =
    prev7Inbound > 0
      ? Math.round(((last7Inbound - prev7Inbound) / prev7Inbound) * 100)
      : null;

  const last7Outbound = last7Msgs.filter(
    (m) => m.direction === "outbound",
  ).length;
  const prev7Outbound = prev7Msgs.filter(
    (m) => m.direction === "outbound",
  ).length;
  const outboundTrend =
    prev7Outbound > 0
      ? Math.round(((last7Outbound - prev7Outbound) / prev7Outbound) * 100)
      : null;

  // Last 7 days chart
  const byDate = new Map<string, { inbound: number; outbound: number }>();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return formatDate(d.toISOString());
  });
  last7.forEach((date) => byDate.set(date, { inbound: 0, outbound: 0 }));
  messages.forEach((msg) => {
    const date = formatDate(msg.created_at);
    if (byDate.has(date)) byDate.get(date)![msg.direction]++;
  });
  const dateEntries = Array.from(byDate.entries());
  const maxCount = Math.max(
    ...Array.from(byDate.values()).map((v) => v.inbound + v.outbound),
    1,
  );

  // SVG line chart
  const svgWidth = 500;
  const svgHeight = 120;
  const padding = 20;
  const pointSpacing = (svgWidth - padding * 2) / (dateEntries.length - 1);

  const inboundPoints = dateEntries.map(([, counts], i) => ({
    x: padding + i * pointSpacing,
    y:
      svgHeight -
      padding -
      (counts.inbound / maxCount) * (svgHeight - padding * 2),
    value: counts.inbound,
  }));

  const outboundPoints = dateEntries.map(([, counts], i) => ({
    x: padding + i * pointSpacing,
    y:
      svgHeight -
      padding -
      (counts.outbound / maxCount) * (svgHeight - padding * 2),
    value: counts.outbound,
  }));

  const toPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Peak hour
  const hourCounts = new Array(24).fill(0);
  inbound.forEach((msg) => {
    const hour = new Date(msg.created_at).getHours();
    hourCounts[hour]++;
  });
  const maxHourCount = Math.max(...hourCounts, 1);
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Top contacts
  const contactMessageCount = new Map<
    string,
    { phone: string; count: number; lastSeen: string }
  >();
  messages.forEach((msg) => {
    const phone = msg.contacts?.phone_number;
    if (!phone) return;
    if (!contactMessageCount.has(phone)) {
      contactMessageCount.set(phone, {
        phone,
        count: 0,
        lastSeen: msg.created_at,
      });
    }
    const entry = contactMessageCount.get(phone)!;
    entry.count++;
    if (new Date(msg.created_at) > new Date(entry.lastSeen))
      entry.lastSeen = msg.created_at;
  });
  const topContacts = Array.from(contactMessageCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxContactCount = topContacts[0]?.count || 1;

  // Top automations
  const keywordHits = new Map<string, { name: string; count: number }>();
  automations.forEach((auto) => {
    if (!auto.keyword) return;
    const count = outbound.filter((m) =>
      m.content?.toLowerCase().includes(auto.keyword!.toLowerCase()),
    ).length;
    if (count > 0) keywordHits.set(auto.keyword, { name: auto.name, count });
  });
  const topAutomations = Array.from(keywordHits.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxAutoCount = topAutomations[0]?.count || 1;

  const stats = [
    {
      label: "Total Conversations",
      value: messages.length,
      trend: inboundTrend,
      icon: MessageSquare,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      tooltip: "Total messages sent and received across all contacts",
    },
    {
      label: "Messages Received",
      value: inbound.length,
      trend: inboundTrend,
      icon: Users,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      tooltip: "Inbound messages from your customers",
    },
    {
      label: "Auto-Replies Sent",
      value: outbound.length,
      trend: outboundTrend,
      icon: Zap,
      iconColor: "text-[#25D366]",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      tooltip: "Automated replies sent by Convyr on your behalf",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      trend: null,
      icon: TrendingUp,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      tooltip: "Percentage of received messages that got an automated reply",
    },
  ];

  const reportDate = new Date().toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const generateSummary = () => {
    const topContact = topContacts[0];
    const topAuto = topAutomations[0];
    const peakTime = `${peakHour.toString().padStart(2, "0")}:00`;
    const trend =
      inboundTrend !== null
        ? inboundTrend >= 0
          ? `up ${inboundTrend}% compared to the previous 7 days`
          : `down ${Math.abs(inboundTrend)}% compared to the previous 7 days`
        : "stable";
    return `${business?.name || "Your business"} has handled ${messages.length} total messages on WhatsApp, with a ${responseRate}% automation response rate. Message volume is ${trend}. ${topContact ? `The most active contact is ${topContact.phone} with ${topContact.count} messages.` : ""} ${topAuto ? `The most triggered automation is "${topAuto.name}" with ${topAuto.count} triggers.` : ""} Peak customer activity occurs at ${peakTime}.`;
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #report-content, #report-content * { visibility: visible; }
          #report-content { position: absolute; left: 0; top: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
          .print-section { page-break-inside: avoid; margin-bottom: 24px; }
          .print-break { page-break-before: always; }
          body { background: white; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      <div id="report-content" className="flex flex-col gap-6">
        {/* Report Header — print only */}
        <div className="hidden print:block print-section mb-4 border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F172A]">
                Convyr Business Report
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {business?.name || "Business"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{business?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Generated</p>
              <p className="text-sm font-medium text-[#0F172A]">{reportDate}</p>
              <p className="text-xs text-gray-400 mt-1">
                Plan: {business?.subscription_plan?.toUpperCase() || "TRIAL"}
              </p>
            </div>
          </div>
        </div>

        {/* Screen Header */}
        <div className="flex items-center justify-between no-print">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
              Analytics
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Track your WhatsApp automation performance.
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[#0F172A] hover:bg-[#1e293b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={15} />
            Download Report
          </button>
        </div>

        {/* Executive Summary — print only */}
        {!loading && (
          <div className="hidden print:block print-section bg-gray-50 rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#0F172A] mb-2">
              Executive Summary
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {generateSummary()}
            </p>
          </div>
        )}

        {/* Stat Cards */}
        <div className="print-section grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-white rounded-2xl border ${stat.borderColor} p-4 sm:p-5`}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}
                >
                  <stat.icon size={18} className={stat.iconColor} />
                </div>
                {stat.trend !== null && (
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}
                  >
                    {stat.trend >= 0 ? "↑" : "↓"} {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
                {loading ? "..." : stat.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              <p className="text-[10px] text-gray-300 mt-1 no-print">
                {stat.tooltip}
              </p>
            </div>
          ))}
        </div>

        {/* Line Chart + Peak Hour */}
        <div className="print-section grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-1">
              Message Activity — Last 7 Days
            </h2>
            <p className="text-xs text-gray-400 mb-4 no-print">
              Blue = received, green = sent
            </p>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full"
                  preserveAspectRatio="none"
                >
                  {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                      key={t}
                      x1={padding}
                      y1={padding + t * (svgHeight - padding * 2)}
                      x2={svgWidth - padding}
                      y2={padding + t * (svgHeight - padding * 2)}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                  ))}
                  <path
                    d={`${toPath(inboundPoints)} L ${inboundPoints[inboundPoints.length - 1].x} ${svgHeight - padding} L ${inboundPoints[0].x} ${svgHeight - padding} Z`}
                    fill="#bfdbfe"
                    opacity="0.3"
                  />
                  <path
                    d={`${toPath(outboundPoints)} L ${outboundPoints[outboundPoints.length - 1].x} ${svgHeight - padding} L ${outboundPoints[0].x} ${svgHeight - padding} Z`}
                    fill="#25D366"
                    opacity="0.15"
                  />
                  <path
                    d={toPath(inboundPoints)}
                    fill="none"
                    stroke="#93c5fd"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d={toPath(outboundPoints)}
                    fill="none"
                    stroke="#25D366"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {inboundPoints.map((p, i) => (
                    <circle
                      key={`in-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r="3"
                      fill="#93c5fd"
                    />
                  ))}
                  {outboundPoints.map((p, i) => (
                    <circle
                      key={`out-${i}`}
                      cx={p.x}
                      cy={p.y}
                      r="3"
                      fill="#25D366"
                    />
                  ))}
                </svg>
                <div className="flex justify-between mt-2">
                  {dateEntries.map(([date]) => (
                    <p
                      key={date}
                      className="text-[9px] sm:text-[10px] text-gray-300 text-center"
                      style={{ width: `${100 / dateEntries.length}%` }}
                    >
                      {date.split(" ")[0]} {date.split(" ")[1]}
                    </p>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full bg-blue-300" />
                    <span className="text-xs text-gray-400">Received</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded-full bg-[#25D366]" />
                    <span className="text-xs text-gray-400">Sent</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Peak Hour Heatmap */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-1">
              Peak Activity
            </h2>
            <p className="text-xs text-gray-400 mb-4 no-print">
              Busiest hours of the day
            </p>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : inbound.length === 0 ? (
              <p className="text-sm text-gray-400">No data yet.</p>
            ) : (
              <>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold text-[#25D366]">
                    {peakHour.toString().padStart(2, "0")}:00
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Most active hour</p>
                  <p className="text-xs text-gray-300">
                    {hourCounts[peakHour]} messages
                  </p>
                </div>
                <div className="grid grid-cols-6 gap-1">
                  {hourCounts.map((count, hour) => {
                    const intensity = count / maxHourCount;
                    const bg =
                      count === 0
                        ? "bg-gray-100"
                        : intensity > 0.75
                          ? "bg-[#25D366]"
                          : intensity > 0.5
                            ? "bg-green-300"
                            : intensity > 0.25
                              ? "bg-green-200"
                              : "bg-green-100";
                    return (
                      <div
                        key={hour}
                        title={`${hour.toString().padStart(2, "0")}:00 — ${count} messages`}
                        className={`${bg} rounded aspect-square flex items-center justify-center`}
                      >
                        <span className="text-[8px] text-gray-500">{hour}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-300">Low</span>
                  <div className="flex gap-0.5">
                    {[
                      "bg-gray-100",
                      "bg-green-100",
                      "bg-green-200",
                      "bg-green-300",
                      "bg-[#25D366]",
                    ].map((c) => (
                      <div key={c} className={`w-3 h-2 rounded-sm ${c}`} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-300">High</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Top Contacts + Top Automations */}
        <div className="print-section grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-1">
              Top Contacts
            </h2>
            <p className="text-xs text-gray-400 mb-4 no-print">
              Most active customers by message count
            </p>
            {loading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : topContacts.length === 0 ? (
              <p className="text-sm text-gray-400">No contacts yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {topContacts.map(({ phone, count, lastSeen }) => (
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
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-purple-400 h-1.5 rounded-full"
                          style={{
                            width: `${(count / maxContactCount) * 100}%`,
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-300">
                        Last seen: {formatDate(lastSeen)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
            <h2 className="text-base font-semibold text-[#0F172A] mb-1">
              Top Automations
            </h2>
            <p className="text-xs text-gray-400 mb-4 no-print">
              Most triggered automation rules
            </p>
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
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-[#25D366] h-1.5 rounded-full"
                          style={{ width: `${(count / maxAutoCount) * 100}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-300">
                        {Math.round((count / outbound.length) * 100)}% of all
                        auto-replies
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Print footer */}
        <div className="hidden print:block print-section mt-4 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Generated by Convyr — WhatsApp Business Automation
          </p>
          <p className="text-xs text-gray-300">convyr.vercel.app</p>
        </div>
      </div>
    </>
  );
}
