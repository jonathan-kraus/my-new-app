/*
 * @FilePath: \my-new-app\lib\log\__tests__\logj.test.ts
 * @LastEditTime: 2026-06-23 00:26:42
 */
import { describe, test, expect, vi, beforeEach } from "vitest";
import { logj, safeForNeon } from "@/lib/log/logj";
import { CanonicalLogRecordSchema } from "@/lib/log/logj";

// Mock Prisma + Axiom
vi.mock("@/lib/db", () => ({
  db: {
    log: {
      create: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

vi.mock("@/lib/axiom", () => ({
  axiomIngest: vi.fn().mockResolvedValue(undefined),
}));

import { db } from "@/lib/db";
import { axiomIngest } from "@/lib/axiom";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("safeForNeon", () => {
  test("handles unsupported types", () => {
    const req = new Request("https://example.com");
    const out = safeForNeon(req);
    expect(out).toEqual({ unsupported: true, type: "Request" });
  });

  test("truncates large JSON", () => {
    const big = { x: "a".repeat(300_000) };
    const out = safeForNeon(big);
    expect(out.truncated).toBe(true);
    expect(out.originalSize).toBeGreaterThan(200_000);
  });

  test("handles serialization failure", () => {
    const circular: any = {};
    circular.self = circular;
    const out = safeForNeon(circular);
    expect(out.truncated).toBe(true);
    expect(out.error).toBe("serialization_failed");
  });
});

describe("logj", () => {
  test("creates a valid log record", async () => {
    await logj({
      domain: "test",
      level: "info",
      message: "hello",
    });

    expect(db.log.create).toHaveBeenCalledTimes(1);
    expect(axiomIngest).toHaveBeenCalledTimes(1);

    const call = db.log.create.mock.calls[0][0].data;
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

    const call = db.log.create.mock.calls[0][0].data;

    expect(call.userId).toBe("canu");
    expect(call.sessionEmail).toBe("canse");
    expect(call.sessionUser).toBe("cansu");
    expect(call.requestId).toBe("canr");
  });

  test("prefixes message with eventIndex", async () => {
    await logj({
      domain: "test",
      level: "info",
      message: "hello",
      meta: { built: { eventIndex: 3 } },
    });

    const call = db.log.create.mock.calls[0][0].data;
    expect(call.message).toBe("#3 hello");
  });

  test("handles Zod validation failure", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "", // invalid
      level: "info",
      message: "msg",
    });

    expect(spy).toHaveBeenCalled();
    expect(db.log.create).not.toHaveBeenCalled();
    expect(axiomIngest).not.toHaveBeenCalled();
  });

  test("handles DB write failure", async () => {
    vi.spyOn(db.log, "create").mockRejectedValueOnce(new Error("DB fail"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "msg",
    });

    expect(spy).toHaveBeenCalled();
  });

  test("handles Axiom failure", async () => {
    vi.spyOn(axiomIngest, "mock").mockRejectedValueOnce?.(new Error("Axiom fail"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "msg",
    });

    expect(spy).toHaveBeenCalled();
  });
});
