import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  getModelForTable,
  getTableDataWithPrisma,
  getTableHistoryWithPrisma,
} from "@/lib/db/prisma-table";

const mocks = vi.hoisted(() => {
  const names = [
    "AstronomySnapshot",
    "DbTableStats",
    "EphemerisDebug",
    "ForecastSnapshot",
    "GithubEvent",
    "Location",
    "Log",
    "Note",
    "RuntimeConfig",
    "ToolVersion",
    "TravelSnapshot",
    "TravelSegment",
    "WeatherSnapshot",
  ];
  const makeQuery = () => ({
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    all: vi.fn<() => Promise<Record<string, unknown>[]>>(),
    aggregate: vi.fn(),
  });
  return {
    tables: Object.fromEntries(names.map((name) => [name, makeQuery()])),
  };
});

vi.mock("@/lib/db.prisma8", () => ({ db8: { orm: { public: mocks.tables } } }));
vi.mock("@/lib/db/utils", () => ({
  excludeTables: ["User", "Account", "Session"],
}));

beforeEach(() => {
  vi.clearAllMocks();
  for (const query of Object.values(mocks.tables)) {
    query.all.mockResolvedValue([]);
    query.aggregate.mockResolvedValue({ total: 21 });
  }
});

afterEach(() => vi.useRealTimers());

it.each(Object.keys(mocks.tables))(
  "reads %s from its own collection with descending pagination",
  async (name) => {
    const query = mocks.tables[name]!;
    const key = name === "RuntimeConfig" ? "key" : "id";
    query.all.mockResolvedValue([{ [key]: "row-1" }]);

    expect(getModelForTable(name)).toBe(name);
    const result = await getTableDataWithPrisma(name, 3, 10);
    expect(result).toMatchObject({
      name,
      page: 3,
      limit: 10,
      totalRows: 21,
      totalPages: 3,
    });
    expect(result?.rows).toHaveLength(1);
    expect(result?.rows[0]).toHaveProperty(key, "row-1");
    expect(result?.columns).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: key })]),
    );
    expect(query.offset).toHaveBeenCalledWith(20);
    expect(query.limit).toHaveBeenCalledWith(10);
    expect(query.all).toHaveBeenCalledOnce();

    // Execute the ORM callbacks to verify the selected sort column and aggregate.
    const desc = vi.fn().mockReturnValue("descending");
    expect(query.orderBy.mock.calls[0]![0]({ [key]: { desc } })).toBe(
      "descending",
    );
    expect(desc).toHaveBeenCalledOnce();
    const count = vi.fn().mockReturnValue("count-expression");
    expect(query.aggregate.mock.calls[0]![0]({ count })).toEqual({
      total: "count-expression",
    });
    expect(count).toHaveBeenCalledOnce();
    for (const [otherName, otherQuery] of Object.entries(mocks.tables)) {
      if (otherName === name) continue;
      expect(otherQuery.aggregate).not.toHaveBeenCalled();
      expect(otherQuery.all).not.toHaveBeenCalled();
    }
  },
);

it("returns an empty first page with default pagination", async () => {
  mocks.tables.Log!.aggregate.mockResolvedValue({ total: 0 });
  expect(await getTableDataWithPrisma("Log")).toMatchObject({
    rows: [],
    totalRows: 0,
    totalPages: 0,
    page: 1,
    limit: 50,
  });
  expect(mocks.tables.Log!.offset).toHaveBeenCalledWith(0);
  expect(mocks.tables.Log!.limit).toHaveBeenCalledWith(50);
});

it.each([
  [0, 10],
  [-1, 10],
  [1.5, 10],
  [NaN, 10],
  [Infinity, 10],
  [1, 0],
  [1, -1],
  [1, 1.5],
  [1, NaN],
  [1, Infinity],
  [Number.MAX_SAFE_INTEGER + 1, 1],
  [1, Number.MAX_SAFE_INTEGER + 1],
  [Number.MAX_SAFE_INTEGER, 2],
])(
  "rejects invalid pagination (%s, %s) without querying",
  async (page, limit) => {
    await expect(getTableDataWithPrisma("Log", page, limit)).rejects.toThrow(
      "Invalid pagination",
    );
    expect(mocks.tables.Log!.aggregate).not.toHaveBeenCalled();
    expect(mocks.tables.Log!.all).not.toHaveBeenCalled();
  },
);

it("propagates count failures without fetching rows", async () => {
  mocks.tables.Log!.aggregate.mockRejectedValueOnce(new Error("count failed"));
  await expect(getTableDataWithPrisma("Log")).rejects.toThrow("count failed");
  expect(mocks.tables.Log!.all).not.toHaveBeenCalled();
});

it("propagates row-fetch failures", async () => {
  mocks.tables.Log!.all.mockRejectedValueOnce(new Error("read failed"));
  await expect(getTableDataWithPrisma("Log")).rejects.toThrow("read failed");
});

it("filters history to the requested table and last 30 days in chronological order", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
  const query = mocks.tables.DbTableStats!;
  query.all.mockResolvedValue([
    {
      tableName: "Log",
      rowEstimate: 20,
      totalBytes: 1024n,
      snapshotDate: "2026-09-18T12:00:00",
    },
  ]);
  expect(await getTableHistoryWithPrisma("Log")).toEqual([
    {
      tableName: "Log",
      rowEstimate: 20,
      totalBytes: 1024,
      snapshotDate: "2026-09-18T12:00:00.000Z",
    },
  ]);
  expect(query.where).toHaveBeenNthCalledWith(1, { tableName: "Log" });
  const gte = vi.fn().mockReturnValue("cutoff-filter");
  expect(query.where.mock.calls[1]![0]({ snapshotDate: { gte } })).toBe(
    "cutoff-filter",
  );
  expect(gte).toHaveBeenCalledWith("2026-08-20T12:00:00.000Z");
  const asc = vi.fn().mockReturnValue("chronological");
  expect(query.orderBy.mock.calls[0]![0]({ snapshotDate: { asc } })).toBe(
    "chronological",
  );
  expect(asc).toHaveBeenCalledOnce();
});

it("returns empty history when no snapshots exist", async () => {
  expect(await getTableHistoryWithPrisma("Log")).toEqual([]);
});
