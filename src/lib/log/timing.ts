import { randomUUID } from "crypto";

const requestState = new Map<string, { start: number; eventIndex: number }>();

export function startRequest(key: string) {
  requestState.set(key, {
    start: performance.now(),
    eventIndex: 1,
  });
}

export function nextEventIndex(key: string) {
  const state = requestState.get(key);
  if (!state) return 1;
  state.eventIndex += 1;
  return state.eventIndex;
}

export function getDuration(key: string) {
  const state = requestState.get(key);
  if (!state) return 0;
  return performance.now() - state.start;
}

export function clearRequest(key: string) {
  requestState.delete(key);
}
