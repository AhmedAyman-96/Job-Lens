/* Server-side job fetchers — runs in Next.js API routes only */

export interface RawJob {
  guid: string;
  title: string;
  company: string;
  location: string;
  link: string;
  description: string;
  date_posted: string;
  source: string;
}

function strip(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function fdate(d: string | number | null): string {
  if (!d) return "Recent";
  try {
    return new Date(typeof d === "number" ? d * 1000 : d).toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );
  } catch {
    return "Recent";
  }
}

/* ── Jobicy ── */
export async function fetchJobicy(tag: string): Promise<RawJob[]> {
  const res = await fetch(
    `https://jobicy.com/api/v2/remote-jobs?count=25&tag=${encodeURIComponent(tag)}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return ((data.jobs as any[]) || []).map((j) => ({
    guid: `jy-${j.id}`,
    title: strip(j.jobTitle || ""),
    company: j.companyName || "",
    location: j.jobGeo || "Remote",
    link: j.url || "",
    description: strip((j.jobExcerpt || "").substring(0, 300)),
    date_posted: fdate(j.pubDate),
    source: "Jobicy",
  })).filter((j) => j.title);
}

/* ── Remotive ── */
export async function fetchRemotive(
  category: string,
  search: string = ""
): Promise<RawJob[]> {
  const params = new URLSearchParams({ category, limit: "25" });
  if (search) params.set("search", search);
  const res = await fetch(
    `https://remotive.com/api/remote-jobs?${params}`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  return ((data.jobs as any[]) || []).map((j) => ({
    guid: `rm-${j.id}`,
    title: strip(j.title || ""),
    company: j.company_name || "",
    location: j.candidate_required_location || "Worldwide",
    link: j.url || "",
    description: strip((j.description || "").substring(0, 300)),
    date_posted: fdate(j.publication_date),
    source: "Remotive",
  })).filter((j) => j.title);
}

/* ── Arbeitnow ── */
export async function fetchArbeitnow(keywords: string[]): Promise<RawJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api?page=1", {
    next: { revalidate: 3600 },
  });
  const data = await res.json();
  const kw = keywords.map((k) => k.toLowerCase());
  return ((data.data as any[]) || [])
    .filter((j) => {
      const hay = ((j.title || "") + " " + (j.tags || []).join(" ")).toLowerCase();
      return kw.some((k) => hay.includes(k));
    })
    .slice(0, 20)
    .map((j) => ({
      guid: `an-${j.slug}`,
      title: strip(j.title || ""),
      company: j.company_name || "",
      location: j.location || "Remote",
      link: j.url || "",
      description: strip((j.description || "").substring(0, 300)),
      date_posted: fdate(j.created_at),
      source: "Arbeitnow",
    }))
    .filter((j) => j.title);
}

/* ── dedup ── */
export function dedup(jobs: RawJob[]): RawJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    if (seen.has(j.guid)) return false;
    seen.add(j.guid);
    return true;
  });
}
