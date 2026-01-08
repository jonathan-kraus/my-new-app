import { addDays, format } from "date-fns";

export async function fetchAstronomyMultiDay(
  lat: number,
  lon: number,
  days: number = 7
) {
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
  if (!res.ok) {
    throw new Error(`Open-Meteo error: ${res.status}`);
  }

  const json: {
    daily: {
      time: string[];
      sunrise: string[];
      sunset: string[];
    };
  } = await res.json();

  const { daily } = json;

const enriched = daily.time.map((date: string, i: number) => ({
  date: new Date(date),
  sunrise: new Date(daily.sunrise[i]),
  sunset: new Date(daily.sunset[i]),
  moonrise: new Date(`${date}T16:00`),
  moonset: new Date(`${date}T22:00`),
  moonPhase: 3,
}));


  return enriched;
}
