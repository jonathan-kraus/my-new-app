// lib/astronomy/buildAstronomySnapshot.ts

import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";
import { format } from "date-fns";
import { logit } from "@/lib/log/logit";

function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2);
}

function parseOffsetDateString(ts: string): Date {
  // This preserves the offset and creates a correct Date object
  return new Date(ts);
}

export async function buildAstronomySnapshot(
  location: { id: string; latitude: number; longitude: number },
  targetDate: Date,
) {
  const domain = "astronomy.snapshot.build";

  await logit(domain, {
    level: "info",
    message: "Starting buildAstronomySnapshot",
    data: { location, targetDate }
  });

  const { latitude, longitude } = location;

  // Normalize date to local midnight
  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  await logit(domain, {
    level: "debug",
    message: "Normalized target date to local midnight",
    data: { normalizedDate: date.toString() }
  });

  //
  // --- FETCH FROM IPGEO ---
  //
  async function fetchIPGeoAstronomy(lat: number, lon: number, date: Date) {
    const day = format(date, "yyyy-MM-dd");

    const url = new URL("https://api.ipgeolocation.io/v2/astronomy");
    url.searchParams.set("apiKey", process.env.IPGEO_API_KEY!);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("long", lon.toString());
    url.searchParams.set("date", day);

    await logit(domain, {
      level: "info",
      message: "Fetching IPGeolocation astronomy data",
      data: { url: url.toString() }
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
      await logit(domain, {
        level: "error",
        message: "IPGeolocation returned non-OK status",
        data: { status: res.status }
      });
      throw new Error(`IPGeolocation error: ${res.status}`);
    }

    const json = await res.json();

    await logit(domain, {
      level: "debug",
      message: "Received astronomy payload",
      data: json.astronomy
    });

    return json.astronomy;
  }

  const astro = await fetchIPGeoAstronomy(latitude, longitude, date);

  //
  // --- SOLAR TIMES ---
  //
  const sunriseStr = combineDateTime(date, astro.sunrise);
  const sunsetStr = combineDateTime(date, astro.sunset);

  await logit(domain, {
    level: "debug",
    message: "Combined sunrise/sunset into offset-preserving strings",
    data: { sunriseStr, sunsetStr }
  });

  // Convert to Date objects ONLY for math
  const sunriseDate = parseOffsetDateString(sunriseStr);
  const sunsetDate = parseOffsetDateString(sunsetStr);

  await logit(domain, {
    level: "debug",
    message: "Parsed sunrise/sunset into Date objects for solar-noon math",
    data: {
      sunriseDate: sunriseDate.toString(),
      sunsetDate: sunsetDate.toString()
    }
  });

  const solarNoonDate = computeSolarNoon(sunriseDate, sunsetDate);

  await logit(domain, {
    level: "info",
    message: "Computed solar noon",
    data: {
      solarNoonDate: solarNoonDate.toString(),
      sunrise: sunriseStr,
      sunset: sunsetStr
    }
  });

  // Convert back to offset-preserving string
  const solarNoon = format(solarNoonDate, "HH:mm:ssXXX");

  await logit(domain, {
    level: "debug",
    message: "Formatted solar noon into offset-preserving string",
    data: { solarNoon }
  });

  //
  // --- BLUE HOUR ---
  //
  const sunriseBlueStart = combineDateTime(date, astro.morning.blue_hour_begin);
  const sunriseBlueEnd = combineDateTime(date, astro.morning.blue_hour_end);
  const sunsetBlueStart = combineDateTime(date, astro.evening.blue_hour_begin);
  const sunsetBlueEnd = combineDateTime(date, astro.evening.blue_hour_end);

  //
  // --- GOLDEN HOUR ---
  //
  const sunriseGoldenStart = combineDateTime(date, astro.morning.golden_hour_begin);
  const sunriseGoldenEnd = combineDateTime(date, astro.morning.golden_hour_end);
  const sunsetGoldenStart = combineDateTime(date, astro.evening.golden_hour_begin);
  const sunsetGoldenEnd = combineDateTime(date, astro.evening.golden_hour_end);

  //
  // --- LUNAR ---
  //
  const moonrise = astro.moonrise ? combineDateTime(date, astro.moonrise) : null;
  const moonset = astro.moonset ? combineDateTime(date, astro.moonset) : null;

  const illumination = astro.moon_illumination ?? null;
  const phaseName = astro.moon_phase_name ?? null;

  function calculateMoonPhase(d: Date): number {
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();

    let r = year % 100;
    r %= 19;
    if (r > 9) r -= 19;

    r = ((r * 11) % 30) + month + day;
    if (month < 3) r += 2;

    const phase = (r < 0 ? r + 30 : r) / 30;
    return Number(phase.toFixed(4));
  }

  const moonPhase = calculateMoonPhase(date);

  await logit(domain, {
    level: "debug",
    message: "Computed lunar data",
    data: {
      moonrise,
      moonset,
      illumination,
      phaseName,
      moonPhase
    }
  });

  //
  // --- FINAL SNAPSHOT ---
  //
  const snapshot = {
    date,
    locationId: location.id,
    fetchedAt: new Date(),

    sunrise: sunriseStr,
    sunset: sunsetStr,
    solarNoon,

    sunriseBlueStart,
    sunriseBlueEnd,
    sunsetBlueStart,
    sunsetBlueEnd,

    sunriseGoldenStart,
    sunriseGoldenEnd,
    sunsetGoldenStart,
    sunsetGoldenEnd,

    moonrise,
    moonset,

    illumination,
    phaseName,
    moonPhase,
  };

  await logit(domain, {
    level: "info",
    message: "Astronomy snapshot built successfully",
    data: snapshot
  });

  return snapshot;
}
