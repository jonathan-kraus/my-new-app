// lib/types.ts - EXACT PRISMA MATCH
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface CreateLogInput {
  level: string;
  message: string;
  domain: string;
  payload: Record<string, any>;
  meta?: Record<string, any> | null;
}


export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export type ActivityItemType =
  | "PushEvent"
  | "PullRequestEvent"
  | "WorkflowRunEvent"
  | "vercel";

export interface ActivityItemData {
  id: string;
  type: ActivityItemType;
  ref?: string;
  url?: string;
  state?: string;
  created_at?: string;
  createdAt?: string; // for Vercel
}
export interface GitHubActivityEvent {
  id: string;

  // Workflow metadata
  name: string; // workflow name
  repo: string; // owner/repo

  // Status + result
  status: string | null; // queued, in_progress, completed
  conclusion: string | null; // success, failure, cancelled, null

  // Event context
  event: string | null; // workflow_run, push, etc.
  actor: string | null; // who triggered it

  // Commit info
  commitMessage: string | null;
  commitSha: string | null;

  // Links
  url: string | null;

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Source discriminator (for future Vercel/Ping)
  source: "github";
}
