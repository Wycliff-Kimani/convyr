"use client";

import { useEffect, useState } from "react";
import { api, Automation, CreateAutomationInput } from "@/lib/api";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight, Edit3, Save, X } from "lucide-react";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateAutomationInput>({
    name: "",
    trigger_type: "contains_keyword",
    keyword: "",
    response: "",
    is_active: true,
  });

  const fetchAutomations = async () => {
    try {
      const res = await api.getAutomations();
      // Ensure we have a clean array even if API returns undefined/null
      setAutomations(res.automations || []);
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleSave = async () => {
    if (!form.name || !form.response) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.updateAutomation(editingId, form);
      } else {
        await api.createAutomation(form);
      }
      resetForm();
      await fetchAutomations();
    } catch (err) {
      console.error("Failed to save automation:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      trigger_type: "contains_keyword",
      keyword: "",
      response: "",
      is_active: true,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (automation: Automation) => {
    setForm({
      name: automation.name,
      trigger_type: automation.trigger_type,
      keyword: automation.keyword || "",
      response: automation.response,
      is_active: automation.is_active,
    });
    setEditingId(automation.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggle = async (automation: Automation) => {
    try {
      await api.updateAutomation(automation.id, {
        is_active: !automation.is_active,
      });
      await fetchAutomations();
    } catch (err) {
      console.error("Failed to toggle automation:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this automation? This action cannot be undone.")) return;
    try {
      await api.deleteAutomation(id);
      await fetchAutomations();
    } catch (err) {
      console.error("Failed to delete automation:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
            Automations
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create "Robots" that respond to your customers instantly.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Rule</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#25D366]/20 shadow-sm p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">
              {editingId ? "Edit Automation Rule" : "Create New Rule"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Rule Name (For you)
              </label>
              <input
                type="text"
                placeholder="e.g. Price Inquiry Bot"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                When should this trigger?
              </label>
              <select
                value={form.trigger_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    trigger_type: e.target.value as
                      | "any_message"
                      | "contains_keyword",
                  })
                }
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all bg-white"
              >
                <option value="contains_keyword">When message contains a keyword</option>
                <option value="any_message">Every incoming message</option>
              </select>
            </div>

            {form.trigger_type === "contains_keyword" && (
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Keyword (What should the customer say?)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. price, order, delivery"
                    value={form.keyword}
                    onChange={(e) =>
                      setForm({ ...form, keyword: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                    Not case sensitive
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Instant Response (What the bot will send back)
              </label>
              <textarea
                placeholder="Hi! Our prices are KES 1000..."
                value={form.response}
                onChange={(e) => setForm({ ...form, response: e.target.value })}
                rows={4}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name || !form.response}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#25D366]/20 transition-all"
            >
              {saving ? "Saving..." : editingId ? "Update Rule" : "Launch Rule"}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-[#25D366]" />
            <span className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">
              {loading ? "Loading..." : `${automations.length} Active Rules`}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-gray-400">Fetching your rules...</p>
          </div>
        ) : automations.length === 0 ? (
          <div className="px-6 py-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Zap size={24} className="text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-600">No automation rules yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">Create your first rule to start saving time. For example, a rule to answer "How much?".</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-6 text-[#25D366] font-bold text-sm hover:underline"
            >
              + Create your first rule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="group px-4 sm:px-6 py-5 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${automation.is_active ? 'bg-green-50' : 'bg-gray-100'}`}>
                      <Zap size={14} className={automation.is_active ? 'text-[#25D366]' : 'text-gray-400'} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0F172A]">
                        {automation.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          automation.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {automation.is_active ? 'Online' : 'Paused'}
                        </span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-[10px] font-medium text-gray-400">
                          {automation.trigger_type === "contains_keyword"
                            ? `IF MESSAGE HAS: "${automation.keyword}"`
                            : "TRIGGERS ON EVERY MESSAGE"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-100 rounded-xl p-3 mt-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Your Auto-Reply:</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      "{automation.response}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 self-center">
                  <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => handleEdit(automation)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all"
                      title="Edit Rule"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(automation.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggle(automation)}
                    className="transition-transform active:scale-95"
                  >
                    {automation.is_active ? (
                      <ToggleRight size={32} className="text-[#25D366]" />
                    ) : (
                      <ToggleLeft size={32} className="text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
    </div>
  );
}
