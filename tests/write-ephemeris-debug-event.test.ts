vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/buildj", () => ({
  staticUniversalContext: vi.fn().mockReturnValue({}),
}));
// lib/ephemeris/__tests__/writeEphemerisDebugEvent.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Temporal } from "temporal-polyfill";

vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockReturnValue("0"), // debug off
}));

vi.mock("@/lib/db.prisma8", () => ({
  db8: {
    orm: {
      public: {
        EphemerisDebug: { create: vi.fn().mockResolvedValue(undefined) },
      },
    },
  },
}));

import { db8 } from "@/lib/db.prisma8";
import * as mod from "@/lib/ephemeris/writeEphemerisDebugEvent";

describe("writeEphemerisDebugEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -----------------------------
  // Helper tests
  // -----------------------------
  it("toIsoString returns ISO string for valid input", () => {
    const result = mod.toIsoString("2024-01-01T00:00:00Z");
    expect(result).toBe("2024-01-01T00:00:00.000Z");
  });

  it("toIsoString returns null for invalid input", () => {
    const result = mod.toIsoString("not-a-date");
    expect(result).toBeNull();
  });

  it("toJsonSafe deep clones JSON-safe values", () => {
    const input = { a: 1, b: "x" };
    const result = mod.toJsonSafe(input);
    expect(result).toEqual(input);
    expect(result).not.toBe(input);
  });

  it("toJsonSafe falls back to String(value) when JSON serialization fails", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const result = mod.toJsonSafe(circular);
    expect(result).toBe("[object Object]");
  });

  // -----------------------------
  // Main function tests
  // -----------------------------
  it("writes a debug event with safe values", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-22T12:52:35.123-04:00"));
    const mockRow = { id: "ok" } as Awaited<
      ReturnType<typeof db8.orm.public.EphemerisDebug.create>
    >;
    vi.mocked(db8.orm.public.EphemerisDebug.create).mockResolvedValue(mockRow);

    const result = await mod.writeEphemerisDebugEvent({
      id: "abc",
      locationId: "123",
      fetchedAt: "2024-01-01T00:00:00Z",
      raw: { test: true },
    });

    expect(result).toBe(mockRow);

    const call = vi.mocked(db8.orm.public.EphemerisDebug.create).mock
      .calls[0]![0] as {
      locationId: string | null;
      fetchedAt: string | null;
      raw: unknown;
      receivedAt: Temporal.PlainDateTime;
    };

    expect(call.locationId).toBe("123");
    expect(call.fetchedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(call.raw).toEqual({ test: true });
    // Timestamp(3) requires a Temporal value, with UTC wall-clock semantics.
    expect(call.receivedAt).toBeInstanceOf(Temporal.PlainDateTime);
    expect(call.receivedAt?.toString()).toBe("2026-09-22T16:52:35.123");
  });

  it("logs an error when db write fails", async () => {
    vi.mocked(db8.orm.public.EphemerisDebug.create).mockRejectedValue(
      new Error("fail"),
    );

    await expect(
      mod.writeEphemerisDebugEvent({
        id: "abc",
        raw: { test: true },
      }),
    ).rejects.toThrow("fail");
  });
});
