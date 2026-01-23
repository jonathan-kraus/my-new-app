// lib/ephemeris/events/getSolarTimeline.ts

export type SolarTimelineEvent = {
  name: string;
  timeISO: string;
  timeFormatted: string;
};

export function getSolarTimeline(input: {
  date: string;
  sunrise: string; // ISO
  sunset: string; // ISO
  goldenHourAM: string | null;
  goldenHourPM: string | null;
  blueHourAM: string | null;
  blueHourPM: string | null;
}): SolarTimelineEvent[] {
  const events: SolarTimelineEvent[] = [];

  const push = (name: string, iso: string | null) => {
    if (!iso) return;
    const d = new Date(iso);
    events.push({
      name,
      timeISO: iso,
      timeFormatted: d.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
    });
  };

  // Core events
  push("Sunrise", input.sunrise);
  push("Sunset", input.sunset);

  // Optional events
  push("Golden Hour (Morning)", input.goldenHourAM);
  push("Golden Hour (Evening)", input.goldenHourPM);
  push("Blue Hour (Morning)", input.blueHourAM);
  push("Blue Hour (Evening)", input.blueHourPM);

  // Sort chronologically
  return events.sort(
    (a, b) => new Date(a.timeISO).getTime() - new Date(b.timeISO).getTime(),
  );
}
