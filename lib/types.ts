// lib/types.ts - EXACT PRISMA MATCH
export type LogLevel = "debug" | "info" | "warn" | "error";

export interface CreateLogInput {
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  page?: string | null;
  userId?: string | null;
  sessionEmail?: string | null;
  sessionUser?: string | null;
  requestId?: string | null;
  file?: string | null;
  line?: number | null;
  createdAt?: Date;
}
export interface AstronomyCardProps {
  data: {
    sunrise: string;
    sunset: string;
    moonrise?: string | null;
    moonset?: string | null;
    source: string;
    fetchedAt: string;
  } | null;
  location: Location; // non-nullable Location
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
export type GitHubActivityEvent = {
  type: "workflow_run";
  workflowName: string;
  runNumber: number;
  conclusion: string;
  branch: string;
  commitMessage: string;
  commitSha: string;
  actor: string;
  event: string;
  url: string;
  timestamp: string;
};
