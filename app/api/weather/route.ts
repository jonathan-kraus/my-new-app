// app/api/weather/route.ts
import { logit } from "@/lib/log/server";
import { db } from "@/lib/db";

import { NextResponse } from "next/server";

const CACHE_MINUTES = Number(process.env.WEATHER_CACHE_MINUTES ?? 10);
const API_KEY = process.env.TOMORROWIO_APIKEY!;
console.log("🔥 /api/weather route executed");

export async function GET() {
	const location = await db.location.findUnique({
		where: { key: "KOP" },
	});

	if (!location) {
		await logit({
			level: "error",
			message: "Location not found",
			page: "app/api/weather/route.ts",
			line: 17,
		});
		return NextResponse.json({ error: "Location missing" }, { status: 500 });
	}

	const cutoff = new Date(Date.now() - CACHE_MINUTES * 60_000);

	const cached = await db.weatherSnapshot.findFirst({
		where: {
			locationId: location.id,
			fetchedAt: { gte: cutoff },
		},
		orderBy: { fetchedAt: "desc" },
	});

	if (cached) {
		await logit({
			level: "info",
			message: "Weather cache hit",
			page: "app/api/weather/route.ts",
			line: 37,
			data: { fetchedAt: cached.fetchedAt },
		});

		return NextResponse.json({ source: "cache", data: cached });
	}

	await logit({
		level: "info",
		message: "Weather cache miss — calling Tomorrow.io",
		page: "app/api/weather/route.ts",
		line: 48,
	});

	const res = await fetch(
		`https://api.tomorrow.io/v4/weather/realtime?location=${location.latitude},${location.longitude}&units=imperial&apikey=${API_KEY}`,
		{ headers: { accept: "application/json" } },
	);

	if (!res.ok) {
		await logit({
			level: "error",
			message: "Tomorrow.io weather fetch failed",
			page: "app/api/weather/route.ts",
			line: 61,
			data: { status: res.status },
		});
		return NextResponse.json({ error: "Weather fetch failed" }, { status: 500 });
	}

	const json = await res.json();
	const v = json.data.values;

	const snapshot = await db.weatherSnapshot.create({
		data: {
			locationId: location.id,
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

	await logit({
		level: "info",
		message: "Weather snapshot stored",
		page: "app/api/weather/route.ts",
		line: 88,
		data: snapshot,
	});

	return NextResponse.json({ source: "api", data: snapshot });
}
