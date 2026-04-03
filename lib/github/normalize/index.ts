/*
 * @FilePath: \my-new-app\lib\github\normalize\index.ts
 * @LastEditTime: 2026-04-02 23:09:46
 */
// lib/github/normalize/index.ts
import { BaseNormalizedGitHubEvent, NormalizedGitHubEvent } from "./types";

import { normalizeWorkflowRun } from "./workflowRun";
import { normalizeWorkflowJob } from "./workflowJob";
import { normalizePush } from "./push";
import { normalizePullRequest } from "./pullRequest";
import { normalizeIssueComment } from "./issueComment";
import { normalizeGeneric } from "./generic";

export function normalizeGitHubEvent(
  event: string,
  payload: any,
): NormalizedGitHubEvent {
  const repo = payload.repository?.full_name ?? "unknown";

  let base: BaseNormalizedGitHubEvent;

  switch (event) {
    case "workflow_run":
      base = normalizeWorkflowRun(payload);
      break;

    case "workflow_job":
      base = normalizeWorkflowJob(payload);
      break;

    case "push":
      base = normalizePush(payload);
      break;

    case "pull_request":
      base = normalizePullRequest(payload);
      break;

    case "issue_comment":
      base = normalizeIssueComment(payload);
      break;

    default:
      base = normalizeGeneric(event, payload);
  }

  return {
    repo,
    ...base,
  };
}
