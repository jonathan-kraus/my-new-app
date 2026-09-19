type ForecastTimelineInput = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
};

export function useForecastTimeline(
  forecast: ForecastTimelineInput | null | undefined,
) {
  if (!forecast) return null;
  const highs = forecast.temperature_2m_max;
  const lows = forecast.temperature_2m_min;

  const warmestIndex = highs.indexOf(Math.max(...highs));
  const coldestIndex = lows.indexOf(Math.min(...lows));

  const warmestDay = forecast.time[warmestIndex];
  const coldestDay = forecast.time[coldestIndex];
  const firstHigh = highs[0];
  const lastHigh = highs[highs.length - 1];

  if (
    warmestDay === undefined ||
    coldestDay === undefined ||
    firstHigh === undefined ||
    lastHigh === undefined
  ) {
    return null;
  }

  const avgHigh =
    highs.reduce((a: number, b: number) => a + b, 0) / highs.length;
  const avgLow = lows.reduce((a: number, b: number) => a + b, 0) / lows.length;

  const trend =
    lastHigh > firstHigh
      ? "warming"
      : lastHigh < firstHigh
        ? "cooling"
        : "steady";

  return {
    warmestDay,
    coldestDay,
    avgHigh,
    avgLow,
    trend,
  };
}
