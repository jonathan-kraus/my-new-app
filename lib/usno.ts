import { addDays, startOfDay } from "date-fns";

export async function fetchUSNOMultiDay(
  lat: number,
  lon: number,
  days: number
) {
  const results = [];

  for (let i = 0; i < days; i++) {
    const date = startOfDay(addDays(new Date(), i));

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const url = new URL("https://aa.usno.navy.mil/api/rstt/oneday");
    url.searchParams.set("date", dateStr);
    url.searchParams.set("coords", `${lat},${lon}`);
    url.searchParams.set("tz", "0"); // USNO returns UTC

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`USNO error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    // Required fields: sunrise, sunset
    const parseRequiredEvent = (timeStr: string | null, label: string) => {
      if (!timeStr || timeStr === "—") {
        throw new Error(`USNO missing required field: ${label}`);
      }
      return new Date(`${dateStr}T${timeStr}Z`);
    };

    // Optional fields: moonrise, moonset
    const parseOptionalEvent = (timeStr: string | null) => {
      if (!timeStr || timeStr === "—") return null;
      return new Date(`${dateStr}T${timeStr}Z`);
    };

    results.push({
      date,
      sunrise: parseRequiredEvent(json?.properties?.sunrise, "sunrise"),
      sunset: parseRequiredEvent(json?.properties?.sunset, "sunset"),
      moonrise: parseOptionalEvent(json?.properties?.moonrise),
      moonset: parseOptionalEvent(json?.properties?.moonset),
    });
  }

  return results;
}
