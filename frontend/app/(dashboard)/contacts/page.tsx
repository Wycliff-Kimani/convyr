"use client";

import { useEffect, useState } from "react";
import { api, Contact } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Users, Search } from "lucide-react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

  const filtered = contacts.filter(
    (c) =>
      c.phone_number.includes(search) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Contacts
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            All customers who have messaged your WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-auto">
          <Search size={14} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm outline-none text-[#0F172A] placeholder-gray-400 w-full sm:w-48"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Users size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-[#0F172A]">
            {loading ? "Loading..." : `${filtered.length} contacts`}
          </span>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-sm text-gray-400">
            Loading contacts...
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-400">
            No contacts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Phone Number
                  </th>
                  <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide hidden sm:table-cell">
                    First Seen
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-xs font-medium text-[#25D366] shrink-0">
                          {contact.phone_number.slice(-2)}
                        </div>
                        <span className="text-sm font-medium text-[#0F172A] truncate">
                          {contact.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">
                      {contact.phone_number}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {formatDateTime(contact.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
