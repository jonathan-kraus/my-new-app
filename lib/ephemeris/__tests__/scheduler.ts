import { describe, test, expect, beforeEach, vi } from "vitest";
import { startScheduler, stopScheduler, isSchedulerRunning } from "@/lib/log/scheduler";
import { enqueue, clearQueue } from "@/lib/log/queue";
import { mockAxiom } from "./__mocks__/axiom";
import { useFakeTimers } from "./testUtils";

vi.mock("@/lib/log/axiomClient", () => ({
  axiomClient: mockAxiom,
}));

describe("scheduler", () => {
  const { advance } = useFakeTimers();

  beforeEach(() => {
    stopScheduler();
    clearQueue();
    mockAxiom.ingest.mockClear();
  });

  test("scheduler starts and stops", () => {
    expect(isSchedulerRunning()).toBe(false);
    startScheduler();
    expect(isSchedulerRunning()).toBe(true);
    stopScheduler();
    expect(isSchedulerRunning()).toBe(false);
  });

  test("scheduler flushes periodically", async () => {
    enqueue({ msg: "hello" });

    startScheduler();
    await advance(5000);

    expect(mockAxiom.ingest).toHaveBeenCalled();
  });
});
