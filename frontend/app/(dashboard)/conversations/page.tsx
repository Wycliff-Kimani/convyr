"use client";

import { useEffect, useRef, useState } from "react";
import { api, Message, Contact } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Send,
  ArrowLeft,
  Trash2,
  MoreVertical,
  ChevronDown,
  Plus,
  X,
} from "lucide-react";

const LABEL_CONFIG: Record
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: "New", color: "text-blue-600", bg: "bg-blue-50" },
  repeat: { label: "Repeat", color: "text-purple-600", bg: "bg-purple-50" },
  pending_payment: {
    label: "Pending Payment",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  order_in_progress: {
    label: "Order In Progress",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
  },
  done: { label: "Done", color: "text-green-600", bg: "bg-green-50" },
};

export default function ConversationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    if (contactPhone) {
      setSelectedContact(contactPhone);
    }
    fetchMessages();
    fetchContacts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages(true);
    }, 5000);
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
  const selectedMessages = selectedContact
    ? contactMap.get(selectedContact) || []
    : [];
  const getContactData = (phone: string) =>
    contacts.find((c) => c.phone_number === phone);
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
      // Normalize phone number — strip leading 0 and add 254
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
        err.message || "Failed to send. Make sure the number is correct."
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

  const currentLabel = selectedContactData?.label || "new";
  const currentLabelCfg = LABEL_CONFIG[currentLabel] || LABEL_CONFIG.new;
  const currentNotes = getCurrentNotes();

  return (
    <div className="flex h-[calc(100vh-64px-56px)] md:h-[calc(100vh-64px)] gap-4 -m-4 sm:-m-6">
      {/* Contact List */}
      <div
        className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-72 bg-white border-r border-gray-100 flex-col h-full overflow-hidden`}
      >
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A]">
              Conversations
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {contactList.length} contacts
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setNewConvoOpen(true); }}
            className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center transition-colors"
            title="Start new conversation"
          >
            <Plus size={16} className="text-white" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-gray-400 px-4 py-4">Loading...</p>
          ) : contactList.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-4">
              No conversations yet.
            </p>
          ) : (
            contactList.map(([phone, msgs]) => {
              const last = msgs[msgs.length - 1];
              const contactData = getContactData(phone);
              const labelKey = contactData?.label || "new";
              const labelCfg = LABEL_CONFIG[labelKey] || LABEL_CONFIG.new;
              return (
                <button
                  key={phone}
                  onClick={() => setSelectedContact(phone)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedContact === phone ? "bg-green-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 shrink-0">
                      {phone.slice(-2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-sm font-medium text-[#0F172A] truncate">
                          {contactData?.name || phone}
                        </p>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${labelCfg.color} ${labelCfg.bg}`}
                        >
                          {labelCfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {last?.deleted_for_everyone
                          ? "This message was deleted."
                          : last?.content}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {newConvoOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setNewConvoOpen(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#0F172A]">New Conversation</h3>
              <button onClick={() => setNewConvoOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0712345678 or 254712345678"
                  value={newConvoPhone}
                  onChange={(e) => setNewConvoPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Message</label>
                <textarea
                  placeholder="Type your message..."
                  value={newConvoMessage}
                  onChange={(e) => setNewConvoMessage(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors resize-none"
                  rows={3}
                />
              </div>
              {newConvoError && (
                <p className="text-xs text-red-500">{newConvoError}</p>
              )}
              <button
                onClick={handleStartNewConversation}
                disabled={sendingNew || !newConvoPhone.trim() || !newConvoMessage.trim()}
                className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              >
                {sendingNew ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div
        className={`${selectedContact ? "flex" : "hidden md:flex"} flex-1 flex-col bg-white md:rounded-2xl border border-gray-100 overflow-hidden`}
      >
        {!selectedContact ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 sm:px-6 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-1 text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    {selectedContactData?.name || selectedContact}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedMessages.length} messages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openNotes();
                  }}
                  className={`text-xs border rounded-lg px-2 py-1 transition-colors flex items-center gap-1 ${
                    currentNotes
                      ? "text-yellow-700 border-yellow-300 bg-yellow-50"
                      : "text-gray-500 border-gray-200 hover:text-gray-700"
                  }`}
                >
                  Notes
                  {currentNotes && (
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLabelMenuOpen((prev) => !prev);
                    }}
                    className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg border border-transparent transition-colors ${currentLabelCfg.color} ${currentLabelCfg.bg}`}
                  >
                    {currentLabelCfg.label}
                    <ChevronDown size={12} />
                  </button>
                  {labelMenuOpen && (
                    <div
                      className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-40 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {Object.entries(LABEL_CONFIG).map(([key, cfg]) => (
                        <button
                          key={key}
                          onClick={() => handleLabelChange(key)}
                          className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors ${cfg.color}`}
                        >
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
              <div className="px-4 sm:px-6 py-3 border-b border-gray-100 bg-yellow-50">
                <p className="text-xs font-medium text-yellow-700 mb-2">
                  Private notes — only you can see this
                </p>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="e.g. Likes blue items, usually orders on Fridays..."
                  className="w-full text-sm border border-yellow-200 rounded-lg px-3 py-2 outline-none focus:border-yellow-400 bg-white resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {savingNotes ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setNotesOpen(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3"
            >
              {selectedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"} group`}
                >
                  <div className="relative flex items-end gap-1">
                    {msg.direction === "outbound" &&
                      !msg.deleted_for_everyone && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMessageMenu(
                                activeMessageMenu === msg.id ? null : msg.id,
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {activeMessageMenu === msg.id && (
                            <div
                              className="absolute bottom-8 right-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-40 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  handleDeleteMessage(msg.id, false)
                                }
                                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 size={12} /> Delete for me
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMessage(msg.id, true)
                                }
                                className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={12} /> Delete for everyone
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                    <div
                      className={`max-w-[80%] sm:max-w-sm px-4 py-2.5 rounded-2xl text-sm ${
                        msg.deleted_for_everyone
                          ? "bg-gray-100 text-gray-400 italic"
                          : msg.direction === "outbound"
                            ? "bg-[#25D366] text-white rounded-br-sm"
                            : "bg-gray-100 text-[#0F172A] rounded-bl-sm"
                      }`}
                    >
                      <p>
                        {msg.deleted_for_everyone
                          ? "This message was deleted."
                          : msg.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${msg.direction === "outbound" && !msg.deleted_for_everyone ? "text-white/70" : "text-gray-400"}`}
                      >
                        {formatDateTime(msg.created_at)}
                      </p>
                    </div>

                    {msg.direction === "inbound" &&
                      !msg.deleted_for_everyone && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMessageMenu(
                                activeMessageMenu === msg.id ? null : msg.id,
                              );
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {activeMessageMenu === msg.id && (
                            <div
                              className="absolute bottom-8 left-0 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-40 py-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() =>
                                  handleDeleteMessage(msg.id, false)
                                }
                                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 size={12} /> Delete for me
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Reply bar */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center gap-3">
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
                className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-50 text-white p-2.5 rounded-lg transition-colors shrink-0"
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