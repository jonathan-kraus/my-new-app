/*
 * @FilePath: \my-new-app\lib\github\normalize\issueComment.ts
 * @LastEditTime: 2026-04-02 23:11:55
 */
// lib/github/normalize/issueComment.ts
import { BaseNormalizedGitHubEvent } from "./types";

export function normalizeIssueComment(payload: any): BaseNormalizedGitHubEvent {
  const issue = payload.issue;

  return {
    type: "issue_comment",
    title: issue?.title ?? null,
    actor: payload.sender?.login ?? null,
    commitSha: null,
    url: issue?.html_url ?? null,
    status: "commented",
    conclusion: null,
    raw: payload,
  };
}
