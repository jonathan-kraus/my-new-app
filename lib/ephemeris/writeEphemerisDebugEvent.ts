/*
 * @FilePath: \my-new-app\lib\ephemeris\writeEphemerisDebugEvent.ts
 * @Author       : Jonathan
 * @Description  : Persist ephemeris snapshots into EphemerisDebug with safe date handling.
 */

import { db } from "@/lib/db";

type IsoDateTimeString = string;
type IsoDateString = string;

export type DebugEventInput = {
	locationId: string | null;

	fetchedAt: IsoDateTimeString | null;
	createdAt: IsoDateTimeString | null;
	date: IsoDateString | null;

	sunrise: string | null;
	sunset: string | null;

	moonrise: string | null;
	moonset: string | null;
	moonPhase: number | null;

	sunriseBlueStart: string | null;
	sunriseBlueEnd: string | null;
	sunriseGoldenStart: string | null;
	sunriseGoldenEnd: string | null;
	sunsetGoldenStart: string | null;
	sunsetGoldenEnd: string | null;
	sunsetBlueStart: string | null;
	sunsetBlueEnd: string | null;

	raw: unknown;
};

export function toIsoString(value: string | null): string | null {
	if (!value) return null;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function toJsonSafe(value: unknown): any {
	try {
		return JSON.parse(JSON.stringify(value));
	} catch {
		return String(value);
	}
}

export async function writeEphemerisDebugEvent(data: DebugEventInput) {
	try {
		const safeFetchedAt = toIsoString(data.fetchedAt);
		const safeCreatedAt = toIsoString(data.createdAt);
		const safeDate = toIsoString(data.date);

		await db.ephemerisDebug.create({
			data: {
				locationId: data.locationId,

				fetchedAt: safeFetchedAt,
				createdAt: safeCreatedAt,
				date: safeDate,

				sunrise: data.sunrise,
				sunset: data.sunset,

				moonrise: data.moonrise,
				moonset: data.moonset,
				moonPhase: data.moonPhase ?? null,

				sunriseBlueStart: data.sunriseBlueStart,
				sunriseBlueEnd: data.sunriseBlueEnd,
				sunriseGoldenStart: data.sunriseGoldenStart,
				sunriseGoldenEnd: data.sunriseGoldenEnd,
				sunsetGoldenStart: data.sunsetGoldenStart,
				sunsetGoldenEnd: data.sunsetGoldenEnd,
				sunsetBlueStart: data.sunsetBlueStart,
				sunsetBlueEnd: data.sunsetBlueEnd,

				raw: toJsonSafe(data.raw),
			},
		});
	} catch (err) {
		console.error("Failed to write Ephemeris debug event:", err);
	}
}
