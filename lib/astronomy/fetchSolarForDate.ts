import { format } from "date-fns";

export async function fetchSolarForDate(lat: number, lon: number, date: Date) {
  const day = format(date, "yyyy-MM-dd");

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("timezone", "America/New_York");
  url.searchParams.set("start_date", day);
  url.searchParams.set("end_date", day);

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

  return {
    date,
    sunrise: new Date(json.daily.sunrise[0]),
    sunset: new Date(json.daily.sunset[0]),
  };
}
