"use client";

import { useEffect, useState } from "react";
import { api, Automation, CreateAutomationInput } from "@/lib/api";
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
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
      setAutomations(res.automations);
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.response) return;
    setSaving(true);
    try {
      await api.createAutomation(form);
      setForm({
        name: "",
        trigger_type: "contains_keyword",
        keyword: "",
        response: "",
        is_active: true,
      });
      setShowForm(false);
      await fetchAutomations();
    } catch (err) {
      console.error("Failed to create automation:", err);
    } finally {
      setSaving(false);
    }
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
    if (!confirm("Delete this automation?")) return;
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
          <h1 className="text-2xl font-bold text-[#0F172A]">Automations</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your auto-reply rules.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Rule
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-[#0F172A]">
            New Automation Rule
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Rule Name
              </label>
              <input
                type="text"
                placeholder="e.g. Greeting - hi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Trigger Type
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
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
              >
                <option value="contains_keyword">Contains Keyword</option>
                <option value="any_message">Any Message</option>
              </select>
            </div>
            {form.trigger_type === "contains_keyword" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">
                  Keyword
                </label>
                <input
                  type="text"
                  placeholder="e.g. order"
                  value={form.keyword}
                  onChange={(e) =>
                    setForm({ ...form, keyword: e.target.value })
                  }
                  className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors"
                />
              </div>
            )}
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-sm font-medium text-[#0F172A]">
                Response
              </label>
              <textarea
                placeholder="What should the bot reply?"
                value={form.response}
                onChange={(e) => setForm({ ...form, response: e.target.value })}
                rows={3}
                className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#25D366] transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : "Save Rule"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Zap size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-[#0F172A]">
            {loading ? "Loading..." : `${automations.length} rules`}
          </span>
        </div>
        {loading ? (
          <div className="px-6 py-8 text-sm text-gray-400">
            Loading automations...
          </div>
        ) : automations.length === 0 ? (
          <div className="px-6 py-8 text-sm text-gray-400">
            No automation rules yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {automations.map((automation) => (
              <div
                key={automation.id}
                className="px-6 py-4 flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-[#0F172A]">
                      {automation.name}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        automation.is_active
                          ? "bg-green-50 text-[#25D366]"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {automation.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">
                    {automation.trigger_type === "contains_keyword"
                      ? `Keyword: "${automation.keyword}"`
                      : "Triggers on any message"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {automation.response}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(automation)}
                    className="text-gray-400 hover:text-[#25D366] transition-colors"
                  >
                    {automation.is_active ? (
                      <ToggleRight size={22} className="text-[#25D366]" />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(automation.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
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
