export function getLightPhases(sunriseIso: string, sunsetIso: string) {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);

  // Approximate windows
  const preSunriseBlueStart = new Date(sunrise.getTime() - 30 * 60_000);
  const postSunriseGoldenEnd = new Date(sunrise.getTime() + 60 * 60_000);

  const preSunsetGoldenStart = new Date(sunset.getTime() - 60 * 60_000);
  const postSunsetBlueEnd = new Date(sunset.getTime() + 30 * 60_000);

  return {
    sunriseBlueHour: {
      start: preSunriseBlueStart,
      end: sunrise,
    },
    sunriseGoldenHour: {
      start: sunrise,
      end: postSunriseGoldenEnd,
    },
    sunsetGoldenHour: {
      start: preSunsetGoldenStart,
      end: sunset,
    },
    sunsetBlueHour: {
      start: sunset,
      end: postSunsetBlueEnd,
    },
  };
}
export function getMoonLightPhases(moonriseIso?: string | null, moonsetIso?: string | null) {
  if (!moonriseIso || !moonsetIso) return null;

  const moonrise = new Date(moonriseIso);
  const moonset = new Date(moonsetIso);

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
