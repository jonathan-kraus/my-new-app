import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";
import { format } from "date-fns";
import { logit } from "@/lib/log/logit";
import { DateTime } from "luxon";

function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2);
}

function parseOffsetDateString(ts: string): Date {
  return new Date(ts); // preserves offset
}

function normalizeTimeString(
  raw: string | null,
  offset: string,
): string | null {
  if (!raw || raw === "-") return null;

  // Already has offset
  if (/[+-]\d{2}:\d{2}$/.test(raw)) return raw;

  // Add seconds if missing
  const parts = raw.split(":");
  if (parts.length === 2) raw = `${raw}:00`;

  return `${raw}${offset}`;
}

export async function buildAstronomySnapshot(
  location: {
    id: string;
    latitude: number;
    longitude: number;
    timezone?: string;
  },
  targetDate: Date,
) {
  const domain = "ephemeris";

  await logit(domain, {
    level: "info",
    message: "Starting buildAstronomySnapshot",
    data: { location, targetDate },
  });

  const { latitude, longitude } = location;

  const date = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate(),
  );

  await logit(domain, {
    level: "debug",
    message: "bas - Normalized target date",
    data: { normalizedDate: date.toString() },
  });

  async function fetchIPGeoAstronomy(lat: number, lon: number, date: Date) {
    const day = format(date, "yyyy-MM-dd");

    const url = new URL("https://api.ipgeolocation.io/v2/astronomy");
    url.searchParams.set("apiKey", process.env.IPGEO_API_KEY!);
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("long", lon.toString());
    url.searchParams.set("date", day);

    await logit(domain, {
      level: "info",
      message: "bas - Fetching IPGeolocation astronomy data",
      data: { url: url.toString() },
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
      await logit(domain, {
        level: "error",
        message: "bas - IPGeolocation returned non-OK status",
        data: { status: res.status },
      });
      throw new Error(`IPGeolocation error: ${res.status}`);
    }

    const json = await res.json();

    await logit(domain, {
      level: "error",
      message: " DEBUG: astronomy payload",
      data: json.astronomy,
    });

    return json.astronomy;
  }

  const astro = await fetchIPGeoAstronomy(latitude, longitude, date);

  //
  // --- UNIVERSAL TIMEZONE FALLBACK ---
  //
  let offset = astro.timezone;

  // Fallback: convert IANA zone (e.g., "America/New_York") to numeric offset
  if (!offset && location.timezone) {
    await logit(domain, {
      level: "warn",
      message:
        "bas - Astronomy API missing timezone; converting IANA zone to offset",
      data: { iana: location.timezone },
    });

    try {
      const dt = DateTime.now().setZone(location.timezone);
      offset = dt.toFormat("ZZ"); // "-05:00" or "-04:00"
    } catch (err) {
      await logit(domain, {
        level: "error",
        message: "bas - Failed to convert IANA timezone to offset",
        data: { iana: location.timezone, error: String(err) },
      });
    }
  }

  // Final validation
  if (!offset || !/[+-]\d{2}:\d{2}/.test(offset)) {
    await logit(domain, {
      level: "error",
      message: "bas - Astronomy API missing timezone field",
      data: {
        apiTimezone: astro.timezone,
        locationTimezone: location.timezone,
        resolvedOffset: offset,
      },
    });

    throw new Error("Astronomy API missing timezone field");
  }

  await logit(domain, {
    level: "debug",
    message: "Using timezone offset",
    data: { offset },
  });

  //
  // --- NORMALIZE ALL TIME STRINGS ---
  //
  const sunriseNorm = normalizeTimeString(astro.sunrise, offset);
  const sunsetNorm = normalizeTimeString(astro.sunset, offset);

  const sunriseBlueStartNorm = normalizeTimeString(
    astro.morning?.blue_hour_begin,
    offset,
  );
  const sunriseBlueEndNorm = normalizeTimeString(
    astro.morning?.blue_hour_end,
    offset,
  );
  const sunsetBlueStartNorm = normalizeTimeString(
    astro.evening?.blue_hour_begin,
    offset,
  );
  const sunsetBlueEndNorm = normalizeTimeString(
    astro.evening?.blue_hour_end,
    offset,
  );

  const sunriseGoldenStartNorm = normalizeTimeString(
    astro.morning?.golden_hour_begin,
    offset,
  );
  const sunriseGoldenEndNorm = normalizeTimeString(
    astro.morning?.golden_hour_end,
    offset,
  );
  const sunsetGoldenStartNorm = normalizeTimeString(
    astro.evening?.golden_hour_begin,
    offset,
  );
  const sunsetGoldenEndNorm = normalizeTimeString(
    astro.evening?.golden_hour_end,
    offset,
  );

  const moonriseNorm = normalizeTimeString(astro.moonrise, offset);
  const moonsetNorm = normalizeTimeString(astro.moonset, offset);

  await logit(domain, {
    level: "debug",
    message: "Normalized all time strings",
    data: {
      sunriseNorm,
      sunsetNorm,
      moonriseNorm,
      moonsetNorm,
    },
  });

  //
  // --- REQUIRED FIELDS ---
  //
  if (!sunriseNorm || !sunsetNorm) {
    await logit(domain, {
      level: "error",
      message: "Missing required sunrise/sunset after normalization",
      data: { sunriseNorm, sunsetNorm },
    });
    throw new Error("Missing required sunrise/sunset after normalization");
  }

  //
  // --- COMBINE DATE + TIME ---
  //
  const sunriseStr = combineDateTime(date, sunriseNorm);
  const sunsetStr = combineDateTime(date, sunsetNorm);

  //
  // --- SOLAR NOON ---
  //
  const sunriseDate = parseOffsetDateString(sunriseStr);
  const sunsetDate = parseOffsetDateString(sunsetStr);

  const solarNoonDate = computeSolarNoon(sunriseDate, sunsetDate);
  const solarNoon = format(solarNoonDate, "yyyy-MM-dd'T'HH:mm:ssXXX");

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

    sunriseBlueStart: sunriseBlueStartNorm
      ? combineDateTime(date, sunriseBlueStartNorm)
      : null,
    sunriseBlueEnd: sunriseBlueEndNorm
      ? combineDateTime(date, sunriseBlueEndNorm)
      : null,
    sunsetBlueStart: sunsetBlueStartNorm
      ? combineDateTime(date, sunsetBlueStartNorm)
      : null,
    sunsetBlueEnd: sunsetBlueEndNorm
      ? combineDateTime(date, sunsetBlueEndNorm)
      : null,

    sunriseGoldenStart: sunriseGoldenStartNorm
      ? combineDateTime(date, sunriseGoldenStartNorm)
      : null,
    sunriseGoldenEnd: sunriseGoldenEndNorm
      ? combineDateTime(date, sunriseGoldenEndNorm)
      : null,
    sunsetGoldenStart: sunsetGoldenStartNorm
      ? combineDateTime(date, sunsetGoldenStartNorm)
      : null,
    sunsetGoldenEnd: sunsetGoldenEndNorm
      ? combineDateTime(date, sunsetGoldenEndNorm)
      : null,

    moonrise: moonriseNorm ? combineDateTime(date, moonriseNorm) : null,
    moonset: moonsetNorm ? combineDateTime(date, moonsetNorm) : null,

illumination: astro.moon_illumination_percentage
  ? Math.abs(parseFloat(astro.moon_illumination_percentage))
  : null,

    phaseName: astro.moon_phase ?? null,
    moonPhase: astro.moon_angle ?? null,
  };

  await logit(domain, {
    level: "info",
    message: "Astronomy snapshot built successfully",
    data: snapshot,
  });

  return snapshot;
}
