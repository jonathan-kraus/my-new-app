import { GitHubActivityEvent } from "@/lib/types";

export function transformWorkflowRunEvent(
  parsed: any,
): GitHubActivityEvent | null {
  const run = parsed?.workflow_run;
  if (!run) return null;

  return { id: run.id, name: run.name, repo: run.repo, status: run.status, createdAt: run.createdAt, updatedAt: run.updatedAt, }; }
