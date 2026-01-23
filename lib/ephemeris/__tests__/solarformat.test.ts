import { describe, it, expect } from "vitest";
import { getSolarTimeline } from "../getSolarTimeline";

describe("getSolarTimeline formatting", () => {
  it("formats times into a readable string", () => {
    const timeline = getSolarTimeline({
      date: "2026-01-22",
      sunrise: "2026-01-22T07:00:00Z",
      sunset: "2026-01-22T17:00:00Z",
      goldenHourAM: null,
      goldenHourPM: null,
      blueHourAM: null,
      blueHourPM: null,
    });

    expect(typeof timeline[0].timeFormatted).toBe("string");
    expect(timeline[0].timeFormatted.length).toBeGreaterThan(0);
  });
});
