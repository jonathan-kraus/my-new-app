// lib/astronomy/buildAstronomySnapshot.ts

import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";
import { format } from "date-fns";
import { logit } from "@/lib/log/logit";

function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  return new Date((sunrise.getTime() + sunset.getTime()) / 2);
}

export async function buildAstronomySnapshot(
  location: { id: string; latitude: number; longitude: number },
  targetDate: Date,
) {
  const domain = "astronomy.snapshot.build";

  await logit(domain, {
    level: "info",
    message: "Starting buildAstronomySnapshot",
    data: { location, targetDate },
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
    data: { normalizedDate: date.toString() },
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
      data: { url: url.toString() },
    });

    const res = await fetch(url.toString());
    if (!res.ok) {
      await logit(domain, {
        level: "error",
        message: "IPGeolocation returned non-OK status",
        data: { status: res.status },
      });
      throw new Error(`IPGeolocation error: ${res.status}`);
    }

    const json = await res.json();

    await logit(domain, {
      level: "debug",
      message: "Received astronomy payload",
      data: json.astronomy,
    });

    return json.astronomy;
  }

  const astro = await fetchIPGeoAstronomy(latitude, longitude, date);

  //
  // --- SOLAR TIMES ---
  //
  const sunriseDate = combineDateTime(date, astro.sunrise);
  const sunsetDate = combineDateTime(date, astro.sunset);
  const solarNoonDate = computeSolarNoon(sunriseDate, sunsetDate);

  await logit(domain, {
    level: "debug",
    message: "Computed solar times",
    data: {
      sunrise_raw: astro.sunrise,
      sunset_raw: astro.sunset,
      solarNoon_computed: solarNoonDate.toString(),
    },
  });

  //
  // --- BLUE HOUR ---
  //
  const sunriseBlueStartDate = combineDateTime(
    date,
    astro.morning.blue_hour_begin,
  );
  const sunriseBlueEndDate = combineDateTime(date, astro.morning.blue_hour_end);
  const sunsetBlueStartDate = combineDateTime(
    date,
    astro.evening.blue_hour_begin,
  );
  const sunsetBlueEndDate = combineDateTime(date, astro.evening.blue_hour_end);

  //
  // --- GOLDEN HOUR ---
  //
  const sunriseGoldenStartDate = combineDateTime(
    date,
    astro.morning.golden_hour_begin,
  );
  const sunriseGoldenEndDate = combineDateTime(
    date,
    astro.morning.golden_hour_end,
  );
  const sunsetGoldenStartDate = combineDateTime(
    date,
    astro.evening.golden_hour_begin,
  );
  const sunsetGoldenEndDate = combineDateTime(
    date,
    astro.evening.golden_hour_end,
  );

  //
  // --- LUNAR ---
  //
  const moonriseDate = astro.moonrise
    ? combineDateTime(date, astro.moonrise)
    : null;
  const moonsetDate = astro.moonset
    ? combineDateTime(date, astro.moonset)
    : null;

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
      moonrise_raw: astro.moonrise,
      moonset_raw: astro.moonset,
      illumination,
      phaseName,
      moonPhase,
    },
  });

  //
  // --- FINAL SNAPSHOT ---
  //
  const snapshot = {
    date,
    locationId: location.id,
    fetchedAt: new Date(),

    // Store EXACT local strings from API — no UTC conversion
    sunrise: astro.sunrise,
    sunset: astro.sunset,
    solarNoon: format(solarNoonDate, "HH:mm:ssXXX"),

    sunriseBlueStart: astro.morning.blue_hour_begin,
    sunriseBlueEnd: astro.morning.blue_hour_end,
    sunsetBlueStart: astro.evening.blue_hour_begin,
    sunsetBlueEnd: astro.evening.blue_hour_end,

    sunriseGoldenStart: astro.morning.golden_hour_begin,
    sunriseGoldenEnd: astro.morning.golden_hour_end,
    sunsetGoldenStart: astro.evening.golden_hour_begin,
    sunsetGoldenEnd: astro.evening.golden_hour_end,

    moonrise: astro.moonrise ?? null,
    moonset: astro.moonset ?? null,

    illumination,
    phaseName,
    moonPhase,
  };

  await logit(domain, {
    level: "info",
    message: "Astronomy snapshot built successfully",
    data: snapshot,
  });

  return snapshot;
}
