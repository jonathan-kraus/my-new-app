import {
  normalizeEvents,
  buildEventList,
  filterFutureEvents,
  pickNextEvent,
} from "@/lib/ephemeris/events";
export function getNextSolarEvent(todaySnap: any, tomorrowSnap: any) {
  const now = new Date();

  const all = [
    ...normalizeEvents(buildEventList(todaySnap)),
    ...normalizeEvents(buildEventList(tomorrowSnap)),
  ].filter((e) => e.type.startsWith("sun"));

  const future = filterFutureEvents(all, now);
  return pickNextEvent(future);
}
