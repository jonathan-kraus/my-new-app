export function useForecastTimeline(forecast: any) {
  const highs = forecast.temperature_2m_max;
  const lows = forecast.temperature_2m_min;

  const warmestIndex = highs.indexOf(Math.max(...highs));
  const coldestIndex = lows.indexOf(Math.min(...lows));

  const warmestDay = forecast.time[warmestIndex];
  const coldestDay = forecast.time[coldestIndex];

  const avgHigh =
    highs.reduce((a: number, b: number) => a + b, 0) / highs.length;
  const avgLow = lows.reduce((a: number, b: number) => a + b, 0) / lows.length;

  const trend =
    highs[highs.length - 1] > highs[0]
      ? "warming"
      : highs[highs.length - 1] < highs[0]
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
