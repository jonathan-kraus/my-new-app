import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  first: vi.fn(),
  date: vi.fn(),
  cached: vi.fn(),
  loader: undefined as ((...args: string[]) => Promise<unknown>) | undefined,
}));
vi.mock("next/cache", () => ({
  unstable_cache: (loader: (...args: string[]) => Promise<unknown>) => {
    mocks.loader = loader;
    return mocks.cached;
  },
}));
vi.mock("@/lib/log/logj", () => ({ logj: vi.fn() }));
vi.mock("@/lib/log/buildj", () => ({ staticUniversalContext: () => ({}) }));
vi.mock("@/lib/db.prisma8", () => {
  const query = {
    where: (predicate: (fields: unknown) => unknown) => {
      predicate({
        locationId: { eq: vi.fn() },
        dateString: { eq: mocks.date },
      });
      return query;
    },
    first: mocks.first,
  };
  return { db8: { orm: { public: { AstronomySnapshot: query } } } };
});
import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cached.mockReset();
  mocks.first.mockResolvedValue(null);
});

it("loads both local dates through the production cache loader", async () => {
  vi.stubEnv("NODE_ENV", "production");
  mocks.cached.mockImplementation(mocks.loader!);
  const today = { id: "today" };
  const tomorrow = { id: "tomorrow" };
  mocks.first.mockResolvedValueOnce(today).mockResolvedValueOnce(tomorrow);
  expect(
    await getAstronomySnapshot("KOP", new Date("2026-09-23T01:45:00Z")),
  ).toEqual({ today, tomorrow });
  expect(mocks.date.mock.calls).toEqual([["2026-09-22"], ["2026-09-23"]]);
  expect(mocks.first).toHaveBeenCalledTimes(2);
});

it("uses a complete cache entry without additional database reads", async () => {
  vi.stubEnv("NODE_ENV", "production");
  const cached = { today: { id: "today" }, tomorrow: { id: "tomorrow" } };
  mocks.cached.mockResolvedValue(cached);
  expect(await getAstronomySnapshot("KOP")).toBe(cached);
  expect(mocks.first).not.toHaveBeenCalled();
});

it("does not access the database or cache during a production build", async () => {
  vi.stubEnv("NEXT_PHASE", "phase-production-build");
  expect(await getAstronomySnapshot("KOP")).toEqual({
    today: null,
    tomorrow: null,
  });
  expect(mocks.first).not.toHaveBeenCalled();
  expect(mocks.cached).not.toHaveBeenCalled();
});
afterEach(() => vi.unstubAllEnvs());

it.each([
  ["2026-09-23T01:45:00Z", "2026-09-22", "2026-09-23"],
  ["2026-11-01T04:30:00Z", "2026-11-01", "2026-11-02"],
])("uses New York calendar days at %s", async (instant, today, tomorrow) => {
  await getAstronomySnapshot("KOP", new Date(instant));
  expect(mocks.date.mock.calls).toEqual([[today], [tomorrow]]);
});

it("rechecks the database when a cached day is missing", async () => {
  vi.stubEnv("NODE_ENV", "production");
  mocks.cached.mockResolvedValue({ today: null, tomorrow: null });
  const today = { id: "today" };
  const tomorrow = { id: "tomorrow" };
  mocks.first.mockResolvedValueOnce(today).mockResolvedValueOnce(tomorrow);
  expect(
    await getAstronomySnapshot("KOP", new Date("2026-09-23T01:45:00Z")),
  ).toEqual({ today, tomorrow });
  expect(mocks.cached).toHaveBeenCalledWith("KOP", "2026-09-22", "2026-09-23");
});
