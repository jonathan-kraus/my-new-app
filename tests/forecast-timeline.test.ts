import { expect, it } from "vitest";
import { useForecastTimeline } from "../hooks/useForecastTimeline";

it("summarizes daily highs, lows, and the temperature trend", () => {
  expect(
    useForecastTimeline({
      time: ["2026-09-19", "2026-09-20", "2026-09-21"],
      temperature_2m_max: [10, 20, 15],
      temperature_2m_min: [5, 8, 2],
    }),
  ).toEqual({
    warmestDay: "2026-09-20",
    coldestDay: "2026-09-21",
    avgHigh: 15,
    avgLow: 5,
    trend: "warming",
  });
});

it("omits the timeline while data is unavailable or empty", () => {
  expect(useForecastTimeline(undefined)).toBeNull();
  expect(useForecastTimeline(null)).toBeNull();
  expect(
    useForecastTimeline({
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
    }),
  ).toBeNull();
});

it("omits a timeline whose extreme temperature has no matching date", () => {
  expect(
    useForecastTimeline({
      time: ["2026-09-19"],
      temperature_2m_max: [10, 20],
      temperature_2m_min: [5, 2],
    }),
  ).toBeNull();
});
