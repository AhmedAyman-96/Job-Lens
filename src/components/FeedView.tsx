"use client";
import { useEffect, useState, useCallback } from "react";
import { Job } from "@/types/job";
import { FEED_MAP } from "@/lib/feeds";
import JobCard from "./JobCard";
import { RefreshCw, MapPin, Inbox } from "lucide-react";
import clsx from "clsx";

interface Props {
  feedKey: string;
  onAddJob?: () => void;
}

const FILTERS = ["All", "Saved", "Applied"] as const;

export default function FeedView({ feedKey, onAddJob }: Props) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState<"All" | "Saved" | "Applied">("All");
  const [search, setSearch] = useState("");
  const feed = FEED_MAP[feedKey];

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ feed: feedKey, filter, search });
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setLoading(false);
  }, [feedKey, filter, search]);

  useEffect(() => { load(); }, [load]);

  async function fetchFeed() {
    setFetching(true);
    await fetch(`/api/fetch/${feedKey}`, { method: "POST" });
    await load();
    setFetching(false);
  }

  async function handleSave(id: number, saved: boolean) {
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saved: saved ? 1 : 0 }) });
    setJobs(js => js.map(j => j.id === id ? { ...j, saved: saved ? 1 : 0 } : j));
  }

  async function handleCycle(id: number, status: string) {
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setJobs(js => js.map(j => j.id === id ? { ...j, status: status as any } : j));
  }

  async function handleDelete(id: number) {
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    setJobs(js => js.filter(j => j.id !== id));
  }

  return (
    <div>
      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl px-4 py-3 text-sm mb-5 leading-relaxed">
        <MapPin size={15} className="mt-0.5 flex-shrink-0" />
        <span>Egypt jobs from <strong>LinkedIn</strong> and <strong>Wuzzuf</strong>. Click <strong>Auto-fetch</strong> to refresh, or add jobs manually.</span>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap items-center">
        <input
          className="flex-1 min-w-40 max-w-xs px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          placeholder="Search title, company…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={clsx("px-3 py-1.5 rounded-full text-sm border transition-all",
              filter === f ? "bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-400" : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800")}>
            {f}
          </button>
        ))}
        {onAddJob && (
          <button onClick={onAddJob} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-all">
            + Add Job
          </button>
        )}
        <button onClick={fetchFeed} disabled={fetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-all">
          <RefreshCw size={14} className={clsx(fetching && "animate-spin")} />
          Auto-fetch
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mb-2" />
              <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-1/3 mb-4" />
              <div className="h-5 bg-zinc-100 dark:bg-zinc-700 rounded-full w-24" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 text-zinc-400">
          <Inbox size={48} className="mx-auto mb-4 opacity-25" />
          <h3 className="font-semibold text-lg text-zinc-700 dark:text-zinc-300 mb-2">No jobs found</h3>
          <p className="text-sm max-w-xs mx-auto leading-relaxed">
            Click Auto-fetch to pull the latest jobs from LinkedIn and Wuzzuf.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map(j => (
            <JobCard key={j.id} job={j} onSave={handleSave} onCycle={handleCycle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
