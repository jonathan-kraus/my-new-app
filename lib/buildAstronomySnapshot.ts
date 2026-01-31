// lib/ephemeris/buildAstronomySnapshot.ts

import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";
import { format } from "date-fns";
import { logit } from "@/lib/log/logit";

function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2);
}

function parseOffsetDateString(ts: string): Date {
  return new Date(ts); // preserves offset
}

/**
 * Normalize API time strings:
 * - "07:09" → "07:09:00-05:00"
 * - "07:09:00" → "07:09:00-05:00"
 * - "07:09:00-05:00" → unchanged
 * - "-" → null
 */
function normalizeTimeString(raw: string | null, offset: string): string | null {
  if (!raw || raw === "-") return null;

  // Already has offset
  if (/[+-]\d{2}:\d{2}$/.test(raw)) return raw;

  // Add seconds if missing
  const parts = raw.split(":");
  if (parts.length === 2) raw = `${raw}:00`;

  return `${raw}${offset}`;
}

export async function buildAstronomySnapshot(
  location: { id: string; latitude: number; longitude: number },
  targetDate: Date,
) {
  const domain = "ephemeris.snapshot.build";

  await logit(domain, {
    level: "info",
    message: "Starting buildAstronomySnapshot",
    data: { location, targetDate }
  });

  const { latitude, longitude } = location;

  // Normalize to local midnight
  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  await logit(domain, {
    level: "debug",
    message: "Normalized target date",
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
await logit(domain, {
  level: "error",
  message: "DEBUG: astronomy payload",
  data: astro
});

  //
  // --- OFFSET EXTRACTION (patched) ---
  //
  const offset = astro.timezone;

  if (!offset || !/[+-]\d{2}:\d{2}/.test(offset)) {
    await logit(domain, {
      level: "error",
      message: "Astronomy API missing timezone field",
      data: { timezone: astro.timezone }
    });
    throw new Error("Astronomy API did not include timezone offset");
  }

  await logit(domain, {
    level: "debug",
    message: "Extracted timezone offset",
    data: { offset }
  });

  //
  // --- NORMALIZE ALL TIME STRINGS ---
  //
  const sunriseNorm = normalizeTimeString(astro.sunrise, offset);
  const sunsetNorm = normalizeTimeString(astro.sunset, offset);

  const sunriseBlueStartNorm = normalizeTimeString(astro.morning.blue_hour_begin, offset);
  const sunriseBlueEndNorm = normalizeTimeString(astro.morning.blue_hour_end, offset);
  const sunsetBlueStartNorm = normalizeTimeString(astro.evening.blue_hour_begin, offset);
  const sunsetBlueEndNorm = normalizeTimeString(astro.evening.blue_hour_end, offset);

  const sunriseGoldenStartNorm = normalizeTimeString(astro.morning.golden_hour_begin, offset);
  const sunriseGoldenEndNorm = normalizeTimeString(astro.morning.golden_hour_end, offset);
  const sunsetGoldenStartNorm = normalizeTimeString(astro.evening.golden_hour_begin, offset);
  const sunsetGoldenEndNorm = normalizeTimeString(astro.evening.golden_hour_end, offset);

  const moonriseNorm = normalizeTimeString(astro.moonrise, offset);
  const moonsetNorm = normalizeTimeString(astro.moonset, offset);

  await logit(domain, {
    level: "debug",
    message: "Normalized all time strings",
    data: {
      sunriseNorm,
      sunsetNorm,
      moonriseNorm,
      moonsetNorm
    }
  });

  //
  // --- REQUIRED FIELDS ---
  //
  if (!sunriseNorm || !sunsetNorm) {
    await logit(domain, {
      level: "error",
      message: "Missing required sunrise/sunset after normalization",
      data: { sunriseNorm, sunsetNorm }
    });
    throw new Error("Astronomy snapshot requires sunrise and sunset");
  }

  //
  // --- COMBINE DATE + TIME ---
  //
  const sunriseStr = combineDateTime(date, sunriseNorm);
  const sunsetStr = combineDateTime(date, sunsetNorm);

  //
  // --- SOLAR NOON ---
  //
  let solarNoon: string | null = null;

  const sunriseDate = parseOffsetDateString(sunriseStr);
  const sunsetDate = parseOffsetDateString(sunsetStr);

  const solarNoonDate = computeSolarNoon(sunriseDate, sunsetDate);
  solarNoon = format(solarNoonDate, "HH:mm:ssXXX");

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

    sunriseBlueStart: sunriseBlueStartNorm ? combineDateTime(date, sunriseBlueStartNorm) : null,
    sunriseBlueEnd: sunriseBlueEndNorm ? combineDateTime(date, sunriseBlueEndNorm) : null,
    sunsetBlueStart: sunsetBlueStartNorm ? combineDateTime(date, sunsetBlueStartNorm) : null,
    sunsetBlueEnd: sunsetBlueEndNorm ? combineDateTime(date, sunsetBlueEndNorm) : null,

    sunriseGoldenStart: sunriseGoldenStartNorm ? combineDateTime(date, sunriseGoldenStartNorm) : null,
    sunriseGoldenEnd: sunriseGoldenEndNorm ? combineDateTime(date, sunriseGoldenEndNorm) : null,
    sunsetGoldenStart: sunsetGoldenStartNorm ? combineDateTime(date, sunsetGoldenStartNorm) : null,
    sunsetGoldenEnd: sunsetGoldenEndNorm ? combineDateTime(date, sunsetGoldenEndNorm) : null,

    moonrise: moonriseNorm ? combineDateTime(date, moonriseNorm) : null,
    moonset: moonsetNorm ? combineDateTime(date, moonsetNorm) : null,

    illumination: astro.moon_illumination ?? null,
    phaseName: astro.moon_phase_name ?? null,
    moonPhase: astro.moon_phase ?? null,
  };

  await logit(domain, {
    level: "info",
    message: "Astronomy snapshot built successfully",
    data: snapshot
  });

  return snapshot;
}
