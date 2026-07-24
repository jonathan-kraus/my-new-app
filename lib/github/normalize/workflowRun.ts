/*
 * @FilePath: \my-new-app\lib\github\normalize\workflowRun.ts
 * @LastEditTime: 2026-04-02 23:10:30
 */
// lib/github/normalize/workflowRun.ts
import type { BaseNormalizedGitHubEvent } from "./types";

export function normalizeWorkflowRun(payload: any): BaseNormalizedGitHubEvent {
  const wr = payload.workflow_run;

  return {
    type: "workflow_run",
    title: wr?.display_title ?? null,
    actor: wr?.actor?.login ?? payload.sender?.login ?? null,
    commitSha: wr?.head_sha ?? null,
    url: wr?.html_url ?? null,
    status: wr?.status ?? null,
    conclusion: wr?.conclusion ?? null,
    commitMessage: wr?.head_commit?.message ?? null,
    raw: payload,
  };
}
