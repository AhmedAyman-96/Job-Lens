"use client";
import { Job } from "@/types/job";
import { FEED_MAP } from "@/lib/feeds";
import { Bookmark, ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import clsx from "clsx";

const STATUSES = ["New", "Applied", "Interview", "Rejected"] as const;

const STATUS_STYLE: Record<string, string> = {
  New: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500",
  Applied: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  Interview: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  Rejected: "bg-red-500/15 text-red-500",
};

const FEED_STYLE: Record<string, string> = {
  "local-ops": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "local-seo": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "remote-ops": "bg-teal-500/15 text-teal-600 dark:text-teal-400",
  "remote-seo": "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "remote-growth": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
};

interface Props {
  job: Job;
  onSave: (id: number, saved: boolean) => void;
  onCycle: (id: number, next: string) => void;
  onDelete?: (id: number) => void;
}

export default function JobCard({ job, onSave, onCycle, onDelete }: Props) {
  const feed = FEED_MAP[job.feed];
  const nextStatus = STATUSES[(STATUSES.indexOf(job.status as any) + 1) % STATUSES.length];

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md dark:hover:shadow-zinc-950 transition-all grid grid-cols-[1fr_auto] gap-x-4">
      <div>
        <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-base leading-snug mb-0.5">{job.title}</div>
        <div className="text-sm text-zinc-500 mb-3">
          {job.company || "—"} · <span className="text-zinc-400">{job.location}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", FEED_STYLE[job.feed] || "bg-zinc-100 dark:bg-zinc-800 text-zinc-500")}>
            {feed?.label || job.feed}
          </span>
          <span className={clsx("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_STYLE[job.status])}>
            {job.status}
          </span>
          {job.source && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">{job.source}</span>
          )}
          {job.is_manual ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400">Manual</span>
          ) : null}
        </div>
        {job.description && (
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-2">{job.description}</p>
        )}
        {job.notes && (
          <p className="text-xs text-amber-500 mt-1">📌 {job.notes}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-xs text-zinc-400 whitespace-nowrap">{job.date_posted}</span>
        <div className="flex gap-1">
          <button
            onClick={() => onSave(job.id, !job.saved)}
            className={clsx("p-1.5 rounded-lg transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800", job.saved ? "text-teal-500" : "text-zinc-400")}
            title={job.saved ? "Unsave" : "Save"}
          >
            <Bookmark size={15} fill={job.saved ? "currentColor" : "none"} />
          </button>
          {job.link && (
            <a href={job.link} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
              title="Open listing"
            >
              <ExternalLink size={15} />
            </a>
          )}
          <button
            onClick={() => onCycle(job.id, nextStatus)}
            className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition-all"
            title={`Mark as ${nextStatus}`}
          >
            <RefreshCw size={15} />
          </button>
          {job.is_manual && onDelete && (
            <button
              onClick={() => onDelete(job.id)}
              className="p-1.5 rounded-lg text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-500 transition-all"
              title="Delete"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
