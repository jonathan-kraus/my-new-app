import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { getNextTravelEvent } from "@/lib/travel/next-event";

const query = vi.hoisted(() => ({
  orderBy: vi.fn().mockReturnThis(),
  include: vi.fn().mockReturnThis(),
  all: vi.fn(),
}));
vi.mock("@/lib/db.prisma8", () => ({
  db8: { orm: { public: { TravelSnapshot: query } } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-18T12:00:00Z"));
});
afterEach(() => vi.useRealTimers());

const segment = (id: string, date: string) => ({
  id,
  date,
  departureTime: "12:00 PM",
});
const snapshot = (
  id: string,
  travelSegments: ReturnType<typeof segment>[],
) => ({
  id,
  receivedAt: "2026-09-17T15:30:00.123",
  travelSegments,
});

it("selects the earliest future departure and preserves the snapshot response shape", async () => {
  const earliest = segment("earliest", "September 20, 2026");
  query.all.mockResolvedValue([
    snapshot("newer", [
      segment("past", "September 16, 2026"),
      segment("invalid", "invalid date"),
      segment("later", "September 25, 2026"),
    ]),
    snapshot("older", [earliest]),
  ]);

  const event = await getNextTravelEvent();
  expect(event?.segment).toEqual(earliest);
  expect(event?.departureDateTime).toEqual(
    new Date("September 20, 2026 12:00 PM"),
  );
  expect(event?.snapshot).toEqual({
    id: "older",
    receivedAt: new Date("2026-09-17T15:30:00.123Z"),
    segments: [earliest],
  });
  expect(query.include).toHaveBeenCalledWith("travelSegments");
  const desc = vi.fn().mockReturnValue("descending");
  expect(query.orderBy.mock.calls[0]![0]({ receivedAt: { desc } })).toBe(
    "descending",
  );
});

it("keeps the newest snapshot when departure times tie", async () => {
  const sameDeparture = segment("flight", "September 20, 2026");
  query.all.mockResolvedValue([
    snapshot("newer", [sameDeparture]),
    snapshot("older", [sameDeparture]),
  ]);
  expect((await getNextTravelEvent())?.snapshot.id).toBe("newer");
});

it.each([
  [],
  [snapshot("empty", [])],
  [snapshot("past", [segment("past", "September 16, 2026")])],
  [snapshot("invalid", [segment("invalid", "invalid date")])],
])(
  "returns null when no future departure exists (%#)",
  async (...snapshots) => {
    query.all.mockResolvedValue(snapshots);
    expect(await getNextTravelEvent()).toBeNull();
  },
);
