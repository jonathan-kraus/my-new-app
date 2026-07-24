/*
 * @FilePath: \my-new-app\lib\github\normalize\pullRequest.ts
 * @LastEditTime: 2026-04-02 23:11:38
 */
// lib/github/normalize/pullRequest.ts
import type { BaseNormalizedGitHubEvent } from "./types";

export function normalizePullRequest(payload: any): BaseNormalizedGitHubEvent {
  const pr = payload.pull_request;

  return {
    type: "pull_request",
    title: pr?.title ?? null,
    actor: pr?.user?.login ?? payload.sender?.login ?? null,
    commitSha: pr?.head?.sha ?? null,
    url: pr?.html_url ?? null,
    status: pr?.state ?? null,
    conclusion: pr?.merged ? "merged" : null,
    prNumber: pr?.number ?? null,
    raw: payload,
  };
}
