import type { FeedConfig } from "@/types/job";

export const FEEDS: FeedConfig[] = [
  {
    key: "local-ops",
    label: "Ops Manager — Egypt",
    type: "local",
    description: "Operations & management roles in Egypt",
    sources: ["LinkedIn", "Wuzzuf"],
    keywords: ["operations manager", "operations", "management"],
  },
  {
    key: "local-seo",
    label: "Digital Growth & SEO — Egypt",
    type: "local",
    description: "SEO, growth & marketing roles in Egypt",
    sources: ["LinkedIn", "Wuzzuf"],
    keywords: ["seo", "digital marketing", "growth", "social media"],
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
