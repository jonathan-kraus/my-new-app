export function getUnifiedNextEvent(solar: any, lunar: any) {
  const now = new Date();

  const events = [
    {
      type: "solar",
      event: "Sunrise",
      time: solar.sunrise,
      ms: solar.sunriseMs,
    },
    {
      type: "solar",
      event: "Sunset",
      time: solar.sunset,
      ms: solar.sunsetMs,
    },
    {
      type: "lunar",
      event: "Moonrise",
      time: lunar.moonrise,
      ms: lunar.moonriseMs,
    },
    {
      type: "lunar",
      event: "Moonset",
      time: lunar.moonset,
      ms: lunar.moonsetMs,
    },
    {
      type: "solar",
      event: "Tomorrow’s Sunrise",
      time: solar.nextSunrise,
      ms: solar.nextSunriseMs,
    },
    {
      type: "lunar",
      event: "Tomorrow’s Moonrise",
      time: lunar.nextMoonrise,
      ms: lunar.nextMoonriseMs,
    },
  ];

  const upcoming = events
    .filter(e => e.time && e.time > now)
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  return upcoming[0] ?? null;
}
