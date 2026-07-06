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

  // Moonrise
  if (snapshot.moonriseAbsolute) {
    const d = new Date(snapshot.moonriseAbsolute);
    if (!isNaN(d.getTime())) {
      events.push({ name: "Moonrise", time: d });
    }
  }

  // Moonset
  if (snapshot.moonsetAbsolute) {
    const d = new Date(snapshot.moonsetAbsolute);
    if (!isNaN(d.getTime())) {
      events.push({ name: "Moonset", time: d });
    }
  }

  // Fallback if no valid events
  if (events.length === 0) {
    return {
      name: "No lunar event",
      timeISO: now.toISOString(),
      timeFormatted: now.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
      }),
      countdown: "Now",
    };
  }

  // Filter out past events
  const upcoming = events.filter((e) => e.time.getTime() > now.getTime());

  // Sort helper
  const sortByTime = (arr: { name: string; time: Date }[]) =>
    arr.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Determine next event — strict TS-safe narrowing
  let next: { name: string; time: Date };

  if (upcoming.length > 0) {
    const sorted = sortByTime(upcoming);
    const first = sorted.at(0);
    if (!first) throw new Error("Unexpected empty sorted upcoming array");
    next = first;
  } else {
    const sorted = sortByTime(events);
    const first = sorted.at(0);
    if (!first) throw new Error("Unexpected empty sorted events array");
    next = first;
  }

  // Countdown
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
