/*
 * @FilePath: \my-new-app\lib\github\normalize\push.ts
 * @LastEditTime: 2026-04-02 23:11:12
 */
// lib/github/normalize/push.ts
import { BaseNormalizedGitHubEvent } from "./types";

export function normalizePush(payload: any): BaseNormalizedGitHubEvent {
  return {
    type: "push",
    title: payload.head_commit?.message ?? null,
    actor: payload.pusher?.name ?? payload.sender?.login ?? null,
    commitSha: payload.after ?? null,
    url: payload.compare ?? null,
    status: "completed",
    conclusion: null,
    commitMessage: payload.head_commit?.message ?? null,
    raw: payload,
  };
}
