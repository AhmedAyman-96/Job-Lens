"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { FEEDS } from "@/lib/feeds";

interface Props {
  open: boolean;
  defaultFeed?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function AddJobModal({ open, defaultFeed = "local-ops", onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", location: "Egypt",
    feed: defaultFeed, source: "Wuzzuf", link: "", notes: "",
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.company) return;
    setLoading(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setForm({ title: "", company: "", location: "Egypt", feed: defaultFeed, source: "Wuzzuf", link: "", notes: "" });
    onSaved();
    onClose();
  }

  if (!open) return null;

  const localFeeds = FEEDS.filter(f => f.type === "local");

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Add Local Job</h2>
          <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        <div className="text-sm text-teal-600 dark:text-teal-400 bg-teal-500/10 rounded-xl p-3 mb-5 leading-relaxed">
          💡 Find jobs on <strong>Wuzzuf</strong>, <strong>Bayt</strong>, <strong>LinkedIn</strong>, or <strong>Tanqeeb</strong> — paste the details here to track them.
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Job Title *</label>
            <input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100"
              value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Operations Manager" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Company *</label>
            <input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100"
              value={form.company} onChange={e => set("company", e.target.value)} placeholder="e.g. XonTel Technology" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Location</label>
            <input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100"
              value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Alexandria, Egypt" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Category</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100"
              value={form.feed} onChange={e => set("feed", e.target.value)}>
              {localFeeds.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Source</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 text-zinc-900 dark:text-zinc-100"
              value={form.source} onChange={e => set("source", e.target.value)}>
              {["Wuzzuf","Bayt","LinkedIn","Tanqeeb","Other"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Apply Link (URL)</label>
            <input type="url" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100"
              value={form.link} onChange={e => set("link", e.target.value)} placeholder="https://wuzzuf.net/jobs/..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Notes / Salary</label>
            <input className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100"
              value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="e.g. EGP 30k, deadline Jun 10…" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg text-sm bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50">
              {loading ? "Saving…" : "Save Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
