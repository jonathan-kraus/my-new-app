// lib/astronomy.ts
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";

const TOMORROW_API_KEY = process.env.TOMORROW_API_KEY!;
const TOMORROW_TIMELINE_URL = "https://api.tomorrow.io/v4/timelines";

type Location = {
	id: string;
	latitude: number;
	longitude: number;
	timezone: string; // e.g. "America/New_York" if you have it
};

type AstronomyDayInput = {
	date: Date;
	sunrise: Date;
	sunset: Date;
	moonrise?: Date | null;
	moonset?: Date | null;
};

type AstronomyDayComputed = AstronomyDayInput & {
	sunriseBlueStart: Date;
	sunriseBlueEnd: Date;
	sunriseGoldenStart: Date;
	sunriseGoldenEnd: Date;
	sunsetGoldenStart: Date;
	sunsetGoldenEnd: Date;
	sunsetBlueStart: Date;
	sunsetBlueEnd: Date;
};

function computeGoldenBlueHours(day: AstronomyDayInput): AstronomyDayComputed {
	const { date, sunrise, sunset, moonrise, moonset } = day;

	// You can tune these offsets however you like
	const minutes = (m: number) => m * 60 * 1000;

	const sunriseBlueStart = new Date(sunrise.getTime() - minutes(30));
	const sunriseBlueEnd = new Date(sunrise.getTime() - minutes(10));
	const sunriseGoldenStart = sunriseBlueEnd;
	const sunriseGoldenEnd = new Date(sunrise.getTime() + minutes(40));

	const sunsetGoldenStart = new Date(sunset.getTime() - minutes(40));
	const sunsetGoldenEnd = new Date(sunset.getTime() + minutes(10));
	const sunsetBlueStart = sunset;
	const sunsetBlueEnd = new Date(sunset.getTime() + minutes(30));

	return {
		date,
		sunrise,
		sunset,
		moonrise: moonrise ?? null,
		moonset: moonset ?? null,
		sunriseBlueStart,
		sunriseBlueEnd,
		sunriseGoldenStart,
		sunriseGoldenEnd,
		sunsetGoldenStart,
		sunsetGoldenEnd,
		sunsetBlueStart,
		sunsetBlueEnd,
	};
}

async function fetchAstronomyFromTomorrow(location: Location, days = 7) {
	const now = new Date();
	const startTime = startOfDay(now).toISOString();
	const endTime = startOfDay(addDays(now, days - 1)).toISOString();

	const query = {
		location: `${location.latitude},${location.longitude}`,
		fields: ["sunriseTime", "sunsetTime", "moonriseTime", "moonsetTime"],
		units: "metric",
		timesteps: ["1d"],
		startTime,
		endTime,
		timezone: location.timezone ?? "UTC",
	};

	const url = new URL(TOMORROW_TIMELINE_URL);
	url.searchParams.set("apikey", TOMORROW_API_KEY);
	url.searchParams.set("location", query.location);
	url.searchParams.set("units", query.units);
	url.searchParams.set("timesteps", "1d");
	url.searchParams.set("startTime", query.startTime);
	url.searchParams.set("endTime", query.endTime);
	url.searchParams.set("timezone", query.timezone);
	url.searchParams.set("fields", query.fields.join(","));

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Tomorrow.io error: ${res.status} ${res.statusText}`);
	}

	const json = await res.json();

	const intervals: any[] = json?.data?.timelines?.[0]?.intervals ?? [];

	const daysData: AstronomyDayInput[] = intervals.map((interval) => {
		const ts = interval.startTime;
		const date = startOfDay(new Date(ts));

		const sunrise = interval.values.sunriseTime ? new Date(interval.values.sunriseTime) : null;
		const sunset = interval.values.sunsetTime ? new Date(interval.values.sunsetTime) : null;

		if (!sunrise || !sunset) {
			throw new Error("Missing sunrise/sunset in Tomorrow.io response");
		}

		const moonrise = interval.values.moonriseTime ? new Date(interval.values.moonriseTime) : null;
		const moonset = interval.values.moonsetTime ? new Date(interval.values.moonsetTime) : null;

		return {
			date,
			sunrise,
			sunset,
			moonrise,
			moonset,
		};
	});

	return daysData;
}

export async function refreshAstronomySnapshotsForLocation(location: Location, days = 7) {
	const fetchedAt = new Date();
	const rawDays = await fetchAstronomyFromTomorrow(location, days);

	const computedDays = rawDays.map(computeGoldenBlueHours);

	const ops = computedDays.map((day) =>
		db.astronomySnapshot.upsert({
			where: {
				locationId_date: {
					locationId: location.id,
					date: day.date,
				},
			},
			create: {
				locationId: location.id,
				fetchedAt,
				date: day.date,
				sunrise: day.sunrise,
				sunset: day.sunset,
				moonrise: day.moonrise ?? undefined,
				moonset: day.moonset ?? undefined,
				sunriseBlueStart: day.sunriseBlueStart,
				sunriseBlueEnd: day.sunriseBlueEnd,
				sunriseGoldenStart: day.sunriseGoldenStart,
				sunriseGoldenEnd: day.sunriseGoldenEnd,
				sunsetGoldenStart: day.sunsetGoldenStart,
				sunsetGoldenEnd: day.sunsetGoldenEnd,
				sunsetBlueStart: day.sunsetBlueStart,
				sunsetBlueEnd: day.sunsetBlueEnd,
			},
			update: {
				fetchedAt,
				sunrise: day.sunrise,
				sunset: day.sunset,
				moonrise: day.moonrise ?? undefined,
				moonset: day.moonset ?? undefined,
				sunriseBlueStart: day.sunriseBlueStart,
				sunriseBlueEnd: day.sunriseBlueEnd,
				sunriseGoldenStart: day.sunriseGoldenStart,
				sunriseGoldenEnd: day.sunriseGoldenEnd,
				sunsetGoldenStart: day.sunsetGoldenStart,
				sunsetGoldenEnd: day.sunsetGoldenEnd,
				sunsetBlueStart: day.sunsetBlueStart,
				sunsetBlueEnd: day.sunsetBlueEnd,
			},
		}),
	);

	await db.$transaction(ops);

	return computedDays;
}

// Helper to fetch today + tomorrow for the dashboard
export async function getAstronomyForDashboard(locationId: string, now = new Date()) {
	const start = startOfDay(now);
	const tomorrow = startOfDay(addDays(now, 1));

	const snapshots = await db.astronomySnapshot.findMany({
		where: {
			locationId,
			date: { in: [start, tomorrow] },
		},
		orderBy: { date: "asc" },
	});

	const todaySnapshot = snapshots.find((s) => s.date.getTime() === start.getTime()) ?? null;
	const tomorrowSnapshot = snapshots.find((s) => s.date.getTime() === tomorrow.getTime()) ?? null;

	return { todaySnapshot, tomorrowSnapshot };
}
