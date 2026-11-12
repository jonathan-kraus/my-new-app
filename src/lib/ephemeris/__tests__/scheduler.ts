import { beforeEach, describe, expect, test, vi } from "vitest";
import { clear, enqueue } from "@/lib/log/queue";
import {
  isSchedulerRunning,
  startScheduler,
  stopScheduler,
} from "@/lib/log/scheduler";
import { fakeEvent } from "@/lib/log/test-utils";
import { mockAxiom } from "@/tests/log/__mocks__/axiom";
import { useFakeTimers } from "../../../../tests/log/__mocks__/testUtils";

vi.mock("@/lib/log/axiomClient", () => ({
  axiomClient: mockAxiom,
}));

describe("scheduler", () => {
  const { advance } = useFakeTimers();

  beforeEach(() => {
    stopScheduler();
    clear();
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
    enqueue(fakeEvent({ msg: "hello" }));

    startScheduler();
    await advance(5000);

    expect(mockAxiom.ingest).toHaveBeenCalled();
  });
});
