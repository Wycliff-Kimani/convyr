"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Contact } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Users, Search, MessageCircle, FileText, Phone } from "lucide-react";

const LABEL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; dot: string }
> = {
  new: {
    label: "New",
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
  },
  repeat: {
    label: "Repeat",
    color: "text-purple-600",
    bg: "bg-purple-50",
    dot: "bg-purple-500",
  },
  pending_payment: {
    label: "Pending Payment",
    color: "text-orange-600",
    bg: "bg-orange-50",
    dot: "bg-orange-500",
  },
  order_in_progress: {
    label: "Order In Progress",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    dot: "bg-yellow-500",
  },
  done: {
    label: "Done",
    color: "text-green-600",
    bg: "bg-green-50",
    dot: "bg-green-500",
  },
};

function getInitials(phone: string, name?: string | null): string {
  if (name) return name.slice(0, 2).toUpperCase();
  return phone.slice(-2);
}

function getAvatarColor(phone: string): string {
  const colors = [
    "bg-emerald-500",
    "bg-blue-500",
    "bg-violet-500",
    "bg-pink-500",
    "bg-amber-500",
    "bg-teal-500",
    "bg-rose-500",
  ];
  const idx = parseInt(phone.slice(-1), 10) % colors.length;
  return colors[idx];
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLabel, setFilterLabel] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await api.getContacts();
        setContacts(res.contacts);
      } catch (err) {
        console.error("Failed to fetch contacts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.phone_number.includes(search) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase()));
    const matchesLabel =
      filterLabel === "all" || (c.label || "new") === filterLabel;
    return matchesSearch && matchesLabel;
  });

  const handleOpenChat = (phone: string) => {
    router.push(`/conversations?contact=${phone}`);
  };

  // Summary counts
  const totalContacts = contacts.length;
  const withNotes = contacts.filter((c) => c.notes).length;
  const newContacts = contacts.filter(
    (c) => !c.label || c.label === "new",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Contacts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            All customers who have messaged your WhatsApp.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-500" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Total</p>
            <p className="text-lg font-bold text-[#0F172A] leading-tight">
              {totalContacts}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
            <MessageCircle size={16} className="text-[#25D366]" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">New</p>
            <p className="text-lg font-bold text-[#0F172A] leading-tight">
              {newContacts}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={16} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-medium">Notes</p>
            <p className="text-lg font-bold text-[#0F172A] leading-tight">
              {withNotes}
            </p>
          </div>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5 flex-1">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none text-[#0F172A] placeholder-gray-400 w-full bg-transparent"
          />
        </div>
        <select
          value={filterLabel}
          onChange={(e) => setFilterLabel(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 outline-none cursor-pointer"
        >
          <option value="all">All Labels</option>
          {Object.entries(LABEL_CONFIG).map(([key, cfg]) => (
            <option key={key} value={key}>
              {cfg.label}
            </option>
          ))}
        </select>
      </div>

      {/* Contacts list */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-gray-400" />
            <span className="text-sm font-medium text-[#0F172A]">
              {loading
                ? "Loading..."
                : `${filtered.length} contact${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col divide-y divide-gray-50">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-4 sm:px-6 py-4"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-32 mb-2" />
                  <div className="h-2.5 bg-gray-100 rounded animate-pulse w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Users size={28} className="text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No contacts found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((contact) => {
              const labelKey = contact.label || "new";
              const labelCfg = LABEL_CONFIG[labelKey] || LABEL_CONFIG.new;
              const initials = getInitials(contact.phone_number, contact.name);
              const avatarColor = getAvatarColor(contact.phone_number);

              return (
                <div
                  key={contact.id}
                  onClick={() => handleOpenChat(contact.phone_number)}
                  className="flex items-center gap-4 px-4 sm:px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold text-white shrink-0`}
                  >
                    {initials}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[14px] font-semibold text-[#0F172A] truncate">
                        {contact.name || "Unknown"}
                      </p>
                      {/* Notes dot */}
                      {contact.notes && (
                        <span className="text-[10px] bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                          📝 Notes
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Phone size={11} className="text-gray-400 shrink-0" />
                      <p className="text-[12px] text-gray-500">
                        {contact.phone_number}
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${labelCfg.color} ${labelCfg.bg}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${labelCfg.dot}`}
                      />
                      {labelCfg.label}
                    </span>
                    <p className="text-[11px] text-gray-400">
                      {formatDateTime(contact.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
