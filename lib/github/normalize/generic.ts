/*
 * @FilePath: \my-new-app\lib\github\normalize\generic.ts
 * @LastEditTime: 2026-04-02 23:12:17
 */
// lib/github/normalize/generic.ts
import type { BaseNormalizedGitHubEvent } from "./types";

export function normalizeGeneric(
  event: string,
  payload: any,
): BaseNormalizedGitHubEvent {
  return {
    type: event,
    title: null,
    actor: payload.sender?.login ?? null,
    commitSha: null,
    url: null,
    status: null,
    conclusion: null,
    raw: payload,
  };
}
