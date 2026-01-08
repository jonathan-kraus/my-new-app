import { addDays, format } from "date-fns";

export async function fetchAstronomyMultiDay(
  lat: number,
  lon: number,
  days: number,
) {
  const start = new Date();
  const end = addDays(start, days - 1);

  const url = new URL("https://api.open-meteo.com/v1/astronomy");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("start_date", format(start, "yyyy-MM-dd"));
  url.searchParams.set("end_date", format(end, "yyyy-MM-dd"));
  console.log("Astronomy URL:", url.toString());

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`);
  }

  const json = await res.json();

  const out = [];

  for (let i = 0; i < json.daily.time.length; i++) {
    out.push({
      date: new Date(json.daily.time[i]),
      sunrise: new Date(json.daily.sunrise[i]),
      sunset: new Date(json.daily.sunset[i]),
      moonrise: json.daily.moonrise[i]
        ? new Date(json.daily.moonrise[i])
        : null,
      moonset: json.daily.moonset[i] ? new Date(json.daily.moonset[i]) : null,
      moonPhase: json.daily.moon_phase[i],
    });
  }

  return out;
}
