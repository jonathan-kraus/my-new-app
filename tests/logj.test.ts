import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock server-only so Vitest can import logj.ts
vi.mock("server-only", () => ({}));

// Mock Prisma + Axiom
vi.mock("@/lib/db.prisma8", () => ({
  db8: {
    orm: { public: { Log: { create: vi.fn().mockResolvedValue(undefined) } } },
  },
}));

vi.mock("@/lib/axiom", () => ({
  axiomIngest: vi.fn().mockResolvedValue(undefined),
}));

import { db8 } from "@/lib/db.prisma8";
import { axiomIngest } from "@/lib/axiom";
import type { CanonicalLogRecord } from "@/lib/log/server";
import { safeForNeon } from "@/lib/log/server";
import { logj } from "@/lib/log/logj";

beforeEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

//
// ────────────────────────────────────────────────────────────────
// safeForNeon tests
// ────────────────────────────────────────────────────────────────
//
describe("safeForNeon", () => {
  test("handles unsupported types", () => {
    const req = new Request("https://example.com");
    const out = safeForNeon(req) as Record<string, unknown>;
    expect(out.unsupported).toBe(true);
    expect(out.type).toBe("Request");
  });

  test("truncates large JSON", () => {
    const big = { x: "a".repeat(300_000) };
    const out = safeForNeon(big) as Record<string, unknown>;
    expect(out.truncated).toBe(true);
    expect(out.originalSize).toBeGreaterThan(200_000);
  });

  test("handles serialization failure", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const out = safeForNeon(circular) as Record<string, unknown>;
    expect(out.truncated).toBe(true);
    expect(out.error).toBe("serialization_failed");
  });
});

//
// ────────────────────────────────────────────────────────────────
// logj tests
// ────────────────────────────────────────────────────────────────
//
describe("logj", () => {
  test("creates a valid log record", async () => {
    await logj({
      domain: "test",
      level: "info",
      message: "hello",
    });

    expect(vi.mocked(db8.orm.public.Log.create).mock.calls.length).toBe(1);
    expect(vi.mocked(axiomIngest).mock.calls.length).toBe(1);

    const call = vi.mocked(db8.orm.public.Log.create).mock
      .calls[0]![0] as CanonicalLogRecord;
    expect(call.domain).toBe("test");
    expect(call.level).toBe("info");
    expect(call.message).toBe("hello");
  });

  test("applies default canonical fields", async () => {
    await logj({
      domain: "test",
      level: "info",
      message: "msg",
    });

    const call = vi.mocked(db8.orm.public.Log.create).mock
      .calls[0]![0] as CanonicalLogRecord;

    expect(call.userId).toBeNull();
    expect(call.sessionEmail).toBeNull();
    expect(call.sessionUser).toBeNull();
    expect(call.requestId).toBeNull();
  });

  test("prefixes message with eventIndex", async () => {
    await logj({
      domain: "test",
      level: "info",
      message: "hello",
      meta: { built: { eventIndex: 3 } },
    });

    const call = vi.mocked(db8.orm.public.Log.create).mock
      .calls[0]![0] as CanonicalLogRecord;
    expect(call.message).toBe("#3 hello");
  });

  //
  // Zod failure (line 57)
  //
  test("forces Zod validation failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "", // invalid
      level: "info",
      message: "hello",
    });

    expect(spy).toHaveBeenCalled();
    expect(vi.mocked(db8.orm.public.Log.create).mock.calls.length).toBe(0);
    expect(vi.mocked(axiomIngest).mock.calls.length).toBe(0);
  });

  //
  // DB failure → catch block (line 71)
  //
  test("hits catch block when DB write throws", async () => {
    vi.mocked(db8.orm.public.Log.create).mockRejectedValueOnce(
      new Error("DB fail"),
    );

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "hello",
    });

    expect(spy).toHaveBeenCalled();
    expect(axiomIngest).toHaveBeenCalledTimes(1);
  });

  //
  // Axiom failure → catch block (line 71)
  //
  test("handles Axiom failure", async () => {
    vi.mocked(axiomIngest).mockRejectedValueOnce(new Error("Axiom fail"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "msg",
    });

    expect(spy).toHaveBeenCalled();
  });
});
