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
  ].filter(e => e.time);
}

// 2. Convert ISO strings to real Date objects
export function normalizeEvents(events: any[]) {
  return events.map(e => ({
    ...e,
    date: new Date(e.time),
  }));
}

// 3. Filter out events that already happened
export function filterFutureEvents(events: any[], now: Date) {
  return events.filter(e => e.date > now);
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
