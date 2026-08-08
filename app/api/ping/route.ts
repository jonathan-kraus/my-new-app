// app/api/ping/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { auth } from "@/auth";
import { headers, cookies } from "next/headers";
import { fetchWeatherApi } from "openmeteo";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const h = await headers(); // ✅ await the Promise
  const session = await auth();
  const c = await cookies();
  let jei = 0;

  const built = await buildUniversalContext(req, "PING");
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Starting ping request for weather fetch",
    file: "app/api/ping/route.ts",
    line: 25,
    payload: {},
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // Fetch location from database
  const location = await db.location.findFirst({
    where: { key: "KOP" },
  });

  const latitude = location?.latitude ?? 40.15;
  const longitude = location?.longitude ?? -75.1;

  const params = {
    latitude,
    longitude,
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "rain_sum",
      "precipitation_sum",
      "wind_speed_10m_max",
    ],

    current: ["temperature_2m", "precipitation", "weather_code", "cloud_cover"],
    timezone: "America/New_York",
    forecast_days: 1,
    wind_speed_unit: "mph",
    temperature_unit: "fahrenheit",
    precipitation_unit: "inch",
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, params);

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];
  if (!response) {
    throw new Error("Expected response to be defined");
  }
  // Attributes for timezone and location
  const elevation = response.elevation();
  const timezone = response.timezone();
  const timezoneAbbreviation = response.timezoneAbbreviation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  console.log(
    `\nCoordinates: ${latitude}°N ${longitude}°E`,
    `\nElevation: ${elevation}m asl`,
    `\nTimezone: ${timezone} ${timezoneAbbreviation}`,
    `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
  );
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Ping retrieved open-meteo weather forecast",
    file: "app/api/ping/route.ts",
    line: 75,
    payload: {
      latitude: latitude,
      longitude: longitude,
      Elevation: elevation,
      Timezone: timezone,
      timezoneAbbreviation: timezoneAbbreviation,
      utcOffsetSeconds: utcOffsetSeconds,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const current = response.current()!;

  const daily = response.daily()!;

  // Define Int64 variables so they can be processed accordingly
  const sunrise = daily.variables(3)!;
  const sunset = daily.variables(4)!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    current: {
      time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
      temperature_2m: current.variables(0)!.value(),
      precipitation: current.variables(1)!.value(),
      weather_code: current.variables(2)!.value(),
      cloud_cover: current.variables(3)!.value(),
    },

    daily: {
      time: Array.from(
        {
          length:
            (Number(daily.timeEnd()) - Number(daily.time())) / daily.interval(),
        },
        (_, i) =>
          new Date(
            (Number(daily.time()) + i * daily.interval() + utcOffsetSeconds) *
              1000,
          ),
      ),
      weather_code: daily.variables(0)!.valuesArray(),
      temperature_2m_max: daily.variables(1)!.valuesArray(),
      temperature_2m_min: daily.variables(2)!.valuesArray(),
      // Map Int64 values to according structure
      sunrise: [...Array(sunrise.valuesInt64Length())].map(
        (_, i) =>
          new Date((Number(sunrise.valuesInt64(i)) + utcOffsetSeconds) * 1000),
      ),
      // Map Int64 values to according structure
      sunset: [...Array(sunset.valuesInt64Length())].map(
        (_, i) =>
          new Date((Number(sunset.valuesInt64(i)) + utcOffsetSeconds) * 1000),
      ),
      rain_sum: daily.variables(5)!.valuesArray(),
      precipitation_sum: daily.variables(6)!.valuesArray(),
      wind_speed_10m_max: daily.variables(7)!.valuesArray(),
    },
  };

  // The 'weatherData' object now contains a simple structure, with arrays of datetimes and weather information
  console.log(
    `\nCurrent time: ${weatherData.current.time}\n`,
    `\nCurrent temperature_2m: ${weatherData.current.temperature_2m}`,
    `\nCurrent precipitation: ${weatherData.current.precipitation}`,
    `\nCurrent weather_code: ${weatherData.current.weather_code}`,
    `\nCurrent cloud_cover: ${weatherData.current.cloud_cover}`,
  );
  await logj({
    domain: "jonathan",
    level: "info",
    message: "ping processed weather data",
    file: "app/api/ping/route.ts",
    line: 153,
    payload: {
      Currenttime: weatherData.current.time,
      Currenttemperature_2m: weatherData.current.temperature_2m,
      Currentprecipitation: weatherData.current.precipitation,
      Currentweather_code: weatherData.current.weather_code,
      Currentcloud_cover: weatherData.current.cloud_cover,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("\nDaily data:\n", weatherData.daily);

  // Fetch ISS pass data for the location
  const issUrl = "https://api.wheretheiss.at/v1/satellites/25544";
  let issPassData = null;

  try {
    const issResponse = await fetch(issUrl, { cache: "no-store" });
    issPassData = await issResponse.json();

    await logj({
      domain: "jonathan",
      level: "info",
      message: "ping retrieved ISS position data",
      file: "app/api/ping/route.ts",
      line: 178,
      payload: { issPassData, issUrl },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  } catch (error) {
    issPassData = { error: "ISS API failed", details: String(error) };

    await logj({
      domain: "jonathan",
      level: "error",
      message: "ping failed to retrieve ISS position data",
      file: "app/api/ping/route.ts",
      line: 190,
      payload: { error: String(error) },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  }

  // Fetch reverse geocode for the location of the ISS
  let issLocation = null;
  let issLatitude = 0;
  let issLongitude = 0;
  if (issPassData && !issPassData.error) {
    issLatitude = issPassData.latitude;
    issLongitude = issPassData.longitude;
    const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${issLatitude}&lon=${issLongitude}&format=json`;

    try {
      const geoRes = await fetch(geoUrl, {
        headers: { "User-Agent": "jonathan-ping-iss" },
      });
      const geo = await geoRes.json();

      await logj({
        domain: "jonathan",
        level: "info",
        message: "ping retrieved reverse geocode for ISS location",
        file: "app/api/ping/route.ts",
        line: 225,
        payload: { issLocation, geoUrl, issLatitude, issLongitude },
        meta: { built: { ...built, eventIndex: ++jei } },
      });
    } catch (err) {
      issLocation = {
        error: "ISS reverse geocode failed",
        details: String(err),
        coordinates: {
          latitude: issLatitude,
          longitude: issLongitude,
        },
      };
    }
  }

  // Calculate nearest major city to the weather location
  const majorCities = [
    { name: "New York", country: "USA", lat: 40.7128, lon: -74.006 },
    { name: "London", country: "UK", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917 },
    { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093 },
    { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456 },
    { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241 },
    { name: "São Paulo", country: "Brazil", lat: -23.5558, lon: -46.6396 },
    { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522 },
    { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777 },
  ];

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  let nearestCity = null;
  let nearestDistance = Infinity;

  for (const city of majorCities) {
    const dist = haversine(issLatitude, issLongitude, city.lat, city.lon);
    if (dist < nearestDistance) {
      nearestDistance = dist;
      nearestCity = { ...city, distanceKm: dist };
    }
  }

  // Fetch reverse geocode for the weather location
  const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  let geo = null;

  try {
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "jonathan-ping-api" }, // required by Nominatim
    });
    geo = await geoRes.json();

    await logj({
      domain: "jonathan",
      level: "info",
      message: "ping retrieved reverse geocode for weather location",
      file: "app/api/ping/route.ts",
      line: 256,
      payload: { geo, geoUrl },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
  } catch (err) {
    geo = { error: "Reverse geocode failed", details: String(err) };
  }

  return NextResponse.json({
    //daily,
    //current,
    ok: true,
    local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
    weather: weatherData,
    iss: issPassData,
    location: {
      reverseGeocode: geo?.address ?? geo,
      nearestMajorCity: nearestCity,
    },
  });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() });
}
