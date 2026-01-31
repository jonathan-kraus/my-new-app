import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  db: {
    runtimeConfig: { findMany: vi.fn() },
  },
}));

const { db } = await import("@/lib/db");
const mockedDb = vi.mocked(db, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/admin/runtime", () => {
  it("returns an empty list when no configs exist", async () => {
    mockedDb.runtimeConfig.findMany.mockResolvedValue([]);

    const { GET } = await import("../route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.configs).toEqual([]);
  });

  it("returns configs mapped to key/value and requests DB ordering", async () => {
    const mocked = [
      {
        key: "z.alpha",
        value: "3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: "a.beta",
        value: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        key: "m.gamma",
        value: "2",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] as any;

    mockedDb.runtimeConfig.findMany.mockResolvedValue(mocked);

    const { GET } = await import("../route");
    const res = await GET();
    const json = await res.json();

    expect(res.status).toBe(200);
    // The route asks the DB to order by key ascending
    expect(mockedDb.runtimeConfig.findMany).toHaveBeenCalledWith({
      orderBy: { key: "asc" },
    });
    // And it maps to { key, value } preserving the DB-provided order
    expect(json.configs).toEqual(
      mocked.map((c: any) => ({ key: c.key, value: c.value })),
    );
  });
});
