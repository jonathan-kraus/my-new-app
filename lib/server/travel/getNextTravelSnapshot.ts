/*
 * @FilePath: \my-new-app\lib\server\travel\getNextTravelSnapshot.ts
 * @LastEditTime: 2026-04-12 03:03:56
 */

import { db } from "@/lib/db";
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

export async function getNextTravelSnapshot(): Promise<ParsedTravelSnapshot | null> {
	// 1. Fetch all snapshots with all related data
	const snapshots = await db.travelSnapshot.findMany({
		include: {
			segments: true,
			passengers: true,
			payment: true,
			bags: true,
		},
	});

	if (snapshots.length === 0) return null;

	// 2. Compute each trip's earliest segment date
	const enriched = snapshots.map((snap) => {
		const sortedSegments = [...snap.segments].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);

		return {
			...snap,
			sortedSegments,
			startDate: new Date(sortedSegments[0].date),
		};
	});

	const now = new Date();

	// 3. Filter to only future trips
	const futureTrips = enriched.filter((t) => t.startDate >= now);

	if (futureTrips.length === 0) return null;

	// 4. Sort future trips by start date
	futureTrips.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

	// 5. Return the soonest upcoming trip
	return futureTrips[0] as unknown as ParsedTravelSnapshot;
}
