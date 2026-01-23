// lib/ephemeris/events.ts

// 1. Build a flat list of all solar + lunar events from a snapshot
export function buildEventList(snapshot: any) {
  if (!snapshot) return [];

  return [
    { type: "sunrise", time: snapshot.sunrise },
    { type: "sunset", time: snapshot.sunset },
    { type: "moonrise", time: snapshot.moonrise },
    { type: "moonset", time: snapshot.moonset },

    { type: "sunriseBlueStart", time: snapshot.sunriseBlueStart },
    { type: "sunriseBlueEnd", time: snapshot.sunriseBlueEnd },
    { type: "sunriseGoldenStart", time: snapshot.sunriseGoldenStart },
    { type: "sunriseGoldenEnd", time: snapshot.sunriseGoldenEnd },

    { type: "sunsetGoldenStart", time: snapshot.sunsetGoldenStart },
    { type: "sunsetGoldenEnd", time: snapshot.sunsetGoldenEnd },
    { type: "sunsetBlueStart", time: snapshot.sunsetBlueStart },
    { type: "sunsetBlueEnd", time: snapshot.sunsetBlueEnd },
  ].filter((e) => e.time);
}

// 2. Convert ISO strings to real Date objects
export function normalizeEvents(events: any[]) {
  return events.map((e) => ({
    ...e,
    date: new Date(e.time),
  }));
}

// 3. Filter out events that already happened
export function filterFutureEvents(events: any[], now: Date) {
  return events.filter((e) => e.date > now);
}

// 4. Pick the earliest upcoming event
export function pickNextEvent(events: any[]) {
  return events.sort((a, b) => a.date.getTime() - b.date.getTime())[0] ?? null;
}

// 5. Unified helper: today + tomorrow → next event
export function getNextEvent(todaySnap: any, tomorrowSnap: any) {
  const now = new Date();

  const events = [
    ...normalizeEvents(buildEventList(todaySnap)),
    ...normalizeEvents(buildEventList(tomorrowSnap)),
  ];

  const future = filterFutureEvents(events, now);

  return pickNextEvent(future);
}
export type EphemerisEventType =
  | "sunrise"
  | "sunset"
  | "sunriseBlueStart"
  | "sunriseBlueEnd"
  | "sunriseGoldenStart"
  | "sunriseGoldenEnd"
  | "sunsetGoldenStart"
  | "sunsetGoldenEnd"
  | "sunsetBlueStart"
  | "sunsetBlueEnd"
  | "moonrise"
  | "moonset";

export type SolarSnapshot = {
  date: string;
  sunrise: string;
  sunset: string;
  daylightPercent: number;
  nextEvent: {
    name: string;
    time: string;
    countdown: string;
  };
  fetchedAt: string;
};

function calculateDaylightProgress(snapshot: any): number {
  const now = new Date();
  const sunrise = new Date(snapshot.sunrise);
  const sunset = new Date(snapshot.sunset);

  if (now < sunrise) return 0;
  if (now > sunset) return 100;

  const total = sunset.getTime() - sunrise.getTime();
  const elapsed = now.getTime() - sunrise.getTime();

  return Math.round((elapsed / total) * 100);
}
