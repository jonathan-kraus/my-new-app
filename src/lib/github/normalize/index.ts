import type { GitHubPayload } from "@/lib/github/payload";
import { staticUniversalContext } from "@/lib/log/buildj";
import { logj } from "@/lib/log/logj";
import { normalizeGeneric } from "./generic";
import { normalizeIssueComment } from "./issueComment";
import { normalizePullRequest } from "./pullRequest";
import { normalizePush } from "./push";
/*
 * @FilePath: \my-new-app\lib\github\normalize\index.ts
 * @LastEditTime: 2026-08-01 13:44:50
 */
// lib/github/normalize/index.ts
import type { BaseNormalizedGitHubEvent, NormalizedGitHubEvent } from "./types";
import { normalizeWorkflowJob } from "./workflowJob";
import { normalizeWorkflowRun } from "./workflowRun";
export function normalizeGitHubEvent(
  event: string,
  payload: GitHubPayload,
): NormalizedGitHubEvent {
  const repo = payload.repository?.full_name ?? "unknown";

  let jei = 0;
  let base: BaseNormalizedGitHubEvent;
  const built = staticUniversalContext("GITHUB");
  logj({
    domain: "github",
    level: "info",
    message: "Github normalize event - " + event,
    file: "src/lib/github/normalize/index.ts",
    line: 26,
    payload: { repo: repo, event: event },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
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
