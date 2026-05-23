import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const db = await getDb();
  const total   = (db.prepare("SELECT COUNT(*) as n FROM jobs WHERE is_manual = 0").get() as any).n;
  const saved   = (db.prepare("SELECT COUNT(*) as n FROM jobs WHERE saved = 1").get() as any).n;
  const applied = (db.prepare("SELECT COUNT(*) as n FROM jobs WHERE status = 'Applied'").get() as any).n;
  const interview = (db.prepare("SELECT COUNT(*) as n FROM jobs WHERE status = 'Interview'").get() as any).n;
  const feedLog  = db.prepare("SELECT feed, MAX(fetched_at) as last_fetch, count FROM feed_log GROUP BY feed").all();
  return NextResponse.json({ total, saved, applied, interview, feedLog });
}
