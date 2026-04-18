"use client";

import { useEffect, useRef, useState } from "react";
import { api, Message, Contact } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Send,
  ArrowLeft,
  Trash2,
  ChevronDown,
  Plus,
  X,
  Reply,
  Copy,
  Star,
  ChevronRight,
  Search,
} from "lucide-react";

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

// WhatsApp-style subtle chat background
const CHAT_BG = `
  bg-[#efeae2]
  [background-image:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c9b8' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")]
`;

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

export default function ConversationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(
    null,
  );
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesText, setNotesText] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({});
  const [newConvoOpen, setNewConvoOpen] = useState(false);
  const [newConvoPhone, setNewConvoPhone] = useState("");
  const [newConvoMessage, setNewConvoMessage] = useState("");
  const [sendingNew, setSendingNew] = useState(false);
  const [newConvoError, setNewConvoError] = useState("");
  const [starredMessages, setStarredMessages] = useState<Set<string>>(
    new Set(),
  );
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuJustOpenedRef = useRef(false);

  const isAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return true;
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight < 80
    );
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  const fetchMessages = async (silent = false) => {
    const wasAtBottom = isAtBottom();
    try {
      if (!silent) setLoading(true);
      const res = await api.getMessages();
      setMessages(res.messages);
      if (silent && wasAtBottom) setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const res = await api.getContacts();
      setContacts(res.contacts);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contactPhone = params.get("contact");
    if (contactPhone) setSelectedContact(contactPhone);
    fetchMessages();
    fetchContacts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContact)
      setTimeout(() => scrollToBottom("instant" as ScrollBehavior), 50);
  }, [selectedContact]);

  useEffect(() => {
    if (!loading && selectedContact)
      setTimeout(() => scrollToBottom("instant" as ScrollBehavior), 50);
  }, [loading]);

  useEffect(() => {
    const handler = () => {
      if (menuJustOpenedRef.current) {
        menuJustOpenedRef.current = false;
        return;
      }
      setActiveMessageMenu(null);
      setLabelMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const contactMap = new Map<string, Message[]>();
  messages.forEach((msg) => {
    const phone = msg.contacts?.phone_number;
    if (!phone) return;
    if (!contactMap.has(phone)) contactMap.set(phone, []);
    contactMap.get(phone)!.push(msg);
  });

  const contactList = Array.from(contactMap.entries());
  const filteredContactList = searchQuery
    ? contactList.filter(([phone, msgs]) => {
        const cd = getContactData(phone);
        const name = cd?.name || phone;
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          phone.includes(searchQuery)
        );
      })
    : contactList;

  const selectedMessages = selectedContact
    ? contactMap.get(selectedContact) || []
    : [];

  function getContactData(phone: string) {
    return contacts.find((c) => c.phone_number === phone);
  }

  const selectedContactData = selectedContact
    ? getContactData(selectedContact)
    : null;

  const getCurrentNotes = () => {
    if (!selectedContact) return "";
    if (localNotes[selectedContact] !== undefined)
      return localNotes[selectedContact];
    return selectedContactData?.notes || "";
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedContact) return;
    setSending(true);
    try {
      await api.sendMessage(selectedContact, replyText);
      setReplyText("");
      setReplyingTo(null);
      await fetchMessages(true);
      setTimeout(() => scrollToBottom("smooth"), 50);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = async () => {
    if (!newConvoPhone.trim() || !newConvoMessage.trim()) {
      setNewConvoError("Both phone number and message are required.");
      return;
    }
    setSendingNew(true);
    setNewConvoError("");
    try {
      let phone = newConvoPhone.trim().replace(/\s+/g, "");
      if (phone.startsWith("0")) phone = "254" + phone.slice(1);
      if (phone.startsWith("+")) phone = phone.slice(1);
      await api.sendMessage(phone, newConvoMessage);
      setNewConvoOpen(false);
      setNewConvoPhone("");
      setNewConvoMessage("");
      setSelectedContact(phone);
      await fetchMessages(true);
    } catch (err: any) {
      setNewConvoError(
        err.message || "Failed to send. Make sure the number is correct.",
      );
    } finally {
      setSendingNew(false);
    }
  };

  const handleDeleteMessage = async (
    messageId: string,
    deleteForEveryone: boolean,
  ) => {
    try {
      await api.deleteMessage(messageId, deleteForEveryone);
      setActiveMessageMenu(null);
      await fetchMessages(true);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleLabelChange = async (label: string) => {
    if (!selectedContactData) return;
    try {
      await api.updateContact(selectedContactData.id, { label });
      setLabelMenuOpen(false);
      await fetchContacts();
    } catch (err) {
      console.error("Failed to update label:", err);
    }
  };

  const openNotes = () => {
    setNotesText(getCurrentNotes());
    setNotesOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedContactData || !selectedContact) return;
    setSavingNotes(true);
    try {
      await api.updateContact(selectedContactData.id, { notes: notesText });
      setLocalNotes((prev) => ({ ...prev, [selectedContact]: notesText }));
      setNotesOpen(false);
      await fetchContacts();
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setActiveMessageMenu(null);
  };

  const handleStarMessage = (msgId: string) => {
    setStarredMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
    setActiveMessageMenu(null);
  };

  const handleReplyTo = (msg: Message) => {
    setReplyingTo(msg);
    setActiveMessageMenu(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const currentLabel = selectedContactData?.label || "new";
  const currentLabelCfg = LABEL_CONFIG[currentLabel] || LABEL_CONFIG.new;
  const currentNotes = getCurrentNotes();

  // Format time only (e.g. "8:27 pm")
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString("en-KE", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return formatDateTime(dateStr);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)] -m-4 sm:-m-6 overflow-hidden">
      {/* ── Sidebar ── */}
      <div
        className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-[320px] bg-white border-r border-gray-200 flex-col h-full`}
      >
        {/* Sidebar header */}
        <div className="px-4 py-3 bg-[#f0f2f5] border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-[#111b21]">Chats</h2>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNewConvoOpen(true);
              }}
              className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center transition-colors shadow-sm"
              title="New conversation"
            >
              <Plus size={15} className="text-white" />
            </button>
          </div>
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm outline-none text-[#111b21] placeholder-gray-400 bg-transparent"
            />
          </div>
        </div>

        {/* Contact list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-24 mb-2" />
                    <div className="h-2.5 bg-gray-100 rounded animate-pulse w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredContactList.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">
              No conversations yet.
            </p>
          ) : (
            filteredContactList.map(([phone, msgs]) => {
              const last = msgs[msgs.length - 1];
              const contactData = getContactData(phone);
              const labelKey = contactData?.label || "new";
              const labelCfg = LABEL_CONFIG[labelKey] || LABEL_CONFIG.new;
              const initials = getInitials(phone, contactData?.name);
              const avatarColor = getAvatarColor(phone);
              const isSelected = selectedContact === phone;
              return (
                <button
                  key={phone}
                  onClick={() => setSelectedContact(phone)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-[#f5f6f6] transition-colors flex items-center gap-3 ${isSelected ? "bg-[#f0f2f5]" : ""}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-xs font-semibold text-white shrink-0`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-[#111b21] truncate">
                        {contactData?.name || phone}
                      </p>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <p className="text-[11px] text-gray-400">
                          {formatTime(last?.created_at)}
                        </p>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${labelCfg.color} ${labelCfg.bg}`}
                        >
                          {labelCfg.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-500 truncate mt-0.5">
                      {last?.deleted_for_everyone
                        ? "🚫 This message was deleted"
                        : last?.content}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── New Conversation Modal ── */}
      {newConvoOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setNewConvoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[#111b21]">
                New Conversation
              </h3>
              <button
                onClick={() => setNewConvoOpen(false)}
                className="text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={newConvoPhone}
                  onChange={(e) => setNewConvoPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  placeholder="Type your first message..."
                  value={newConvoMessage}
                  onChange={(e) => setNewConvoMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 transition-all resize-none"
                  rows={3}
                />
              </div>
              {newConvoError && (
                <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                  {newConvoError}
                </p>
              )}
              <button
                onClick={handleStartNewConversation}
                disabled={
                  sendingNew || !newConvoPhone.trim() || !newConvoMessage.trim()
                }
                className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
              >
                {sendingNew ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Chat Area ── */}
      <div
        className={`${selectedContact ? "flex" : "hidden md:flex"} flex-1 flex-col overflow-hidden`}
      >
        {!selectedContact ? (
          <div
            className={`flex-1 flex flex-col items-center justify-center ${CHAT_BG}`}
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 text-center shadow-sm max-w-xs">
              <div className="w-14 h-14 bg-[#25D366]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-[#25D366]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.522 5.855L.057 23.25a.75.75 0 0 0 .92.92l5.395-1.465A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.653-.497-5.184-1.367l-.372-.214-3.854 1.047 1.046-3.854-.214-.372A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
              </div>
              <p className="text-[#111b21] font-semibold text-sm mb-1">
                Convyr Conversations
              </p>
              <p className="text-gray-500 text-xs">
                Select a chat to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 py-2.5 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-1 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={18} />
                </button>
                <div
                  className={`w-9 h-9 rounded-full ${getAvatarColor(selectedContact)} flex items-center justify-center text-xs font-semibold text-white shrink-0`}
                >
                  {getInitials(selectedContact, selectedContactData?.name)}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111b21] leading-tight">
                    {selectedContactData?.name || selectedContact}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {selectedMessages.length} messages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Notes button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openNotes();
                  }}
                  className={`text-xs border rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1.5 font-medium ${
                    currentNotes
                      ? "text-amber-700 border-amber-300 bg-amber-50"
                      : "text-gray-500 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  📝 Notes
                  {currentNotes && (
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  )}
                </button>

                {/* Label dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLabelMenuOpen((p) => !p);
                    }}
                    className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${currentLabelCfg.color} ${currentLabelCfg.bg} border-transparent`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${currentLabelCfg.dot}`}
                    />
                    {currentLabelCfg.label}
                    <ChevronDown size={11} />
                  </button>
                  {labelMenuOpen && (
                    <div
                      className="absolute right-0 top-9 bg-white border border-gray-100 rounded-xl shadow-xl z-50 min-w-44 py-1.5 overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.entries(LABEL_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => handleLabelChange(key)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 ${cfg.color}`}
                        >
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes panel */}
            {notesOpen && (
              <div className="px-4 py-3 border-b border-amber-200 bg-amber-50/80 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                    📝 Private notes — only visible to you
                  </p>
                  <button
                    onClick={() => setNotesOpen(false)}
                    className="text-amber-400 hover:text-amber-600"
                  >
                    <X size={14} />
                  </button>
                </div>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="e.g. Prefers blue items, usually orders on Fridays, referred by John..."
                  className="w-full text-sm border border-amber-200 rounded-xl px-3 py-2.5 outline-none focus:border-amber-400 bg-white resize-none placeholder-amber-300"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </button>
                  <button
                    onClick={() => setNotesOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className={`flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1 ${CHAT_BG}`}
            >
              {selectedMessages.map((msg, idx) => {
                const isOut = msg.direction === "outbound";
                const isDeleted = msg.deleted_for_everyone;
                const isStarred = starredMessages.has(msg.id);
                const showMenu = activeMessageMenu === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOut ? "justify-end" : "justify-start"} group px-2`}
                  >
                    {/* Inbound menu trigger — appears left of bubble on hover */}
                    {!isOut && !isDeleted && (
                      <div className="flex items-end mb-1 mr-1 opacity-0 group-hover:opacity-100 transition-opacity relative self-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            menuJustOpenedRef.current = !showMenu;
                            setActiveMessageMenu(showMenu ? null : msg.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full shadow-sm"
                        >
                          <ChevronDown size={14} />
                        </button>
                        {showMenu && (
                          <div
                            className="absolute bottom-8 left-0 bg-white rounded-xl shadow-2xl z-50 min-w-44 py-1.5 border border-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleReplyTo(msg)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Reply size={14} className="text-gray-400" />{" "}
                              Reply
                            </button>
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Copy size={14} className="text-gray-400" /> Copy
                            </button>
                            <button
                              onClick={() => handleStarMessage(msg.id)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Star
                                size={14}
                                className={
                                  isStarred
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-400"
                                }
                              />
                              {isStarred ? "Unstar" : "Star"}
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleDeleteMessage(msg.id, false)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-500 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Trash2 size={14} className="text-gray-400" />{" "}
                              Delete for me
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className={`relative max-w-[72%] sm:max-w-md px-3 py-2 text-[14px] shadow-sm ${
                        isDeleted
                          ? "bg-gray-100 text-gray-400 italic rounded-xl"
                          : isOut
                            ? "bg-[#d9fdd3] text-[#111b21] rounded-tl-2xl rounded-tr-sm rounded-bl-2xl rounded-br-2xl"
                            : "bg-white text-[#111b21] rounded-tl-sm rounded-tr-2xl rounded-bl-2xl rounded-br-2xl"
                      }`}
                    >
                      {/* Bubble tail */}
                      {!isDeleted && isOut && (
                        <span className="absolute -right-1.5 bottom-2 w-0 h-0 border-l-[6px] border-l-[#d9fdd3] border-t-[6px] border-t-transparent border-b-[0px]" />
                      )}
                      {!isDeleted && !isOut && (
                        <span className="absolute -left-1.5 bottom-2 w-0 h-0 border-r-[6px] border-r-white border-t-[6px] border-t-transparent border-b-[0px]" />
                      )}

                      <p className="leading-snug break-words">
                        {isDeleted
                          ? "🚫 This message was deleted."
                          : msg.content}
                      </p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {isStarred && (
                          <Star
                            size={10}
                            className="text-amber-400 fill-amber-400"
                          />
                        )}
                        <p className="text-[11px] text-gray-400">
                          {formatTime(msg.created_at)}
                        </p>
                        {isOut && !isDeleted && (
                          <svg
                            viewBox="0 0 18 18"
                            className="w-3.5 h-3.5 fill-[#53bdeb]"
                          >
                            <path d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076L8.277 15.043a.434.434 0 0 1-.627.039l-.367-.348a.434.434 0 0 0-.626.034l-.503.566a.434.434 0 0 0 .034.626l1.294 1.226a.434.434 0 0 0 .632-.045L17.47 5.644a.434.434 0 0 0-.076-.609z" />
                            <path d="M13.393 5.035l-.57-.444a.434.434 0 0 0-.609.076L4.277 15.043a.434.434 0 0 1-.627.039l-2.365-2.24a.434.434 0 0 0-.626.034l-.503.566a.434.434 0 0 0 .034.626l3.298 3.123a.434.434 0 0 0 .632-.045L13.469 5.644a.434.434 0 0 0-.076-.609z" />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Outbound menu trigger — appears right of bubble on hover */}
                    {isOut && !isDeleted && (
                      <div className="flex items-end mb-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity relative self-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            menuJustOpenedRef.current = !showMenu;
                            setActiveMessageMenu(showMenu ? null : msg.id);
                          }}
                          className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 bg-white/80 hover:bg-white rounded-full shadow-sm"
                        >
                          <ChevronDown size={14} />
                        </button>
                        {showMenu && (
                          <div
                            className="absolute bottom-8 right-0 bg-white rounded-xl shadow-2xl z-50 min-w-44 py-1.5 border border-gray-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => handleReplyTo(msg)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Reply size={14} className="text-gray-400" />{" "}
                              Reply
                            </button>
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Copy size={14} className="text-gray-400" /> Copy
                            </button>
                            <button
                              onClick={() => handleStarMessage(msg.id)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Star
                                size={14}
                                className={
                                  isStarred
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-gray-400"
                                }
                              />
                              {isStarred ? "Unstar" : "Star"}
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleDeleteMessage(msg.id, false)}
                              className="w-full text-left px-4 py-2 text-[13px] text-gray-500 hover:bg-gray-50 flex items-center gap-3"
                            >
                              <Trash2 size={14} className="text-gray-400" />{" "}
                              Delete for me
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg.id, true)}
                              className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-3"
                            >
                              <Trash2 size={14} className="text-red-400" />{" "}
                              Delete for everyone
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply preview bar */}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-3">
                <div className="flex-1 bg-white rounded-lg px-3 py-1.5 border-l-4 border-[#25D366] min-w-0">
                  <p className="text-[11px] font-semibold text-[#25D366] mb-0.5">
                    {replyingTo.direction === "inbound" ? "Customer" : "You"}
                  </p>
                  <p className="text-[12px] text-gray-600 truncate">
                    {replyingTo.content}
                  </p>
                </div>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Input bar */}
            <div className="px-3 py-3 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-2">
              <div className="flex-1 bg-white rounded-full px-4 py-2.5 flex items-center border border-gray-200 shadow-sm">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 text-[14px] outline-none text-[#111b21] placeholder-gray-400 bg-transparent"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || !replyText.trim()}
                className="w-10 h-10 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0"
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
