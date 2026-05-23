import type { FeedConfig } from "@/types/job";

export const FEEDS: FeedConfig[] = [
  {
    key: "local-ops",
    label: "Ops / Management",
    type: "local",
    description: "Operations & management roles (global remote)",
    sources: ["Jobicy", "Remotive", "Arbeitnow"],
    keywords: ["operations manager", "operations", "management", "telecom", "saas"],
  },
  {
    key: "local-seo",
    label: "Digital Growth & SEO",
    type: "local",
    description: "SEO, growth & marketing roles (global remote)",
    sources: ["Jobicy", "Remotive", "Arbeitnow"],
    keywords: ["seo", "digital marketing", "growth", "wordpress", "marketing manager"],
  },
  {
    key: "remote-ops",
    label: "Remote — Ops / Management",
    type: "remote",
    description: "Remote operations & management roles worldwide",
    sources: ["Jobicy", "Remotive", "Arbeitnow"],
    keywords: ["operations", "management"],
  },
  {
    key: "remote-seo",
    label: "Remote — Marketing / SEO",
    type: "remote",
    description: "Remote SEO, digital marketing & growth roles",
    sources: ["Jobicy", "Remotive", "Arbeitnow"],
    keywords: ["seo", "marketing", "wordpress"],
  },
  {
    key: "remote-growth",
    label: "Remote — Growth / Strategy",
    type: "remote",
    description: "Remote growth & business strategy roles",
    sources: ["Jobicy", "Remotive", "Arbeitnow"],
    keywords: ["growth", "strategy", "business development"],
  },
];

export const FEED_MAP = Object.fromEntries(FEEDS.map((f) => [f.key, f]));
