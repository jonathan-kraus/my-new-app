import type { LunarSnapshot } from "@/lib/ephemeris/types";

export default function LunarCard({ snapshot }: { snapshot: LunarSnapshot }) {
  const { moonrise, moonset } = snapshot;

  // Collect only valid events
  const events = [moonrise, moonset].filter(
    (e): e is NonNullable<typeof e> => !!e,
  );

  // No lunar events at all
  if (events.length === 0) {
    return (
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-1">Lunar</h3>
        <p>No lunar events today</p>
      </div>
    );
  }

  // Pick the next upcoming event
  const now = Date.now();
  const upcoming = events
    .filter((e) => new Date(e.timestamp).getTime() > now)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    )[0];

  // If none are upcoming, fall back to the last event of the day
  const next = upcoming ?? events[events.length - 1];

  return (
    <div className="rounded-lg border p-4 space-y-1">
      <h3 className="font-semibold">Next Lunar Event</h3>
      <p className="text-sm opacity-80">{next.name}</p>
      <p className="text-lg font-bold">{next.timeLocal}</p>
    </div>
  );
}
