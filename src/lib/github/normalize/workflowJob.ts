/*
 * @FilePath: \my-new-app\lib\github\normalize\workflowJob.ts
 * @LastEditTime: 2026-04-02 23:10:51
 */
// lib/github/normalize/workflowJob.ts
import type { BaseNormalizedGitHubEvent } from "./types";

export function normalizeWorkflowJob(payload: any): BaseNormalizedGitHubEvent {
  const job = payload.workflow_job;

  return {
    type: "workflow_job",
    title: job?.name ?? null,
    actor: payload.sender?.login ?? null,
    commitSha: job?.head_sha ?? null,
    url: job?.html_url ?? null,
    status: job?.status ?? null,
    conclusion: job?.conclusion ?? null,
    jobName: job?.name ?? null,
    raw: payload,
  };
}
