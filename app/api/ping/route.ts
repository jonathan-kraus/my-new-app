// app/api/ping/route.ts
import { NextResponse, NextRequest } from "next/server";
import { logj } from "@/lib/log/logj";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { auth } from "@/auth";
import { headers } from "next/headers";
import { fetchWeatherApi } from "openmeteo";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const h = await headers(); // ✅ await the Promise
  const session = await auth();
  const c = await cookies();
  console.log("PING cookies:", c.getAll());
  console.log("PING session:", session);
  console.log("PING req:", req);

  console.log("PING cookie header:", h.get("cookie"));

  const built = await buildUniversalContext(req, "PING");
  await logj({
    domain: "jonathan",
    level: "info",
    message: "Starting ping request for weather fetch",
    file: "app/api/ping/route.ts",
    line: 16,
    payload: {},
    meta: {
      built,
    },
  });
  const params = {
    latitude: 40.15,
    longitude: -75.1,
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

  // Attributes for timezone and location
  const latitude = response.latitude();
  const longitude = response.longitude();
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
    line: 68,
    payload: {
      latitude: latitude,
      longitude: longitude,
      Elevation: elevation,
      Timezone: timezone,
      timezoneAbbreviation: timezoneAbbreviation,
      utcOffsetSeconds: utcOffsetSeconds,
    },
    meta: {
      built,
    },
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
    line: 143,
    payload: {
      Currenttime: weatherData.current.time,
      Currenttemperature_2m: weatherData.current.temperature_2m,
      Currentprecipitation: weatherData.current.precipitation,
      Currentweather_code: weatherData.current.weather_code,
      Currentcloud_cover: weatherData.current.cloud_cover,
    },
    meta: {
      built,
    },
  });
  console.log("\nDaily data:\n", weatherData.daily);

  // (await log.api("ephemeris", "Called Ping"),
  //   {
  //     Dailydata: weatherData.daily,
  //   });

  return NextResponse.json({
    daily,
    current,
    ok: true,
    local: new Date().toLocaleString("en-US", { timeZone: "America/New_York" }),
  });
}

export async function POST() {
  return NextResponse.json({ ok: true, time: Date.now() });
}
