import { db8 } from "@/lib/db.prisma8";

// Parse a combined date + time into a JS Date
function parseSegmentDateTime(segment: {
  date: string;
  departureTime: string;
}): Date | null {
  try {
    const dt = new Date(`${segment.date} ${segment.departureTime}`);
    return isNaN(dt.getTime()) ? null : dt;
  } catch {
    return null;
  }
}

export async function getNextTravelEvent(requestId?: string) {
  const rows = await db8.orm.public.TravelSnapshot.orderBy((snapshot) =>
    snapshot.receivedAt.desc(),
  )
    .include("travelSegments")
    .all();
  const snapshots = rows.map(({ travelSegments, receivedAt, ...snapshot }) => ({
    ...snapshot,
    receivedAt: new Date(`${receivedAt}Z`),
    segments: travelSegments,
  }));

  let nextEvent: {
    snapshot: (typeof snapshots)[number];
    segment: (typeof snapshots)[number]["segments"][number];
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
