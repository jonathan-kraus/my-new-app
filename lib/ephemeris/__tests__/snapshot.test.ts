import { mockDb } from "@/test/__mocks__/db";

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";

const rows = [
  {
    dateString: "2026-01-21",
    date: new Date("2026-01-21T05:00:00Z"),
    sunrise: "2026-01-21T12:00:00Z",
    sunset: "2026-01-21T22:00:00Z",
    moonrise: "2026-01-21T23:00:00Z",
    moonset: "2026-01-22T10:00:00Z",
    illumination: 40,
    locationId: "KOP",
  },
  {
    dateString: "2026-01-22",
    date: new Date("2026-01-22T05:00:00Z"),
    sunrise: "2026-01-22T12:00:00Z",
    sunset: "2026-01-22T22:00:00Z",
    moonrise: "2026-01-22T23:00:00Z",
    moonset: "2026-01-23T10:00:00Z",
    illumination: 42,
    locationId: "KOP",
  },
];

describe("getEphemerisSnapshot", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-01-21T10:00:00Z"));

    mockDb.runtimeConfig.findUnique.mockResolvedValue(null);

    mockDb.astronomySnapshot.findUnique.mockImplementation(({ where }) => {
      const { locationId, dateString } = where.locationId_dateString;
      return (
        rows.find(
          (r) => r.locationId === locationId && r.dateString === dateString,
        ) ?? null
      );
    });
  });

  it("builds a combined solar + lunar snapshot", async () => {
    const snap = await getEphemerisSnapshot("KOP");

    expect(snap.snapshot).not.toBeNull();
    expect(snap.snapshot!.solar).toBeDefined();
    expect(snap.snapshot!.lunar).toBeDefined();
  });
});
