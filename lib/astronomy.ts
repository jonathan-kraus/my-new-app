// lib/astronomy.ts
import { addDays, startOfDay } from "date-fns";
import { db } from "@/lib/db";
import { fetchUSNOMultiDay } from "@/lib/usno";

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

// lib/usno.ts
export async function fetchUSNOAstronomy(lat: number, lon: number, date: Date) {
	// USNO expects YYYY-MM-DD
	const yyyy = date.getFullYear();
	const mm = String(date.getMonth() + 1).padStart(2, "0");
	const dd = String(date.getDate()).padStart(2, "0");
	const dateStr = `${yyyy}-${mm}-${dd}`;

	const url = new URL("https://aa.usno.navy.mil/api/rstt/oneday");
	url.searchParams.set("date", dateStr);
	url.searchParams.set("coords", `${lat},${lon}`);
	url.searchParams.set("tz", "0"); // we convert manually

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`USNO error: ${res.status} ${res.statusText}`);
	}

	const json = await res.json();

	// USNO returns times in UTC; convert to JS Date in local timezone
	function parseEvent(timeStr: string | null) {
		if (!timeStr || timeStr === "—") return null;
		return new Date(`${dateStr}T${timeStr}Z`);
	}

	return {
		sunrise: parseEvent(json?.properties?.sunrise),
		sunset: parseEvent(json?.properties?.sunset),
		moonrise: parseEvent(json?.properties?.moonrise),
		moonset: parseEvent(json?.properties?.moonset),
	};
}

export async function refreshAstronomySnapshotsForLocation(location: Location, days = 7) {
	const fetchedAt = new Date();
	const now = new Date();
	const localHour = now.getHours();

	// USNO returns no sunrise if today's sunrise is already past in UTC
	const startDate = localHour < 6 ? addDays(now, 1) : now;

	const rawDays = await fetchUSNOMultiDay(location.latitude, location.longitude, days, startDate);

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
