import { describe, it, expect, vi, beforeEach } from "vitest";

const query = vi.hoisted(() => ({
  where: vi.fn().mockReturnThis(),
  first: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { RuntimeConfig: query } } },
}));
import { getConfig, setConfig, deleteConfig } from "@/lib/runtime/config";

describe("runtime config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    it("returns fallback when no row exists", async () => {
      query.first.mockResolvedValue(null);

      const result = await getConfig("missing", "fallback");
      expect(result).toBe("fallback");
    });

    it("parses boolean true", async () => {
      query.first.mockResolvedValue({ value: "true" });

      const result = await getConfig("flag");
      expect(result).toBe(true);
    });

    it("parses boolean false", async () => {
      query.first.mockResolvedValue({ value: "false" });

      const result = await getConfig("flag");
      expect(result).toBe(false);
    });

    it("parses numbers", async () => {
      query.first.mockResolvedValue({ value: "42" });

      const result = await getConfig("num");
      expect(result).toBe(42);
    });

    it("returns raw string when not boolean or number", async () => {
      query.first.mockResolvedValue({ value: "hello" });

      const result = await getConfig("str");
      expect(result).toBe("hello");
    });
  });

  describe("setConfig", () => {
    it("upserts and returns parsed value", async () => {
      query.upsert.mockResolvedValue({ value: "123" });

      const result = await setConfig("num", 123);
      expect(result).toBe(123);

      expect(query.upsert).toHaveBeenCalledWith({
        conflictOn: { key: "num" },
        update: { value: "123", updatedAt: expect.any(String) },
        create: { key: "num", value: "123", updatedAt: expect.any(String) },
      });
    });
  });

  describe("deleteConfig", () => {
    it("calls delete on the db", async () => {
      await deleteConfig("foo");

      expect(query.where).toHaveBeenCalledWith({ key: "foo" });
      expect(query.delete).toHaveBeenCalledWith();
    });
  });
});
