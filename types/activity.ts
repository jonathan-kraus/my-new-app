// types\activity.ts
export type ActivityItemType =
  | "PushEvent"
  | "PullRequestEvent"
  | "WorkflowRunEvent"
  | "vercel";

export interface ActivityItemData {
  id: string;
  type: ActivityItemType;
  createdAt: string;

  // Optional fields depending on event type
  ref?: string;
  url?: string;
  state?: string;

  // GitHub-specific
  commitMessage?: string;
  prTitle?: string;
  workflowName?: string;

  // Vercel-specific
  deploymentUrl?: string;
  deploymentState?: string;

  // Raw payload if you want it
  raw?: any;
}
