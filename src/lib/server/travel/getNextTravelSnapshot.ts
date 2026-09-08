/*
 * @FilePath: \my-new-app\lib\server\travel\getNextTravelSnapshot.ts
 */

import { db } from "@/lib/db";
import { DateTime } from "luxon";
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

export async function getNextTravelSnapshot(): Promise<ParsedTravelSnapshot | null> {
  // 1. Fetch snapshots with segments
  const snapshots = await db.travelSnapshot.findMany({
    include: { segments: true },
  });

  if (snapshots.length === 0) return null;

  // 2. Normalize + sort segments by real date
  const enriched = snapshots
    .filter((snap) => snap.segments.length > 0)
    .map((snap) => {
      const sortedSegments = [...snap.segments].sort((a, b) => {
        const da = DateTime.fromFormat(a.date, "EEEE, LLLL d, yyyy");
        const db = DateTime.fromFormat(b.date, "EEEE, LLLL d, yyyy");
        return da.toMillis() - db.toMillis();
      });

      const first = sortedSegments[0]!;
      const start = DateTime.fromFormat(first.date, "EEEE, LLLL d, yyyy");

      return {
        ...snap,
        sortedSegments,
        startDate: start, // keep as Luxon DateTime
      };
    });

  const now = DateTime.now();

  // 3. Keep only future trips
  const futureTrips = enriched.filter((t) => t.startDate >= now);

  if (futureTrips.length === 0) return null;

  // 4. Sort by soonest trip
  futureTrips.sort((a, b) => a.startDate.toMillis() - b.startDate.toMillis());

  // 5. Return the soonest upcoming trip
  return futureTrips[0] as unknown as ParsedTravelSnapshot;
}
