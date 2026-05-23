import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  fetchWuzzufSitemap, fetchLinkedIn,
  dedup, type RawJob
} from "@/lib/fetchers";

async function getJobsForFeed(feed: string): Promise<RawJob[]> {
  switch (feed) {
    case "local-ops":
      return dedup([
        ...await fetchLinkedIn("operations manager").catch(() => []),
        ...await fetchLinkedIn("operations director").catch(() => []),
        ...await fetchWuzzufSitemap(["operations-manager", "operations-director", "operations"]),
      ]);
    case "local-seo":
      return dedup([
        ...await fetchLinkedIn("seo specialist").catch(() => []),
        ...await fetchLinkedIn("digital marketing manager").catch(() => []),
        ...await fetchLinkedIn("growth marketing").catch(() => []),
        ...await fetchWuzzufSitemap(["seo", "digital-marketing", "marketing-manager", "growth", "social-media"]),
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
