import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
  const db = await getDb();
  const { searchParams } = new URL(req.url);
  const feed = searchParams.get("feed");
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "All";

  let query = "SELECT * FROM jobs WHERE 1=1";
  const params: (string | number)[] = [];

  if (feed) {
    query += " AND feed = ?";
    params.push(feed);
  }
  if (search) {
    query += " AND (title LIKE ? OR company LIKE ? OR location LIKE ?)";
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (filter === "Saved") {
    query += " AND saved = 1";
  } else if (filter === "Applied") {
    query += " AND status IN ('Applied','Interview')";
  }

  query += " ORDER BY created_at DESC";
  const jobs = db.prepare(query).all(...params);
  return NextResponse.json({ jobs });
  } catch (e: any) {
    console.error("[api/jobs] error:", e?.message, e?.stack);
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json();
  const { title, company, location, feed, source, link, notes } = body;

  if (!title || !company || !feed) {
    return NextResponse.json({ error: "title, company, feed required" }, { status: 400 });
  }

  const guid = `m-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  db.prepare(`
    INSERT OR IGNORE INTO jobs (guid, title, company, location, feed, source, link, notes, is_manual, date_posted)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    guid, title, company, location || "Egypt",
    feed, source || "Manual", link || "", notes || "",
    new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  );

  const job = db.prepare("SELECT * FROM jobs WHERE guid = ?").get(guid);
  return NextResponse.json({ job }, { status: 201 });
}
