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

/* ── Wuzzuf (sitemap-based) ── */
const EGYPT_CITIES = [
  "cairo", "giza", "alexandria", "helwan", "port-said", "suez",
  "luxor", "aswan", "mansoura", "tanta", "zagazig", "ismailia",
  "fayoum", "beni-suef", "minya", "assiut", "sohag", "qena",
  "damietta", "6th-of-october", "new-cairo", "new-capital",
  "sheikh-zayed", "maadi", "heliopolis", "nasr-city", "mohandessin",
  "zamalek", "dokki", "shubra", "obour", "10th-of-ramadan",
  "badr", "shorouk", "egypt",
];

function parseWuzzufSlug(url: string): { title: string; location: string; guid: string } | null {
  const path = url.split("/jobs/p/")[1];
  if (!path) return null;
  const parts = path.split("-");
  const id = parts[0];

  let locationEnd = parts.length;
  const locationParts: string[] = [];

  for (let i = parts.length - 1; i > 0; i--) {
    if (EGYPT_CITIES.includes(parts[i])) {
      locationParts.unshift(parts[i]);
      locationEnd = i;
    } else if (locationParts.length > 0) {
      break;
    }
  }

  const titleParts = parts.slice(1, locationEnd);
  const title = titleParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

  const location = locationParts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(", ");

  return { title, location: location || "Egypt", guid: `wz-${id}` };
}

let _sitemapCache: { entries: { url: string; lastmod: string }[]; ts: number } | null = null;

async function getWuzzufSitemap() {
  if (_sitemapCache && Date.now() - _sitemapCache.ts < 3600_000) return _sitemapCache.entries;
  const res = await fetch("https://wuzzuf.net/sitemap-job-1.xml", {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 3600 },
  });
  const xml = await res.text();
  const entries = [...xml.matchAll(/<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g)]
    .map((m) => ({ url: m[1], lastmod: m[2] }));
  _sitemapCache = { entries, ts: Date.now() };
  return entries;
}

export async function fetchWuzzufSitemap(keywords: string[]): Promise<RawJob[]> {
  try {
    const entries = await getWuzzufSitemap();
    const kw = keywords.map((k) => k.toLowerCase());

    return entries
      .filter((e) => {
        const slug = e.url.toLowerCase();
        return kw.some((k) => slug.includes(k));
      })
      .sort((a, b) => b.lastmod.localeCompare(a.lastmod))
      .slice(0, 25)
      .map((e) => {
        const parsed = parseWuzzufSlug(e.url);
        return {
          guid: parsed?.guid || `wz-${Buffer.from(e.url).toString("base64").substring(0, 16)}`,
          title: strip(parsed?.title || "Unknown"),
          company: "",
          location: parsed?.location || "Egypt",
          link: e.url,
          description: "",
          date_posted: fdate(new Date(e.lastmod).getTime() / 1000),
          source: "Wuzzuf",
        };
      })
      .filter((j) => j.title && j.title !== "Unknown");
  } catch (e) {
    console.error("Wuzzuf sitemap fetch error:", e);
    return [];
  }
}

/* ── LinkedIn (guest API) ── */
export async function fetchLinkedIn(keywords: string): Promise<RawJob[]> {
  try {
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(keywords)}&location=Egypt&start=0`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0",
      },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    const jobs: RawJob[] = [];
    const cardRegex = /data-entity-urn="urn:li:jobPosting:(\d+)"[^>]*>([\s\S]*?)(?=data-entity-urn="urn:li:jobPosting:|$)/g;

    let cardMatch;
    while ((cardMatch = cardRegex.exec(html)) !== null) {
      const id = cardMatch[1];
      const cardHtml = cardMatch[2];

      const titleMatch = cardHtml.match(/base-search-card__title[^>]*>\s*([^<]+)\s*</);
      const companyMatch = cardHtml.match(/base-search-card__subtitle[^>]*>[\s\S]*?<a[^>]*>\s*([^<]+)\s*</);
      const locationMatch = cardHtml.match(/job-search-card__location[^>]*>\s*([^<]+)\s*</);
      const linkMatch = cardHtml.match(/href="(https:\/\/[^"]+linkedin\.com\/jobs\/view\/[^"]+)"/);
      const dateMatch = cardHtml.match(/<time[^>]*datetime="([^"]*)"/);

      const title = titleMatch ? titleMatch[1].trim() : "";
      const company = companyMatch ? companyMatch[1].trim() : "";
      const location = locationMatch ? locationMatch[1].trim() : "Egypt";
      const link = linkMatch ? linkMatch[1] : "";
      const datePosted = dateMatch ? dateMatch[1] : "";

      if (title) {
        jobs.push({
          guid: `li-${id}`,
          title: strip(title),
          company: strip(company),
          location: strip(location),
          link,
          description: "",
          date_posted: fdate(datePosted || new Date().toISOString()),
          source: "LinkedIn",
        });
      }
    }

    return jobs.filter((j) => j.title).slice(0, 25);
  } catch (e) {
    console.error("LinkedIn fetch error:", e);
    return [];
  }
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
