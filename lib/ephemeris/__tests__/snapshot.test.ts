import { describe, it, expect, vi } from "vitest";

// ---------------------------------------------------------
// Mock Prisma BEFORE importing getEphemerisSnapshot
// ---------------------------------------------------------
vi.mock("@/lib/db", () => ({
  db: {
    location: {
      findUnique: vi.fn(),
    },
    astronomySnapshot: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    runtimeConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { getEphemerisSnapshot } from "../getEphemerisSnapshot";

// ---------------------------------------------------------
// Cast db to a mock-friendly type so TS allows mock methods
// ---------------------------------------------------------
const mockedDb = db as unknown as {
  astronomySnapshot: {
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  runtimeConfig: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  location: {
    findUnique: ReturnType<typeof vi.fn>;
  };
};

// ---------------------------------------------------------
// Test data
// ---------------------------------------------------------
const rows = [
  {
    date: new Date("2026-01-21T05:00:00.000Z"),
    sunrise: "2026-01-21T12:00:00.000Z",
    sunset: "2026-01-21T22:00:00.000Z",
    moonrise: "2026-01-21T23:00:00.000Z",
    moonset: "2026-01-22T10:00:00.000Z",
    illumination: 40,
    locationId: "KOP",
  },
  {
    date: new Date("2026-01-22T05:00:00.000Z"),
    sunrise: "2026-01-22T12:00:00.000Z",
    sunset: "2026-01-22T22:00:00.000Z",
    moonrise: "2026-01-22T23:00:00.000Z",
    moonset: "2026-01-23T10:00:00.000Z",
    illumination: 42,
    locationId: "KOP",
  },
];

// ---------------------------------------------------------
// Mock implementations (now TS-safe)
// ---------------------------------------------------------
mockedDb.astronomySnapshot.findFirst.mockImplementation(
  async ({ where }: { where: { date: Date; locationId: string } }) => {
    const target = new Date(where.date).toISOString().slice(0, 10);
    return (
      rows.find(
        (r) => r.date.toISOString().slice(0, 10) === target
      ) ?? null
    );
  }
);

mockedDb.astronomySnapshot.findMany.mockResolvedValue(rows);

// ---------------------------------------------------------
// TEST
// ---------------------------------------------------------
describe("getEphemerisSnapshot", () => {
  it("builds a combined solar + lunar snapshot", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-22T00:00:00Z"));

    const snap = await getEphemerisSnapshot("KOP");

    expect(snap.snapshot).not.toBeNull();
    expect(snap.snapshot!.solar).toBeDefined();
    expect(snap.snapshot!.lunar).toBeDefined();
    expect(snap.snapshot!.nextEvent).toBeDefined();
    expect(snap.snapshot!.nextEvent!.name).toBeDefined();
  });
});
