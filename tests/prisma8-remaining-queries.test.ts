import { beforeEach, expect, it, vi } from "vitest";
import {
  getTableDataWithPrisma,
  getModelForTable,
  getTableHistoryWithPrisma,
} from "@/lib/db/prisma-table";
import {
  refreshAstronomySnapshotsForLocation,
  getAstronomyForDashboard,
} from "@/lib/astronomy";

const mocks = vi.hoisted(() => {
  const query = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    offset: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    all: vi.fn(),
    aggregate: vi.fn(),
  };
  return {
    query,
    sql: vi.fn(),
    execute: vi.fn(),
    fetch: vi.fn(),
    compute: vi.fn((day) => day),
    build: vi.fn(),
  };
});
vi.mock("@/lib/db.prisma8", () => ({
  db8: {
    orm: {
      public: {
        Log: mocks.query,
        RuntimeConfig: mocks.query,
        DbTableStats: mocks.query,
        AstronomySnapshot: mocks.query,
      },
    },
    raw: { sql: mocks.sql },
    runtime: () => ({ execute: mocks.execute }),
  },
}));
vi.mock("@/lib/db/utils", () => ({
  excludeTables: ["User", "Account", "Session"],
}));
vi.mock("@/lib/astronomy-provider", () => ({
  fetchAstronomyMultiDay: mocks.fetch,
}));
vi.mock("@/lib/computeGoldenBlueHours", () => ({
  computeGoldenBlueHours: mocks.compute,
}));
vi.mock("@/lib/buildAstronomySnapshot", () => ({
  buildAstronomySnapshot: mocks.build,
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.query.aggregate.mockResolvedValue({ total: 101 });
  mocks.execute.mockResolvedValue({ affectedRows: 1 });
  mocks.sql.mockImplementation((strings, ...values) => ({
    affectedCount: () => ({
      build: () => ({ sql: strings.join("?"), values }),
    }),
  }));
});

it("maps database column names, UTC dates, and pagination for table responses", async () => {
  mocks.query.all.mockResolvedValue([
    { id: 1, message: "test", createdAt: "2026-09-19T12:00:00.123" },
  ]);
  const result = await getTableDataWithPrisma("Log", 2, 50);
  expect(result?.rows[0]).toMatchObject({
    id: 1,
    created_at: "2026-09-19T12:00:00.123Z",
  });
  expect(result?.rows[0]).not.toHaveProperty("createdAt");
  expect(result?.totalPages).toBe(3);
  expect(mocks.query.offset).toHaveBeenCalledWith(50);
  expect(mocks.query.limit).toHaveBeenCalledWith(50);
  expect(result?.columns).toContainEqual({
    name: "created_at",
    type: "timestamp",
    nullable: false,
  });
});

it("serializes large bigint values without losing precision", async () => {
  mocks.query.all.mockResolvedValue([{ totalBytes: 9007199254740993n }]);
  const result = await getTableDataWithPrisma("DbTableStats");
  expect(result?.rows[0]?.totalBytes).toBe("9007199254740993");
  expect(() => JSON.stringify(result)).not.toThrow();
});

it("orders runtime settings by key rather than a nonexistent id", async () => {
  mocks.query.all.mockResolvedValue([]);
  await getTableDataWithPrisma("RuntimeConfig");
  const desc = vi.fn().mockReturnValue("key desc");
  expect(mocks.query.orderBy.mock.calls[0]![0]({ key: { desc } })).toBe(
    "key desc",
  );
});

it("rejects excluded, unknown, and prototype names before querying", async () => {
  for (const name of ["User", "Missing", "constructor", "__proto__"]) {
    expect(getModelForTable(name)).toBeNull();
    expect(await getTableDataWithPrisma(name)).toBeNull();
  }
  expect(mocks.query.aggregate).not.toHaveBeenCalled();
});

it("rejects invalid pagination before querying", async () => {
  await expect(getTableDataWithPrisma("Log", 0)).rejects.toThrow(
    "Invalid pagination",
  );
  await expect(getTableDataWithPrisma("Log", 1, NaN)).rejects.toThrow(
    "Invalid pagination",
  );
  expect(mocks.query.aggregate).not.toHaveBeenCalled();
});

it("preserves ISO UTC dates in table history", async () => {
  mocks.query.all.mockResolvedValue([
    {
      tableName: "Log",
      rowEstimate: 20,
      totalBytes: 1024n,
      snapshotDate: "2026-09-19T00:00:00",
    },
  ]);
  expect(await getTableHistoryWithPrisma("Log")).toEqual([
    {
      tableName: "Log",
      rowEstimate: 20,
      totalBytes: 1024,
      snapshotDate: "2026-09-19T00:00:00.000Z",
    },
  ]);
});

it("refreshes astronomy with an atomic composite-key upsert and preserves null fields", async () => {
  const date = new Date("2026-09-19T12:00:00Z");
  mocks.fetch.mockResolvedValue([{ date }]);
  mocks.build.mockResolvedValue({
    fetchedAt: date,
    sunrise: "sunrise",
    sunset: "sunset",
    moonrise: null,
    moonPhase: null,
  });
  expect(
    await refreshAstronomySnapshotsForLocation(
      { id: "KOP", latitude: 40, longitude: -75 },
      1,
    ),
  ).toEqual({ locationId: "KOP", ok: true, daysProcessed: 1 });
  const plan = mocks.execute.mock.calls[0]![0];
  expect(plan.sql).toContain(
    'ON CONFLICT ("locationId", "dateString") DO UPDATE',
  );
  expect(JSON.parse(plan.values[0])).toMatchObject({
    locationId: "KOP",
    fetchedAt: "2026-09-19T12:00:00.000",
    moonrise: null,
    moonPhase: null,
  });
});

it("reports an astronomy write failure", async () => {
  mocks.fetch.mockResolvedValue([{ date: new Date() }]);
  mocks.build.mockResolvedValue({ fetchedAt: new Date() });
  mocks.execute.mockRejectedValueOnce(new Error("write failed"));
  expect(
    await refreshAstronomySnapshotsForLocation(
      { id: "KOP", latitude: 40, longitude: -75 },
      1,
    ),
  ).toMatchObject({ ok: false, error: "Error: write failed" });
});

it("normalizes astronomy fetchedAt to a Date", async () => {
  mocks.query.all.mockResolvedValue([
    { dateString: "2026-09-19", fetchedAt: "2026-09-19T12:00:00" },
  ]);
  const result = await getAstronomyForDashboard("KOP");
  expect(result.allSnapshots[0]?.fetchedAt).toEqual(
    new Date("2026-09-19T12:00:00Z"),
  );
});
