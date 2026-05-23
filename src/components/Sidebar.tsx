"use client";
import { useTheme } from "./ThemeProvider";
import { FEEDS } from "@/lib/feeds";
import {
  LayoutDashboard, MapPin, TrendingUp,
  Bookmark, Send, Sun, Moon, Search
} from "lucide-react";
import clsx from "clsx";

const ICONS: Record<string, React.FC<any>> = {
  "local-ops": MapPin, "local-seo": TrendingUp,
};

interface Props {
  view: string;
  setView: (v: string) => void;
  savedCount: number;
}

const Item = ({ icon: Icon, label, active, onClick, badge }: any) => (
  <button
    onClick={onClick}
    className={clsx(
      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
      active
        ? "bg-teal-500/15 text-teal-400 dark:text-teal-300"
        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
    )}
  >
    <Icon size={16} />
    <span className="flex-1 text-left">{label}</span>
    {badge != null && badge > 0 && (
      <span className="text-xs bg-teal-500/15 text-teal-500 px-2 py-0.5 rounded-full font-semibold">{badge}</span>
    )}
  </button>
);

export default function Sidebar({ view, setView, savedCount }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-50">
      <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center">
          <Search size={16} className="text-teal-500" />
        </div>
        <div>
          <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 font-serif">JobLens</div>
          <div className="text-xs text-zinc-400">Sara's Job Tracker</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <Item icon={LayoutDashboard} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />

        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 px-3 pt-4 pb-1.5">
          Egypt Jobs
        </div>
        {FEEDS.map(f => (
          <Item key={f.key} icon={ICONS[f.key] || MapPin} label={f.label} active={view === f.key} onClick={() => setView(f.key)} />
        ))}

        <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-600 px-3 pt-4 pb-1.5">
          Pipeline
        </div>
        <Item icon={Bookmark} label="Saved" active={view === "saved"} onClick={() => setView("saved")} badge={savedCount} />
        <Item icon={Send} label="Applied" active={view === "applied"} onClick={() => setView("applied")} />
      </nav>

      <div className="px-3 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </aside>
  );
}
