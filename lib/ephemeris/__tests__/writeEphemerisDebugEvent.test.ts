// lib/ephemeris/__tests__/writeEphemerisDebugEvent.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockReturnValue("0"), // debug off
}));

vi.mock("@/lib/db", () => ({
  db: {
    runtimeConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    ephemerisDebug: {
      create: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import * as mod from "@/lib/ephemeris/writeEphemerisDebugEvent";

describe("writeEphemerisDebugEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    const circular: any = {};
    circular.self = circular;
    const result = mod.toJsonSafe(circular);
    expect(result).toBe("[object Object]");
  });

  // -----------------------------
  // Main function tests
  // -----------------------------
  it("writes a debug event with safe values", async () => {
    const mockRow = { id: "ok" };
    (db.ephemerisDebug.create as any).mockResolvedValue(mockRow);

    const result = await mod.writeEphemerisDebugEvent({
      id: "abc",
      locationId: "123",
      fetchedAt: "2024-01-01T00:00:00Z",
      raw: { test: true },
    });

    expect(result).toBe(mockRow);

    const call = (db.ephemerisDebug.create as any).mock.calls[0][0].data;

    expect(call.locationId).toBe("123");
    expect(call.fetchedAt).toBe("2024-01-01T00:00:00.000Z");
    expect(call.raw).toEqual({ test: true });
  });

  it("logs an error when db write fails", async () => {
    (db.ephemerisDebug.create as any).mockRejectedValue(new Error("fail"));

    await expect(
      mod.writeEphemerisDebugEvent({
        id: "abc",
        raw: { test: true },
      })
    ).rejects.toThrow("fail");
  });
});
