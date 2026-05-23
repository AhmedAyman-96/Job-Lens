# JobLens — Sara's Job Tracker

A full-stack Next.js job tracking app with:
- **Server-side scraping** of Wuzzuf & Bayt (Egypt-local jobs — no CORS!)
- **Remote auto-feeds** from Jobicy, Remotive, and Arbeitnow
- **SQLite database** to persist all jobs and your pipeline state
- **Manual add** with source tracking (Wuzzuf, Bayt, LinkedIn, Tanqeeb)
- **Pipeline tracking**: New → Applied → Interview → Rejected
- **Dark / Light mode**

---

## Setup

### 1. Install dependencies

```bash
cd joblens
npm install
```

### 2. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Build for production

```bash
npm run build
npm start
```

---

## How it works

| Section | Data source | How fetched |
|---|---|---|
| Ops Manager — Egypt | Wuzzuf + Bayt (JSON-LD parsing) | Server-side (`/api/fetch/local-ops`) |
| Digital Growth & SEO — Egypt | Wuzzuf + Bayt | Server-side (`/api/fetch/local-seo`) |
| Remote — Ops / Management | Jobicy + Remotive + Arbeitnow | Server-side API calls |
| Remote — Marketing / SEO | Jobicy + Remotive + Arbeitnow | Server-side API calls |
| Remote — Growth / Strategy | Jobicy + Remotive + Arbeitnow | Server-side API calls |

### Egypt local scraping
The server fetches Wuzzuf and Bayt search pages and extracts structured `JSON-LD` (`JobPosting`) data embedded in the HTML.
This works server-side because there is no browser CORS restriction.
Results vary depending on whether those sites serve structured data for the search query.

### Manual add
Always works — paste any job from Wuzzuf, Bayt, LinkedIn, or Tanqeeb and track it in your pipeline.

---

## Database
SQLite at `./data/joblens.db` (auto-created on first run).
All job metadata, status, and saved state persists across restarts.

---

## Tech stack
- **Next.js 14** (App Router, server components + client components)
- **better-sqlite3** for local SQLite
- **Tailwind CSS** for styling
- **Lucide React** for icons
