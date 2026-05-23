export type JobStatus = "New" | "Applied" | "Interview" | "Rejected";

export interface Job {
  id: number;
  guid: string;
  title: string;
  company: string;
  location: string;
  feed: string;
  source: string;
  link: string;
  description: string;
  notes: string;
  is_manual: number;
  status: JobStatus;
  saved: number;
  date_posted: string;
  created_at: number;
}

export interface FeedConfig {
  key: string;
  label: string;
  type: "local" | "remote";
  description: string;
  sources: string[];
  keywords: string[];
}
