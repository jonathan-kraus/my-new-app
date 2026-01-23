import { describe, it, expect, vi } from "vitest";

// Mock Prisma BEFORE importing the builder
vi.mock("@/lib/db", () => ({
  db: {
    astronomySnapshot: {
      findMany: vi.fn().mockResolvedValue([
        {
          date: new Date("2026-01-22"),
          sunrise: new Date("2026-01-22T07:00:00Z"),
          sunset: new Date("2026-01-22T17:00:00Z"),
          moonrise: new Date("2026-01-22T20:00:00Z"),
          moonset: new Date("2026-01-23T06:00:00Z"),
          illumination: 42.5,
          locationId: "KOP",
        },
        {
          date: new Date("2026-01-23"),
          sunrise: new Date("2026-01-23T07:01:00Z"),
          sunset: new Date("2026-01-23T17:01:00Z"),
          moonrise: new Date("2026-01-23T21:00:00Z"),
          moonset: new Date("2026-01-24T07:00:00Z"),
          illumination: 43.1,
          locationId: "KOP",
        },
      ]),
    },
  },
}));

import { db } from "@/lib/db";
import { getEphemerisSnapshot } from "../getEphemerisSnapshot";

describe("getEphemerisSnapshot", () => {
  it("builds a combined solar + lunar snapshot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-22T00:00:00Z"));

    const snap = await getEphemerisSnapshot("KOP");

    expect(snap.solar.sunrise.timeLocal).toBeDefined();
    expect(snap.lunar.illumination).toBe(42.5);
    expect(snap.nextEvent.name).toBeDefined();
  });
});
