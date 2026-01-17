export function getUnifiedNextEvent(solar: any, lunar: any) {
  const now = new Date();

  const events = [
    {
      type: "solar",
      event: "Sunrise",
      time: solar.sunrise,
    },
    {
      type: "solar",
      event: "Sunset",
      time: solar.sunset,
    },
    {
      type: "lunar",
      event: "Moonrise",
      time: lunar.moonrise,
    },
    {
      type: "lunar",
      event: "Moonset",
      time: lunar.moonset,
    },
    {
      type: "solar",
      event: "Tomorrow’s Sunrise",
      time: solar.nextSunrise,
    },
    {
      type: "lunar",
      event: "Tomorrow’s Moonrise",
      time: lunar.nextMoonrise,
    },
  ]
    .filter(e => e.time && e.time > now)
    .map(e => ({
      ...e,
      ms: e.time.getTime() - now.getTime(),
    }))
    .sort((a, b) => a.time.getTime() - b.time.getTime());

  return events[0] ?? null;
}
