import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma client
vi.mock("@/lib/db", () => ({
  db: {
    runtimeConfig: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { getConfig, setConfig, deleteConfig } from "./config";

// ---------------------------------------------------------
// Cast db to a mock-friendly type so TS allows mock methods
// ---------------------------------------------------------
const mockedDb = db as unknown as {
  runtimeConfig: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

describe("runtime config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getConfig", () => {
    it("returns fallback when no row exists", async () => {
      mockedDb.runtimeConfig.findUnique.mockResolvedValue(null);

      const result = await getConfig("missing", "fallback");
      expect(result).toBe("fallback");
    });

    it("parses boolean true", async () => {
      mockedDb.runtimeConfig.findUnique.mockResolvedValue({ value: "true" });

      const result = await getConfig("flag");
      expect(result).toBe(true);
    });

    it("parses boolean false", async () => {
      mockedDb.runtimeConfig.findUnique.mockResolvedValue({ value: "false" });

      const result = await getConfig("flag");
      expect(result).toBe(false);
    });

    it("parses numbers", async () => {
      mockedDb.runtimeConfig.findUnique.mockResolvedValue({ value: "42" });

      const result = await getConfig("num");
      expect(result).toBe(42);
    });

    it("returns raw string when not boolean or number", async () => {
      mockedDb.runtimeConfig.findUnique.mockResolvedValue({ value: "hello" });

      const result = await getConfig("str");
      expect(result).toBe("hello");
    });
  });

  describe("setConfig", () => {
    it("upserts and returns parsed value", async () => {
      mockedDb.runtimeConfig.upsert.mockResolvedValue({ value: "123" });

      const result = await setConfig("num", 123);
      expect(result).toBe(123);

      expect(mockedDb.runtimeConfig.upsert).toHaveBeenCalledWith({
        where: { key: "num" },
        update: { value: "123" },
        create: { key: "num", value: "123" },
      });
    });
  });

  describe("deleteConfig", () => {
    it("calls delete on the db", async () => {
      await deleteConfig("foo");

      expect(mockedDb.runtimeConfig.delete).toHaveBeenCalledWith({
        where: { key: "foo" },
      });
    });
  });
});
