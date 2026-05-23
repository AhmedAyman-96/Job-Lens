import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb();
  const body = await req.json();
  const allowed = ["status", "saved", "notes"];
  const updates = Object.entries(body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return NextResponse.json({ error: "nothing to update" }, { status: 400 });

  const sets = updates.map(([k]) => `${k} = ?`).join(", ");
  const vals = updates.map(([, v]) => v);
  db.prepare(`UPDATE jobs SET ${sets} WHERE id = ?`).run(...vals, Number(params.id));
  const job = db.prepare("SELECT * FROM jobs WHERE id = ?").get(Number(params.id));
  return NextResponse.json({ job });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const db = await getDb();
  db.prepare("DELETE FROM jobs WHERE id = ? AND is_manual = 1").run(Number(params.id));
  return NextResponse.json({ ok: true });
}
