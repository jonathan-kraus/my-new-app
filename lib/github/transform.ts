import { GitHubActivityEvent } from "@/lib/types";

export function transformWorkflowRunEvent(
  parsed: any,
): GitHubActivityEvent | null {
  const run = parsed?.workflow_run;
  if (!run) return null;

  return {
    type: "workflow_run",
    workflowName: run.name,
    runNumber: run.run_number,
    conclusion: run.conclusion,
    branch: run.head_branch,
    commitMessage: run.head_commit?.message ?? "",
    commitSha: run.head_sha,
    actor: run.actor?.login ?? "",
    event: run.event,
    url: run.html_url,
    timestamp: run.created_at,
  };
}
