import { describe, test, expect, vi, beforeEach } from "vitest";

// Mock server-only so Vitest can import logj.ts
vi.mock("server-only", () => ({}));

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
import { logj, safeForNeon } from "@/lib/log/logj";

beforeEach(() => {
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
    const out = safeForNeon(req) as any;
    expect(out.unsupported).toBe(true);
    expect(out.type).toBe("Request");
  });

  test("truncates large JSON", () => {
    const big = { x: "a".repeat(300_000) };
    const out = safeForNeon(big) as any;
    expect(out.truncated).toBe(true);
    expect(out.originalSize).toBeGreaterThan(200_000);
  });

  test("handles serialization failure", () => {
    const circular: any = {};
    circular.self = circular;
    const out = safeForNeon(circular) as any;
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

    expect((db.log.create as any).mock.calls.length).toBe(1);
    expect((axiomIngest as any).mock.calls.length).toBe(1);

    const call = (db.log.create as any).mock.calls[0][0].data;
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

    const call = (db.log.create as any).mock.calls[0][0].data;

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

    const call = (db.log.create as any).mock.calls[0][0].data;
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
    expect((db.log.create as any).mock.calls.length).toBe(0);
    expect((axiomIngest as any).mock.calls.length).toBe(0);
  });

  //
  // DB failure → catch block (line 71)
  //
  test("hits catch block when DB write throws", async () => {
    (db.log.create as any).mockRejectedValueOnce(new Error("DB fail"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "hello",
    });

    expect(spy).toHaveBeenCalled();
  });

  //
  // Axiom failure → catch block (line 71)
  //
  test("handles Axiom failure", async () => {
    (axiomIngest as any).mockRejectedValueOnce(new Error("Axiom fail"));

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    await logj({
      domain: "test",
      level: "info",
      message: "msg",
    });

    expect(spy).toHaveBeenCalled();
  });
});
