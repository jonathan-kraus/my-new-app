import type { GitHubPayload } from "@/lib/github/payload";
export interface BaseNormalizedGitHubEvent {
  type: string;
  title: string | null;
  actor: string | null;
  commitSha: string | null;
  url: string | null;
  status: string | null;
  conclusion: string | null;
  jobName?: string | null;
  prNumber?: number | null;
  commitMessage?: string | null;
  raw: GitHubPayload;
}

export interface NormalizedGitHubEvent extends BaseNormalizedGitHubEvent {
  repo: string; // required by Prisma
}
