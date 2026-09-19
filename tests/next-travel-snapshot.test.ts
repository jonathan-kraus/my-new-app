import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DateTime, Settings } from "luxon";
import { getNextTravelSnapshot } from "@/lib/server/travel/getNextTravelSnapshot";

const query = vi.hoisted(() => ({
  include: vi.fn().mockReturnThis(),
  all: vi.fn(),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { TravelSnapshot: query } } },
}));

const originalZone = Settings.defaultZone;
beforeEach(() => {
  vi.clearAllMocks();
  Settings.defaultZone = "UTC";
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-19T12:00:00Z"));
});
afterEach(() => {
  Settings.defaultZone = originalZone;
  vi.useRealTimers();
});

const snapshot = (id: string, dates: string[]) => ({
  id,
  receivedAt: "2026-09-18T15:30:00.123",
  passengers: [{ name: "Test Passenger" }],
  travelSegments: dates.map((date) => ({ date })),
});

it("selects the soonest trip using its earliest segment and preserves output fields", async () => {
  const nearest = snapshot("nearest", [
    "Tuesday, September 22, 2026",
    "Sunday, September 20, 2026",
  ]);
  query.all.mockResolvedValue([
    snapshot("later", ["Wednesday, September 23, 2026"]),
    snapshot("past", ["Friday, September 18, 2026"]),
    snapshot("empty", []),
    nearest,
  ]);

  const trip = await getNextTravelSnapshot();
  expect(trip).toEqual({
    id: "nearest",
    receivedAt: new Date("2026-09-18T15:30:00.123Z"),
    passengers: nearest.passengers,
    segments: nearest.travelSegments,
    sortedSegments: [...nearest.travelSegments].reverse(),
    startDate: expect.any(DateTime),
  });
  expect(JSON.parse(JSON.stringify(trip)).startDate).toBe(
    "2026-09-20T00:00:00.000Z",
  );
  expect(query.include).toHaveBeenCalledWith("travelSegments");
});

it.each([
  { label: "no snapshots", rows: [] },
  { label: "no segments", rows: [snapshot("empty", [])] },
  {
    label: "past trip",
    rows: [snapshot("past", ["Friday, September 18, 2026"])],
  },
  { label: "invalid date", rows: [snapshot("invalid", ["not a date"])] },
  {
    label: "trip starting earlier today",
    rows: [snapshot("today", ["Saturday, September 19, 2026"])],
  },
])("returns null for $label", async ({ rows }) => {
  query.all.mockResolvedValue(rows);
  expect(await getNextTravelSnapshot()).toBeNull();
});
