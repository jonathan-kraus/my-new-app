/*
 * @FilePath: \my-new-app\tests\api\weather\forecast-route.test.ts
 * @LastEditTime: 2026-07-09 00:15:29
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  locationFindUnique,
  forecastSnapshotFindFirst,
  forecastSnapshotCreate,
  logj,
} = vi.hoisted(() => ({
  locationFindUnique: vi.fn(),
  forecastSnapshotFindFirst: vi.fn(),
  forecastSnapshotCreate: vi.fn(),
  logj: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    location: {
      findUnique: locationFindUnique,
    },
    forecastSnapshot: {
      findFirst: forecastSnapshotFindFirst,
      create: forecastSnapshotCreate,
    },
    astronomySnapshot: {
      findUnique: vi.fn().mockResolvedValue({
        id: "astro-1",
        locationId: "db-location-123",
        dateString: "2026-07-09",
        sunrise: "06:30",
        sunset: "20:30",
        moonrise: "10:00",
        moonset: "23:00",
        moonPhase: 0.5,
        phaseName: "Full Moon",
        fetchedAt: new Date(),
      }),
    },
  },
}));

vi.mock("@/lib/log/logj", () => ({
  logj,
}));

vi.mock("@/lib/log/build-universal-context", () => ({
  buildUniversalContext: vi.fn(async () => ({ requestId: "req-1" })),
}));

vi.mock("@/auth", () => ({
  auth: vi.fn(async () => ({ user: { id: "user-1" } })),
}));

vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn(async () => 10),
}));

vi.mock("@/lib/astronomy/getAstronomySnapshot", () => ({
  getAstronomySnapshot: vi.fn().mockResolvedValue({
    today: {
      sunrise: "06:30",
      sunset: "20:30",
      moonrise: "10:00",
      moonset: "23:00",
      phaseName: "Full Moon",
    },
    tomorrow: null,
  }),
}));

import { GET } from "@/app/api/weather/forecast/route";

describe("GET /api/weather/forecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    forecastSnapshotFindFirst.mockResolvedValue(null);
    forecastSnapshotCreate.mockResolvedValue({
      id: "snapshot-1",
      fetchedAt: new Date("2026-07-09T00:00:00.000Z"),
    });
    locationFindUnique.mockResolvedValue({
      id: "db-location-123",
      latitude: 40.7,
      longitude: -74.0,
    });
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        current: {
          temperature: 72,
          wind_speed_10m: 8,
          relative_humidity_2m: 65,
        },
        daily: {
          time: ["2026-07-09"],
          temperature_2m_max: [80],
          temperature_2m_min: [70],
          weathercode: [1],
        },
      }),
    }) as unknown as typeof fetch;
  });

  it("uses the resolved database location id when storing and logging the forecast snapshot", async () => {
    const response = await GET(
      new Request(
        "http://localhost/api/weather/forecast?locationId=query-location-999",
      ),
    );

    expect(response.status).toBe(200);
    expect(forecastSnapshotCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          locationId: "db-location-123",
        }),
      }),
    );

    expect(logj).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "🌟 Forecast API parsed",
        payload: expect.objectContaining({ locationId: "db-location-123" }),
      }),
    );
  });
});
