import { beforeEach, expect, it, vi } from "vitest";

const sql = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db/utils", () => ({ sql, excludeTables: ["User", "Session"] }));
import { getTableSize } from "@/lib/db/overview";

beforeEach(() => {
  vi.resetAllMocks();
});

it("reads live total, index, and data sizes for a mixed-case table", async () => {
  sql.mockResolvedValue([
    {
      total_bytes: "164208640",
      index_bytes: "4194304",
      table_bytes: "9437184",
    },
  ]);
  expect(await getTableSize("GithubEvent")).toEqual({
    totalBytes: 164208640,
    indexBytes: 4194304,
    tableBytes: 9437184,
  });
  const [parts, name] = sql.mock.calls[0]!;
  expect(name).toBe("GithubEvent");
  const query = parts.join("?");
  expect(query).toContain("pg_total_relation_size(c.oid)");
  expect(query).toContain("n.nspname = 'public'");
  expect(query).toContain("c.relname = ?");
});

it("does not invent a zero size for a missing table", async () => {
  sql.mockResolvedValue([]);
  expect(await getTableSize("Missing")).toBeNull();
});

it("keeps excluded tables out of the lookup", async () => {
  expect(await getTableSize("User")).toBeNull();
  expect(sql).not.toHaveBeenCalled();
});

it("propagates lookup failures instead of reporting zero", async () => {
  sql.mockRejectedValue(new Error("database unavailable"));
  await expect(getTableSize("Log")).rejects.toThrow("database unavailable");
});
