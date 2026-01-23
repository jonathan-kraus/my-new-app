// lib/ephemeris/sources/fetchSolarData.ts

export type RawSolarData = {
  date: string;
  sunrise: string;
  sunset: string;
  goldenHourAM: string | null;
  goldenHourPM: string | null;
  blueHourAM: string | null;
  blueHourPM: string | null;
};

export async function fetchSolarData(
  locationId: string = "KOP",
): Promise<RawSolarData> {
  // Hardcode your location for now — you can expand this later
  const latitude = 40.0893;
  const longitude = -75.3836;
  const timezone = "America/New_York";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("timezone", timezone);
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Solar fetch failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const date = json.daily.time[0];
  const sunrise = json.daily.sunrise[0].split("T")[1];
  const sunset = json.daily.sunset[0].split("T")[1];

  // You can compute golden/blue hour later — placeholder for now
  return {
    date,
    sunrise,
    sunset,
    goldenHourAM: null,
    goldenHourPM: null,
    blueHourAM: null,
    blueHourPM: null,
  };
}
