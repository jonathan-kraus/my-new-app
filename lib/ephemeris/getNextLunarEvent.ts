// lib/ephemeris/events/getNextLunarEvent.ts

export type NextLunarEvent = {
  name: string;
  timeISO: string;
  timeFormatted: string;
  countdown: string;
};

export function getNextLunarEvent(snapshot: {
  moonriseAbsolute: string | null;
  moonsetAbsolute: string | null;
}): NextLunarEvent {
  const now = new Date();

  const events: { name: string; time: Date }[] = [];

  // Only include events that exist
  if (snapshot.moonriseAbsolute) {
    events.push({
      name: "Moonrise",
      time: new Date(snapshot.moonriseAbsolute),
    });
  }

  if (snapshot.moonsetAbsolute) {
    events.push({
      name: "Moonset",
      time: new Date(snapshot.moonsetAbsolute),
    });
  }

  // Filter out events that already happened
  const upcoming = events.filter((e) => e.time.getTime() > now.getTime());

  // If no events remain, pick the earliest one tomorrow (rare but possible)
  const next =
    upcoming.length > 0
      ? upcoming.sort((a, b) => a.time.getTime() - b.time.getTime())[0]
      : events.sort((a, b) => a.time.getTime() - b.time.getTime())[0];

  const diffMs = next.time.getTime() - now.getTime();
  const countdown = formatCountdown(diffMs);

  return {
    name: next.name,
    timeISO: next.time.toISOString(),
    timeFormatted: next.time.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }),
    countdown,
  };
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Now";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}
