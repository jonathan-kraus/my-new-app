import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Temporal } from "temporal-polyfill";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  build: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  first: vi.fn(),
  cleanup: vi.fn(),
  invalidate: vi.fn(),
  locationFilter: vi.fn(),
  dateFilter: vi.fn(),
  cutoffFilter: vi.fn(),
}));
vi.mock("@/lib/buildAstronomySnapshot", () => ({
  buildAstronomySnapshot: mocks.build,
}));
vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/buildj", () => ({ staticUniversalContext: () => ({}) }));
vi.mock("@/lib/runtime/config", () => ({ getConfig: async () => "61" }));
vi.mock("next/cache", () => ({ revalidateTag: mocks.invalidate }));
vi.mock("@/lib/db.prisma8", () => {
  const snapshots = {
    where: (predicate: unknown) => {
      if (typeof predicate === "function") {
        predicate({
          locationId: { eq: mocks.locationFilter },
          dateString: { eq: mocks.dateFilter },
        });
      }
      return snapshots;
    },
    first: mocks.first,
    create: mocks.create,
    update: mocks.update,
  };
  return {
    db8: {
      orm: {
        public: {
          Location: {
            all: async () => [
              { id: "KOP", name: "KOP", timezone: "America/New_York" },
              { id: "BKL", name: "BKL", timezone: "America/New_York" },
            ],
          },
          AstronomySnapshot: snapshots,
          Log: {
            aggregate: async (
              select: (agg: { count: () => number }) => unknown,
            ) => select({ count: () => 0 }),
            where: (predicate: (fields: unknown) => unknown) => {
              predicate({ createdAt: { lt: mocks.cutoffFilter } });
              return { deleteAndCount: mocks.cleanup };
            },
          },
        },
      },
    },
  };
});
import { GET } from "../app/api/cron/astronomy/route";

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-23T01:45:00Z"));
  mocks.build.mockResolvedValue({
    fetchedAt: new Date("2026-09-23T01:45:00Z"),
  });
  mocks.first.mockResolvedValue(null);
  mocks.cleanup.mockResolvedValue(0);
});
afterEach(() => vi.useRealTimers());

it("writes seven days for every location using Temporal timestamps and invalidates the cache", async () => {
  mocks.first.mockResolvedValueOnce({ id: "existing" });
  const response = await GET(
    new Request("https://example.test/api/cron/astronomy") as NextRequest,
  );
  expect(await response.json()).toMatchObject({ ok: true, daysProcessed: 14 });
  expect(mocks.create).toHaveBeenCalledTimes(13);
  expect(mocks.update).toHaveBeenCalledTimes(1);
  const rows = [...mocks.update.mock.calls, ...mocks.create.mock.calls].map(
    ([row]) => row,
  );
  for (const locationId of ["KOP", "BKL"]) {
    expect(
      rows
        .filter((row) => row.locationId === locationId)
        .map((row) => row.dateString)
        .sort(),
    ).toEqual([
      "2026-09-22",
      "2026-09-23",
      "2026-09-24",
      "2026-09-25",
      "2026-09-26",
      "2026-09-27",
      "2026-09-28",
    ]);
  }
  for (const row of rows) {
    expect(row.fetchedAt).toBeInstanceOf(Temporal.PlainDateTime);
    expect(row.fetchedAt.toString()).toBe("2026-09-23T01:45:00");
  }
  expect(mocks.cleanup).toHaveBeenCalledTimes(1);
  expect(mocks.locationFilter.mock.calls.map(([id]) => id)).toEqual([
    ...Array(7).fill("KOP"),
    ...Array(7).fill("BKL"),
  ]);
  expect(mocks.dateFilter.mock.calls.map(([date]) => date)).toEqual([
    ...rows
      .filter((row) => row.locationId === "KOP")
      .map((row) => row.dateString)
      .sort(),
    ...rows
      .filter((row) => row.locationId === "BKL")
      .map((row) => row.dateString)
      .sort(),
  ]);
  expect(mocks.cutoffFilter).toHaveBeenCalledWith("2026-07-24T01:45:00.000Z");
  expect(mocks.invalidate).toHaveBeenCalledWith("astronomy-snapshot", {
    expire: 0,
  });
});
