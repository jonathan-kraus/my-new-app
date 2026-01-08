export function getLightPhases(sunrise: Date, sunset: Date) {
  const preSunriseBlueStart = new Date(sunrise.getTime() - 30 * 60_000);
  const postSunriseGoldenEnd = new Date(sunrise.getTime() + 60 * 60_000);

  const preSunsetGoldenStart = new Date(sunset.getTime() - 60 * 60_000);
  const postSunsetBlueEnd = new Date(sunset.getTime() + 30 * 60_000);

  return {
    sunriseBlueHour: { start: preSunriseBlueStart, end: sunrise },
    sunriseGoldenHour: { start: sunrise, end: postSunriseGoldenEnd },
    sunsetGoldenHour: { start: preSunsetGoldenStart, end: sunset },
    sunsetBlueHour: { start: sunset, end: postSunsetBlueEnd },
  };
}

export function getMoonLightPhases(
  moonrise: Date | null,
  moonset: Date | null,
) {
  if (!moonrise || !moonset) return null;

  return {
    moonriseGolden: {
      start: new Date(moonrise.getTime() - 30 * 60_000),
      end: moonrise,
    },
    moonsetBlue: {
      start: moonset,
      end: new Date(moonset.getTime() + 30 * 60_000),
    },
  };
}
