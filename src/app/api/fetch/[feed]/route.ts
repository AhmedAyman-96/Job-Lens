import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  fetchJobicy, fetchRemotive, fetchArbeitnow,
  fetchWuzzuf, fetchBayt, dedup, type RawJob
} from "@/lib/fetchers";

async function getJobsForFeed(feed: string): Promise<RawJob[]> {
  switch (feed) {
    case "remote-ops":
      return dedup([
        ...await fetchJobicy("operations").catch(() => []),
        ...await fetchJobicy("management").catch(() => []),
        ...await fetchArbeitnow(["operations manager", "operations director"]).catch(() => []),
        ...await fetchRemotive("management-finance", "operations manager").catch(() => []),
      ]);
    case "remote-seo":
      return dedup([
        ...await fetchJobicy("marketing").catch(() => []),
        ...await fetchJobicy("seo").catch(() => []),
        ...await fetchArbeitnow(["seo", "digital marketing", "wordpress", "growth marketing"]).catch(() => []),
        ...await fetchRemotive("marketing", "seo").catch(() => []),
      ]);
    case "remote-growth":
      return dedup([
        ...await fetchArbeitnow(["growth", "strategy", "business development"]).catch(() => []),
        ...await fetchJobicy("business").catch(() => []),
        ...await fetchRemotive("marketing", "growth manager").catch(() => []),
        ...await fetchRemotive("management-finance", "business development").catch(() => []),
      ]);
    case "local-ops":
      return dedup([
        ...await fetchWuzzuf("operations manager").catch(() => []),
        ...await fetchWuzzuf("operations director").catch(() => []),
        ...await fetchBayt("operations-manager").catch(() => []),
      ]);
    case "local-seo":
      return dedup([
        ...await fetchWuzzuf("seo specialist").catch(() => []),
        ...await fetchWuzzuf("digital marketing manager").catch(() => []),
        ...await fetchBayt("seo-specialist").catch(() => []),
        ...await fetchBayt("digital-marketing").catch(() => []),
      ]);
    default:
      return [];
  }
}

export async function POST(req: NextRequest, { params }: { params: { feed: string } }) {
  const db = await getDb();
  const { feed } = params;

  let jobs: RawJob[] = [];
  let error: string | null = null;

  try {
    jobs = await getJobsForFeed(feed);
    // Upsert jobs (keep existing user metadata: status, saved)
    const insert = db.prepare(`
      INSERT OR IGNORE INTO jobs (guid, title, company, location, feed, source, link, description, date_posted, is_manual)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);
    const insertMany = db.transaction((rows: RawJob[]) => {
      for (const j of rows) {
        insert.run(j.guid, j.title, j.company, j.location, feed, j.source, j.link, j.description, j.date_posted);
      }
    });
    insertMany(jobs);

    db.prepare("INSERT INTO feed_log (feed, count) VALUES (?, ?)").run(feed, jobs.length);
  } catch (e: any) {
    error = String(e?.message || e);
    db.prepare("INSERT INTO feed_log (feed, count, error) VALUES (?, 0, ?)").run(feed, error);
  }

  return NextResponse.json({ feed, count: jobs.length, error });
}
