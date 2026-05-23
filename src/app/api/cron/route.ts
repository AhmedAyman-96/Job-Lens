/**
 * Cron endpoint — auto-refresh all Egypt feeds daily.
 */
import { NextResponse } from "next/server";
import { FEEDS } from "@/lib/feeds";

export async function POST() {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const results = await Promise.allSettled(
    FEEDS.map(f =>
      fetch(`${baseUrl}/api/fetch/${f.key}`, { method: "POST" }).then(r => r.json())
    )
  );
  return NextResponse.json({
    ok: true,
    results: results.map((r, i) => ({ feed: FEEDS[i].key, status: r.status })),
  });
}
