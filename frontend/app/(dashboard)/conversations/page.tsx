"use client";

import { useEffect, useState } from "react";
import { api, Message } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

export default function ConversationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.getMessages();
        setMessages(res.messages);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  // Group messages by contact phone number
  const contactMap = new Map<string, Message[]>();
  messages.forEach((msg) => {
    const phone = msg.contacts?.phone_number;
    if (!phone) return;
    if (!contactMap.has(phone)) contactMap.set(phone, []);
    contactMap.get(phone)!.push(msg);
  });

  const contacts = Array.from(contactMap.entries());
  const selectedMessages = selectedContact
    ? contactMap.get(selectedContact) || []
    : [];

  const handleSend = async () => {
    if (!replyText.trim() || !selectedContact) return;
    setSending(true);
    try {
      await api.sendMessage(selectedContact, replyText);
      setReplyText("");
      const res = await api.getMessages();
      setMessages(res.messages);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-full gap-4 -m-6">
      {/* Contact List */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col h-full overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[#0F172A]">
            Conversations
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {contacts.length} contacts
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 px-4 py-4">Loading...</p>
          ) : contacts.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-4">
              No conversations yet.
            </p>
          ) : (
            contacts.map(([phone, msgs]) => {
              const last = msgs[msgs.length - 1];
              return (
                <button
                  key={phone}
                  onClick={() => setSelectedContact(phone)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    selectedContact === phone ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                      {phone.slice(-2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#0F172A] truncate">
                        {phone}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {last?.content}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm font-semibold text-[#0F172A]">
                {selectedContact}
              </p>
              <p className="text-xs text-gray-400">
                {selectedMessages.length} messages
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                      msg.direction === "outbound"
                        ? "bg-[#25D366] text-white rounded-br-sm"
                        : "bg-gray-100 text-[#0F172A] rounded-bl-sm"
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${msg.direction === "outbound" ? "text-white/70" : "text-gray-400"}`}
                    >
                      {formatDateTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
