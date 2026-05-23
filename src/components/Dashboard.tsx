"use client";
import { useEffect, useState } from "react";
import { FEEDS } from "@/lib/feeds";
import { RefreshCw, MapPin, Wifi, Eye } from "lucide-react";
import clsx from "clsx";

interface Stats {
  total: number; local: number; remote: number;
  saved: number; applied: number; interview: number;
  feedLog: { feed: string; last_fetch: number; count: number }[];
}

interface Props {
  setView: (v: string) => void;
  onAdd: () => void;
  refreshKey: number;
}

export default function Dashboard({ setView, onAdd, refreshKey }: Props) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetchingAll, setFetchingAll] = useState(false);

  async function loadStats() {
    const res = await fetch("/api/stats");
    const data = await res.json();
    setStats(data);
  }

  useEffect(() => { loadStats(); }, [refreshKey]);

  async function fetchAll() {
    setFetchingAll(true);
    const remote = FEEDS.filter(f => f.type === "remote");
    await Promise.all(remote.map(f => fetch(`/api/fetch/${f.key}`, { method: "POST" })));
    await loadStats();
    setFetchingAll(false);
  }

  const KPI = ({ label, value, color }: { label: string; value: number | string; color?: string }) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">{label}</div>
      <div className={clsx("text-4xl font-serif leading-none mb-1", color || "text-zinc-900 dark:text-zinc-100")}>{value ?? "—"}</div>
    </div>
  );

  return (
    <div>
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <KPI label="Total" value={stats?.total ?? "—"} />
        <KPI label="Local Egypt" value={stats?.local ?? "—"} color="text-amber-500" />
        <KPI label="Remote" value={stats?.remote ?? "—"} color="text-teal-500" />
        <KPI label="Saved" value={stats?.saved ?? "—"} color="text-emerald-500" />
        <KPI label="Applied" value={stats?.applied ?? "—"} color="text-blue-500" />
        <KPI label="Interviews" value={stats?.interview ?? "—"} color="text-violet-500" />
      </div>

      {/* Egypt local feeds */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Egypt Local Feeds</h2>
        <button onClick={onAdd} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-all">
          + Add Local Job
        </button>
      </div>
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-3 text-sm mb-4 leading-relaxed flex items-start gap-2">
        <MapPin size={15} className="mt-0.5 flex-shrink-0" />
        <span>
          Egypt-local boards (Wuzzuf, Bayt, LinkedIn, Tanqeeb) are scraped server-side — no browser CORS issues.
          Each feed page has an <strong>Auto-fetch</strong> button, or add jobs manually with <strong>Add Local Job</strong>.
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {FEEDS.filter(f => f.type === "local").map(f => {
          const log = stats?.feedLog?.find(l => l.feed === f.key);
          return (
            <div key={f.key} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{f.label}</span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <MapPin size={11} />
                  <span>{log ? `${log.count} jobs` : "Not fetched"}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-4">{f.sources.join(" · ")}</p>
              <div className="flex gap-2">
                <button onClick={() => fetch(`/api/fetch/${f.key}`, { method: "POST" }).then(loadStats)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <RefreshCw size={12} /> Auto-fetch
                </button>
                <button onClick={() => setView(f.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <Eye size={12} /> View
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Remote feeds */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Remote Auto Feeds</h2>
        <button onClick={fetchAll} disabled={fetchingAll}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all">
          <RefreshCw size={14} className={clsx(fetchingAll && "animate-spin")} /> Refresh All Remote
        </button>
      </div>
      <div className="bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl px-4 py-3 text-sm mb-4 leading-relaxed flex items-start gap-2">
        <Wifi size={15} className="mt-0.5 flex-shrink-0" />
        <span>Live from <strong>Jobicy</strong>, <strong>Remotive</strong>, and <strong>Arbeitnow</strong> — free, no API key, CORS-safe via server-side fetch. Matches Sara's operations, marketing, and SEO profile.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEEDS.filter(f => f.type === "remote").map(f => {
          const log = stats?.feedLog?.find(l => l.feed === f.key);
          return (
            <div key={f.key} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{f.label}</span>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Wifi size={11} />
                  <span>{log ? `${log.count} jobs` : "Not fetched"}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mb-4">{f.sources.join(" · ")}</p>
              <div className="flex gap-2">
                <button onClick={() => fetch(`/api/fetch/${f.key}`, { method: "POST" }).then(loadStats)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <RefreshCw size={12} /> Refresh
                </button>
                <button onClick={() => setView(f.key)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  <Eye size={12} /> View
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
