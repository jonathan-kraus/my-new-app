import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    astronomySnapshot: {
      findUnique: vi.fn(),
    },
  },
}));

// Minimal deterministic test rows
const rows = [
  {
    dateString: "2026-01-21",
    date: new Date("2026-01-21T05:00:00.000Z"),
    sunrise: "2026-01-21T12:00:00.000Z",
    sunset: "2026-01-21T22:00:00.000Z",
    moonrise: "2026-01-21T23:00:00.000Z",
    moonset: "2026-01-22T10:00:00.000Z",
    illumination: 40,
    locationId: "KOP",
  },
  {
    dateString: "2026-01-22",
    date: new Date("2026-01-22T05:00:00.000Z"),
    sunrise: "2026-01-22T12:00:00.000Z",
    sunset: "2026-01-22T22:00:00.000Z",
    moonrise: "2026-01-22T23:00:00.000Z",
    moonset: "2026-01-23T10:00:00.000Z",
    illumination: 42,
    locationId: "KOP",
  },
];

describe("getEphemerisSnapshot", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock findUnique to behave like Prisma
    (prisma.astronomySnapshot.findUnique as any).mockImplementation(
      ({ where }) => {
        const { locationId, dateString } = where.locationId_dateString;
        return (
          rows.find(
            (r) =>
              r.locationId === locationId && r.dateString === dateString
          ) ?? null
        );
      }
    );
  });

  it("builds a combined solar + lunar snapshot", async () => {
    const snap = await getEphemerisSnapshot("KOP");

    // Top-level container exists
    expect(snap.snapshot).not.toBeNull();

    // Solar + lunar sections exist
    expect(snap.snapshot!.solar).toBeDefined();
    expect(snap.snapshot!.lunar).toBeDefined();

    // Basic structural checks (not brittle)
    expect(typeof snap.snapshot!.solar.sunrise).toBe("number");
    expect(typeof snap.snapshot!.solar.sunset).toBe("number");
    expect(typeof snap.snapshot!.lunar.illumination).toBe("number");
  });
});
