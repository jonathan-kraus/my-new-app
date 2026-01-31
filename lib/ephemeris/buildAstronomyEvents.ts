// lib/ephemeris/buildAstronomyEvents.ts
import type { AstronomySnapshot } from "../generated/prisma/client";

export type AstronomyEvent = {
	label: string;
	time: Date;
};

export function buildAstronomyEvents(
	today: AstronomySnapshot,
	tomorrow: AstronomySnapshot,
): AstronomyEvent[] {
	const raw = [
		// Solar
		{ label: "Sunrise", time: today.sunrise },
		{ label: "Solar Noon", time: today.solarNoon },
		{ label: "Sunset", time: today.sunset },

		// Blue hour
		{ label: "Sunrise Blue Start", time: today.sunriseBlueStart },
		{ label: "Sunrise Blue End", time: today.sunriseBlueEnd },
		{ label: "Sunset Blue Start", time: today.sunsetBlueStart },
		{ label: "Sunset Blue End", time: today.sunsetBlueEnd },

		// Lunar
		{ label: "Moonrise", time: today.moonrise },
		{ label: "Moonset", time: today.moonset },

		// Tomorrow
		tomorrow.sunrise && { label: "Tomorrow Sunrise", time: tomorrow.sunrise },
		tomorrow.solarNoon && {
			label: "Tomorrow Solar Noon",
			time: tomorrow.solarNoon,
		},
		tomorrow.sunset && { label: "Tomorrow Sunset", time: tomorrow.sunset },
		tomorrow.moonrise && {
			label: "Tomorrow Moonrise",
			time: tomorrow.moonrise,
		},
		tomorrow.moonset && { label: "Tomorrow Moonset", time: tomorrow.moonset },
	].filter(Boolean) as { label: string; time: string | Date | null }[];

	const now = new Date();

	return raw
		.filter((e) => e.time)
		.map((e) => ({ ...e, time: new Date(e.time!) }))
		.filter((e) => e.time > now)
		.sort((a, b) => a.time.getTime() - b.time.getTime());
}
