/**
 * Optional cron endpoint — call this daily to auto-refresh all remote feeds.
 * e.g. via a cron job: curl -X POST http://localhost:3000/api/cron
 * Or use Vercel Cron Jobs if deployed there.
 */
import { NextResponse } from "next/server";
import { FEEDS } from "@/lib/feeds";

export async function POST() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const remote = FEEDS.filter(f => f.type === "remote");
  const results = await Promise.allSettled(
    remote.map(f =>
      fetch(`${baseUrl}/api/fetch/${f.key}`, { method: "POST" }).then(r => r.json())
    )
  );
  return NextResponse.json({
    ok: true,
    results: results.map((r, i) => ({ feed: remote[i].key, status: r.status })),
  });
}
