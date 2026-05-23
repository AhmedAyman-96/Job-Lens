"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import FeedView from "@/components/FeedView";
import AddJobModal from "@/components/AddJobModal";
import JobCard from "@/components/JobCard";
import { useEffect } from "react";
import { Job } from "@/types/job";
import { Bookmark, Send, Inbox } from "lucide-react";

const VIEW_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  "local-ops": "Ops Manager — Egypt",
  "local-seo": "Digital Growth & SEO — Egypt",
  saved: "Saved Jobs",
  applied: "Applied",
};

export default function Home() {
  const [view, setView] = useState("dashboard");
  const [addOpen, setAddOpen] = useState(false);
  const [addFeed, setAddFeed] = useState("local-ops");
  const [savedCount, setSavedCount] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // saved count
  useEffect(() => {
    fetch("/api/jobs?filter=Saved").then(r => r.json()).then(d => setSavedCount((d.jobs || []).length));
  }, [refreshKey]);

  function openAdd(feed = "local-ops") {
    setAddFeed(feed);
    setAddOpen(true);
  }

  const FEED_VIEWS = ["local-ops","local-seo"];

  return (
    <div className="flex min-h-screen">
      <Sidebar view={view} setView={setView} savedCount={savedCount} />

      <div className="ml-60 flex-1 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-serif font-normal text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
            {VIEW_TITLES[view] || view}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => openAdd("local-ops")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition-all">
              + Add Local Job
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 flex-1">
          {view === "dashboard" && (
            <Dashboard setView={setView} onAdd={() => openAdd("local-ops")} refreshKey={refreshKey} />
          )}
          {FEED_VIEWS.includes(view) && (
            <FeedView key={view} feedKey={view} onAddJob={() => openAdd(view)} />
          )}
          {view === "saved" && <PipelineView filter="Saved" icon={<Bookmark size={48} />} emptyMsg="Bookmark any job card to save it here." onRefresh={() => setRefreshKey(k => k+1)} />}
          {view === "applied" && <PipelineView filter="Applied" icon={<Send size={48} />} emptyMsg="Cycle any job's status to Applied to track it here." onRefresh={() => setRefreshKey(k => k+1)} />}
        </main>
      </div>

      <AddJobModal
        open={addOpen}
        defaultFeed={addFeed}
        onClose={() => setAddOpen(false)}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}

// ── pipeline view (saved / applied) ──
function PipelineView({ filter, icon, emptyMsg, onRefresh }: { filter: string; icon: React.ReactNode; emptyMsg: string; onRefresh: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/jobs?filter=${filter}`).then(r => r.json()).then(d => { setJobs(d.jobs || []); setLoading(false); });
  }, [filter]);

  async function handleSave(id: number, saved: boolean) {
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ saved: saved ? 1 : 0 }) });
    setJobs(js => js.map(j => j.id === id ? { ...j, saved: saved ? 1 : 0 } : j));
    onRefresh();
  }

  async function handleCycle(id: number, status: string) {
    await fetch(`/api/jobs/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setJobs(js => js.map(j => j.id === id ? { ...j, status: status as any } : j));
    onRefresh();
  }

  if (loading) return <div className="text-center py-20 text-zinc-400 text-sm">Loading…</div>;

  if (!jobs.length) return (
    <div className="text-center py-24 text-zinc-400">
      <div className="flex justify-center mb-4 opacity-25">{icon}</div>
      <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Nothing here yet</h3>
      <p className="text-sm max-w-xs mx-auto">{emptyMsg}</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {jobs.map(j => <JobCard key={j.id} job={j} onSave={handleSave} onCycle={handleCycle} />)}
    </div>
  );
}
