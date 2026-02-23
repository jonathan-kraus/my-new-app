import { db } from "@/lib/db";
import type {
  TravelSegment,
  TravelSnapshot,
} from "@/lib/generated/prisma/client";

// Parse a combined date + time into a JS Date
function parseSegmentDateTime(segment: TravelSegment): Date | null {
  try {
    const dt = new Date(`${segment.date} ${segment.departureTime}`);
    return isNaN(dt.getTime()) ? null : dt;
  } catch {
    return null;
  }
}

export async function getNextTravelEvent(requestId?: string) {
  const snapshots = await db.travelSnapshot.findMany({
    orderBy: { receivedAt: "desc" },
    include: { segments: true },
  });

  let nextEvent: {
    snapshot: TravelSnapshot & { segments: TravelSegment[] };
    segment: TravelSegment;
    departureDateTime: Date;
  } | null = null;

  const now = new Date();

  for (const snapshot of snapshots) {
    for (const segment of snapshot.segments) {
      const departureDateTime = parseSegmentDateTime(segment);
      if (!departureDateTime) continue;

      if (
        departureDateTime > now &&
        (!nextEvent || departureDateTime < nextEvent.departureDateTime)
      ) {
        nextEvent = {
          snapshot,
          segment,
          departureDateTime,
        };
      }
    }
  }

  return nextEvent;
}
