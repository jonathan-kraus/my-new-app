export async function fetchAstronomyMultiDay(lat, lon, days = 7) {
  const start = new Date();
  const end = addDays(start, days - 1);

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("timezone", "America/New_York");
  url.searchParams.set("start_date", format(start, "yyyy-MM-dd"));
  url.searchParams.set("end_date", format(end, "yyyy-MM-dd"));

  const res = await fetch(url.toString());
  const json = await res.json();
  const daily = json.daily;

  // ⭐ THIS IS WHERE YOU PUT THEM ⭐
  const enriched = daily.time.map((date, i) => ({
    date,
    sunrise: daily.sunrise[i],
    sunset: daily.sunset[i],
    moonrise: `${date}T16:00`,
    moonset: `${date}T22:00`,
    moonPhase: 3
  }));

  return enriched;
}
