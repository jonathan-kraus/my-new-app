import { describe, it, expect } from "vitest";
import { normalizeAstronomySnapshot } from "../../astronomy/normalize";

describe("normalizeAstronomySnapshot", () => {
  it("returns null when row is null", () => {
    expect(normalizeAstronomySnapshot(null)).toBeNull();
  });

  it("passes through all fields unchanged", () => {
    const row = {
      id: "abc123",
      date: new Date("2026-01-21T05:00:00.000Z"),
      createdAt: new Date("2026-01-21T06:00:00.000Z"),
      locationId: "KOP",
      fetchedAt: new Date("2026-01-21T07:00:00.000Z"),

      sunrise: "2026-01-21T12:00:00.000Z",
      sunset: "2026-01-21T22:00:00.000Z",
      solarNoon: "2026-01-21T17:00:00.000Z",

      sunriseBlueStart: "2026-01-21T11:30:00.000Z",
      sunriseBlueEnd: "2026-01-21T11:50:00.000Z",
      sunsetBlueStart: "2026-01-21T21:30:00.000Z",
      sunsetBlueEnd: "2026-01-21T21:50:00.000Z",

      sunriseGoldenStart: "2026-01-21T11:45:00.000Z",
      sunriseGoldenEnd: "2026-01-21T12:15:00.000Z",
      sunsetGoldenStart: "2026-01-21T21:45:00.000Z",
      sunsetGoldenEnd: "2026-01-21T22:15:00.000Z",

      moonrise: "2026-01-21T23:00:00.000Z",
      moonset: "2026-01-22T10:00:00.000Z",
      moonPhase: 0.42,

      illumination: 40,
      phaseName: "Waxing Crescent",
    };

    const result = normalizeAstronomySnapshot(row);

    // Flat passthrough: every field should match exactly
    expect(result).toEqual(row);
  });

  it("handles missing optional fields", () => {
    const row = {
      id: "xyz",
      date: new Date(),
      createdAt: new Date(),
      locationId: "LOC",
      fetchedAt: new Date(),

      sunrise: null,
      sunset: null,
      solarNoon: null,

      sunriseBlueStart: null,
      sunriseBlueEnd: null,
      sunsetBlueStart: null,
      sunsetBlueEnd: null,

      sunriseGoldenStart: null,
      sunriseGoldenEnd: null,
      sunsetGoldenStart: null,
      sunsetGoldenEnd: null,

      moonrise: null,
      moonset: null,
      moonPhase: null,

      illumination: null,
      phaseName: null,
    };

    const result = normalizeAstronomySnapshot(row);

    expect(result).toEqual(row);
  });
});
