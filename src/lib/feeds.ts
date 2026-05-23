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
];

export const FEED_MAP = Object.fromEntries(FEEDS.map((f) => [f.key, f]));
