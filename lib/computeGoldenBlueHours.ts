export function computeGoldenBlueHours(day: {
  date: Date;
  sunrise: Date;
  sunset: Date;
  moonrise: Date | null;
  moonset: Date | null;
  moonPhase: number;
}) {
  const { sunrise, sunset } = day;

  //
  // Golden hour calculations (your existing logic)
  //
  const sunriseGoldenStart = new Date(sunrise.getTime() - 10 * 60 * 1000);
  const sunriseGoldenEnd = new Date(sunrise.getTime() + 30 * 60 * 1000);

  const sunsetGoldenStart = new Date(sunset.getTime() - 30 * 60 * 1000);
  const sunsetGoldenEnd = new Date(sunset.getTime() + 10 * 60 * 1000);

  //
  // Blue hour placeholders (until you add real twilight math)
  // For now: identical to sunrise/sunset times
  //
  const sunriseBlueStart = sunrise;
  const sunriseBlueEnd = sunrise;

  const sunsetBlueStart = sunset;
  const sunsetBlueEnd = sunset;

  return {
    ...day,

    sunriseBlueStart,
    sunriseBlueEnd,
    sunriseGoldenStart,
    sunriseGoldenEnd,

    sunsetGoldenStart,
    sunsetGoldenEnd,
    sunsetBlueStart,
    sunsetBlueEnd,
  };
}
