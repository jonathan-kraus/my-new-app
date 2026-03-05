import { vi } from "vitest";
import { mockDb } from "@/test/__mocks__/db";
// ------------------------------------------------------------
// 1. Create a shared mock DB object so we can reference it later
// ------------------------------------------------------------

// ------------------------------------------------------------
// 2. Apply mocks BEFORE importing the module under test
// ------------------------------------------------------------
vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockReturnValue("0"), // debug off
}));

// ------------------------------------------------------------
// 3. Now import AFTER mocks are applied
// ------------------------------------------------------------
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";

// ------------------------------------------------------------
// 4. Test data
// ------------------------------------------------------------
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

// ------------------------------------------------------------
// 5. Tests
// ------------------------------------------------------------
describe("getEphemerisSnapshot", () => {
  beforeEach(() => {
    vi.setSystemTime(new Date("2026-01-21T10:00:00Z"));

    mockDb.runtimeConfig.findUnique.mockResolvedValue(null);

    mockDb.astronomySnapshot.findUnique.mockImplementation(({ where }) => {
      const { locationId, dateString } = where.locationId_dateString;
      return (
        rows.find(
          (r) => r.locationId === locationId && r.dateString === dateString
        ) ?? null
      );
    });

    mockDb.astronomySnapshot.findMany.mockResolvedValue(rows);
  });

  it("builds a combined solar + lunar snapshot", async () => {
    const snap = await getEphemerisSnapshot("KOP");

    expect(snap.snapshot).not.toBeNull();
    expect(snap.snapshot!.solar).toBeDefined();
    expect(snap.snapshot!.lunar).toBeDefined();
  });
});
