// timing.ts
import { randomUUID } from "crypto";

const requestState = new Map<
  string,
  { start: number; requestId: string; eventIndex: number }
>();

export function markRequestStart(url: string) {
  requestState.set(url, {
    start: performance.now(),
    requestId: randomUUID(),
    eventIndex: 1,
  });
}

export function getRequestId(url: string) {
  return requestState.get(url)?.requestId;
}

export function nextEventIndex(url: string) {
  const state = requestState.get(url);
  if (!state) return 1;
  state.eventIndex += 1;
  return state.eventIndex;
}

export function getRequestDuration(url: string) {
  const state = requestState.get(url);
  if (!state) return 0;
  return performance.now() - state.start;
}

export function clearRequest(url: string) {
  requestState.delete(url);
}
