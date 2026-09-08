import {
  startScheduler,
  stopScheduler,
  isSchedulerRunning,
} from "@/lib/log/scheduler";
import * as queue from "@/lib/log/queue";
import * as flushMod from "@/lib/log/flush";
import { vi } from "vitest";
import { fakeEvent } from "@/lib/log/test-utils";
vi.useFakeTimers();

describe("scheduler", () => {
  beforeEach(() => {
    vi.spyOn(queue, "dequeueBatch").mockReturnValue([
      fakeEvent({ test: true }),
    ]);
    vi.spyOn(flushMod, "flush").mockResolvedValue(undefined);
  });

  afterEach(() => {
    stopScheduler();
    vi.restoreAllMocks();
  });

  test("starts and runs flush", async () => {
    startScheduler();
    expect(isSchedulerRunning()).toBe(true);

    vi.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(flushMod.flush).toHaveBeenCalled();
  });
});
