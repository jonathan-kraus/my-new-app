// app/api/weather/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { logit } from "@/lib/log/server";
import { auth } from "@/lib/auth";
import { getRuntimeNumber } from "@/lib/runtimeConfig";
import { addMinutes } from "@/lib/astronomy/formatters";

const API_KEY = process.env.TOMORROWIO_APIKEY!;
// Zod schemas
const TomorrowRealtimeSchema = z.object({
	data: z.object({
		values: z.object({
			temperature: z.number(),
			temperatureApparent: z.number().nullable(),
			humidity: z.number().nullable(),
			windSpeed: z.number().nullable(),
			windDirection: z.number().nullable(),
			pressureSurfaceLevel: z.number().nullable(),
			visibility: z.number().nullable(),
			weatherCode: z.number().nullable(),
		}),
	}),
});

const TomorrowTimelineSchema = z.object({
	data: z.object({
		timelines: z.array(
			z.object({
				intervals: z.array(
					z.object({
						values: z.object({
							sunriseTime: z.string().datetime(),
							sunsetTime: z.string().datetime(),
							moonriseTime: z.string().datetime().nullable(),
							moonsetTime: z.string().datetime().nullable(),
						}),
					}),
				),
			}),
		),
	}),
});
// Default cache windows
const DEFAULT_CURRENT_MIN = Number(process.env.WEATHER_CACHE_MINUTES ?? 10);
const DEFAULT_FORECAST_MIN = Number(process.env.FORECAST_CACHE_MINUTES ?? 30);
const DEFAULT_ASTRONOMY_HOURS = Number(process.env.ASTRONOMY_CACHE_HOURS ?? 24);

export async function GET(req: Request) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	const { searchParams } = new URL(req.url);
	const locationId = searchParams.get("locationId");

	if (!locationId) {
		return NextResponse.json({ error: "Missing locationId" }, { status: 400 });
	}

	const location = await db.location.findUnique({ where: { id: locationId } });
	if (!location) {
		return NextResponse.json({ error: "Invalid locationId" }, { status: 404 });
	}

	// Runtime overrides
	const currentCacheMin = await getRuntimeNumber("WEATHER_CACHE_MINUTES", DEFAULT_CURRENT_MIN);
	const forecastCacheMin = await getRuntimeNumber("FORECAST_CACHE_MINUTES", DEFAULT_FORECAST_MIN);
	const astronomyCacheHours = await getRuntimeNumber(
		"ASTRONOMY_CACHE_HOURS",
		DEFAULT_ASTRONOMY_HOURS,
	);

	// ----------------------------------------
	// CURRENT WEATHER (working)
	// ----------------------------------------
	const currentCutoff = new Date(Date.now() - currentCacheMin * 60_000);

	const currentCached = await db.weatherSnapshot.findFirst({
		where: { locationId, fetchedAt: { gte: currentCutoff } },
		orderBy: { fetchedAt: "desc" },
	});

	const currentAge = currentCached
		? Math.round((Date.now() - currentCached.fetchedAt.getTime()) / 60000)
		: null;

	if (currentCached) {
		await logit({
			level: "info",
			message: "Using cached current weather data",
			file: "app/api/weather/route.ts",
			data: {
				user: session?.user?.name || "Guest",
				cacheWindowMinutes: currentCacheMin,
				actualAgeMinutes: currentAge,
				locationId,
				line: 95,
			},
		});

return NextResponse.json({
  location,
  current: currentCached,
  forecast: null,
  astronomy: null,
  sources: {
    current: "cache",
    forecast: "disabled",
    astronomy: "disabled",
  },
  ages: {
    currentMinutes: currentAge,
    forecastMinutes: null,
    astronomyHours: null,
  },
});
	}

	let current;
	let currentSource: "cache" | "api";

	if (currentCached) {
		current = currentCached;
		currentSource = "cache";
	} else {
		const res = await fetch(
			`https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
		);
		await logit({
			level: "info",
			message: "Realtime weather fetch attempted",
			page: "/api/weather",
			file: "app/api/weather/route.ts",
			line: 119,
			data: { status: res },
		});
		if (!res.ok) {
			await logit({
				level: "error",
				message: "Realtime weather fetch failed",
				page: "/api/weather",
				file: "app/api/weather/route.ts",
				line: 128,
				data: { status: res.status },
			});
			return NextResponse.json({ error: "Weather fetch failed" }, { status: 500 });
		}

		const json = await res.json();
		const validated = TomorrowRealtimeSchema.safeParse(json);

		if (!validated.success) {
			await logit({
				level: "error",
				message: "Realtime weather validation failed",
				page: "/api/weather",
				data: { issues: validated.error.issues.slice(0, 3) }, // ✅ Fixed
			});
			return NextResponse.json({ error: "Invalid weather data" }, { status: 500 });
		}

		const v = validated.data.data.values;

		current = await db.weatherSnapshot.create({
			data: {
				locationId,
				temperature: v.temperature,
				feelsLike: v.temperatureApparent,
				humidity: v.humidity,
				windSpeed: v.windSpeed,
				windDirection: v.windDirection,
				pressure: v.pressureSurfaceLevel,
				visibility: v.visibility,
				weatherCode: v.weatherCode,
			},
		});

		currentSource = "api";
	}

	// ----------------------------------------
	// FORECAST (temporarily disabled)
	// ----------------------------------------
	const forecast = null;
	const forecastSource = "disabled";
	const forecastAge = null;

	// ----------------------------------------
	// ASTRONOMY (CACHED via AstronomySnapshot + Zod)
	// ----------------------------------------
	const astronomyCutoff = new Date(Date.now() - astronomyCacheHours * 60 * 60_000);

	const astronomyCached = await db.astronomySnapshot.findFirst({
		where: {
			locationId,
			fetchedAt: { gte: astronomyCutoff },
		},
		orderBy: { fetchedAt: "desc" },
	});

	let astronomy: {
		sunrise: string;
		sunset: string;
		moonrise?: string | null;
		moonset?: string | null;
		source: "tomorrow.io";
		fetchedAt: string;
	} | null = null;
	let astronomySource: "cache" | "api" | "disabled" = "disabled";
	let astronomyAge: number | null = null;

	if (astronomyCached) {
		astronomyAge = Math.round((Date.now() - astronomyCached.fetchedAt.getTime()) / 3600000);
		astronomy = {
			sunrise: astronomyCached.sunrise.toISOString(),
			sunset: astronomyCached.sunset.toISOString(),
			moonrise: astronomyCached.moonrise?.toISOString(),
			moonset: astronomyCached.moonset?.toISOString(),
			source: "tomorrow.io",
			fetchedAt: astronomyCached.fetchedAt.toISOString(),
		};
		astronomySource = "cache";
	} else {
		// Fresh API call + Zod validation
		try {
			const timelineBody = {
				location: `${location.latitude},${location.longitude}`,
				fields: ["sunriseTime", "sunsetTime", "moonriseTime", "moonsetTime"],
				units: "imperial",
				timesteps: ["1d"],
				startTime: new Date().toISOString().split("T")[0],
				endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
			};

			const res = await fetch("https://api.tomorrow.io/v4/timelines", {
				method: "POST",
				headers: { "Content-Type": "application/json", apikey: API_KEY },
				body: JSON.stringify(timelineBody),
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const json = await res.json();
			const validated = TomorrowTimelineSchema.safeParse(json);

			if (!validated.success) {
				throw new Error(`Zod: ${validated.error.issues[0]?.message ?? "invalid"}`);
			}

			const dailyData = validated.data.data.timelines[0]?.intervals[0]?.values;
			// Convert API times into Date objects
			const sunrise = new Date(dailyData.sunriseTime);
			const sunset = new Date(dailyData.sunsetTime);

			// Sunrise phases
			const sunriseBlueStart = addMinutes(sunrise, -30);
			const sunriseBlueEnd = addMinutes(sunrise, -10);
			const sunriseGoldenStart = addMinutes(sunrise, -10);
			const sunriseGoldenEnd = addMinutes(sunrise, 30);

			// Sunset phases
			const sunsetGoldenStart = addMinutes(sunset, -30);
			const sunsetGoldenEnd = sunset;
			const sunsetBlueStart = sunset;
			const sunsetBlueEnd = addMinutes(sunset, 20);

			if (dailyData?.sunriseTime && dailyData?.sunsetTime) {
				// Cache validated data
				await db.astronomySnapshot.create({
					data: {
						locationId,

						sunrise,
						sunset,

						moonrise: dailyData.moonriseTime ? new Date(dailyData.moonriseTime) : null,
						moonset: dailyData.moonsetTime ? new Date(dailyData.moonsetTime) : null,

						sunriseBlueStart,
						sunriseBlueEnd,
						sunriseGoldenStart,
						sunriseGoldenEnd,
						sunsetGoldenStart,
						sunsetGoldenEnd,
						sunsetBlueStart,
						sunsetBlueEnd,

						fetchedAt: new Date(),
					},
				});

				astronomy = {
					sunrise: dailyData.sunriseTime,
					sunset: dailyData.sunsetTime,
					moonrise: dailyData.moonriseTime,
					moonset: dailyData.moonsetTime,
					source: "tomorrow.io",
					fetchedAt: new Date().toISOString(),
				};
				astronomySource = "api";
				astronomyAge = 0;
			}
		} catch (error) {
			await logit({
				level: "warn",
				message: "Astronomy fetch failed",
				page: "/api/weather",
				data: { error: error instanceof Error ? error.message : "unknown" },
			});
		}
	}

	// ----------------------------------------
	// LOG EVERYTHING
	// ----------------------------------------
	await logit({
		level: "info",
		message: "Unified weather request",
		page: "/api/weather",
		data: {
			locationId,
			sources: {
				current: currentSource,
				forecast: forecastSource,
				astronomy: astronomySource,
			},
			ages: {
				currentMinutes: currentAge,
				forecastMinutes: forecastAge,
				astronomyHours: astronomyAge,
			},
			cacheWindows: {
				currentMinutes: currentCacheMin,
				forecastMinutes: forecastCacheMin,
				astronomyHours: astronomyCacheHours,
			},
			file: "app/api/weather/route.ts",
			line: 322,
		},
	});

	// ----------------------------------------
	// RETURN EVERYTHING
	// ----------------------------------------
	return NextResponse.json({
		location,
		current,
		forecast: forecast ?? null,
		astronomy: astronomy ?? null,
		sources: { current: currentSource, forecast: forecastSource, astronomy: astronomySource },
		ages: {
			currentMinutes: currentAge,
			forecastMinutes: forecastAge,
			astronomyHours: astronomyAge,
		},
	});
}
