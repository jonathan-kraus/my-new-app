// tests/log/testUtils.ts
import { vi } from "vitest";

export function useFakeTimers() {
  vi.useFakeTimers();

  return {
    advance: async (ms: number) => {
      await vi.advanceTimersByTimeAsync(ms);
    },
  };
}
