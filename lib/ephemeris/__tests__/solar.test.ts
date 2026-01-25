import { describe, it, expect } from "vitest";
import { getSolarTimeline } from "../getSolarTimeline";

describe("getSolarTimeline", () => {
  it("returns a timeline including sunrise and sunset", () => {
    const timeline = getSolarTimeline({
      date: "2026-01-22",
      sunrise: "2026-01-22T07:17:00Z",
      sunset: "2026-01-22T17:00:00Z",
      goldenHourAM: null,
      goldenHourPM: null,
      blueHourAM: null,
      blueHourPM: null,
    });

    // Should contain at least sunrise + sunset
    expect(timeline.length).toBe(2);

    // Validate structure
    expect(timeline[0].name).toBeDefined();
    expect(typeof timeline[0].timeISO).toBe("string");
    expect(typeof timeline[0].timeFormatted).toBe("string");

    // Validate chronological order
    const timestamps = timeline.map((e) => new Date(e.timeISO).getTime());
    expect(timestamps[0]).toBeLessThan(timestamps[1]);
  });
});
