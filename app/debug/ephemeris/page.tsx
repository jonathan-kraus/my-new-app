// app/debug/ephemeris/page.tsx
import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { buildAstronomyEvents } from "@/lib/ephemeris/buildAstronomyEvents";

function fmt(d: Date | null | undefined) {
  if (!d) return "—";
  return d.toLocaleString("en-US", { timeZoneName: "short" });
}

export default async function DebugEphemerisPage() {
  const snapshot = await getEphemerisSnapshot("KOP");

  if (!snapshot) {
    return <div className="p-6">No snapshot available</div>;
  }

  const today = snapshot.today ?? null;
  const tomorrow = snapshot.tomorrow ?? null;

  const events =
    today && tomorrow ? buildAstronomyEvents(today, tomorrow) : [];

  return (
    <div className="p-6 space-y-8 text-sm">
      <h1 className="text-xl font-semibold">Debug · Ephemeris</h1>

      {/* Snapshot metadata */}
      <section>
        <h2 className="font-semibold mb-2">Snapshot</h2>
        <ul className="space-y-1">
          <li>Location: {snapshot.today?.locationId ?? "—"}</li>
          <li>Fetched At: {fmt(today?.fetchedAt)}</li>
        </ul>
      </section>

      {/* Today */}
      <section>
        <h2 className="font-semibold mb-2">Today</h2>
        <ul className="space-y-1">
          <li>Date: {today?.date ?? "—"}</li>
          <li>Sunrise: {fmt(today?.sunrise)}</li>
          <li>Solar Noon: {fmt(today?.solarNoon)}</li>
          <li>Sunset: {fmt(today?.sunset)}</li>
          <li>Moonrise: {fmt(today?.moonrise)}</li>
          <li>Moonset: {fmt(today?.moonset)}</li>
        </ul>
      </section>

      {/* Tomorrow */}
      <section>
        <h2 className="font-semibold mb-2">Tomorrow</h2>
        <ul className="space-y-1">
          <li>Date: {tomorrow?.date ?? "—"}</li>
          <li>Sunrise: {fmt(tomorrow?.sunrise)}</li>
          <li>Solar Noon: {fmt(tomorrow?.solarNoon)}</li>
          <li>Sunset: {fmt(tomorrow?.sunset)}</li>
          <li>Moonrise: {fmt(tomorrow?.moonrise)}</li>
          <li>Moonset: {fmt(tomorrow?.moonset)}</li>
        </ul>
      </section>

      {/* Next event */}
      <section>
        <h2 className="font-semibold mb-2">Next Event</h2>
        {snapshot.nextEvent ? (
          <ul className="space-y-1">
            <li>Name: {snapshot.nextEvent.name}</li>
            <li>Time: {fmt(snapshot.nextEvent.dateObj)}</li>
            <li>Type: {snapshot.nextEvent.type}</li>
          </ul>
        ) : (
          <div>—</div>
        )}
      </section>

      {/* Derived event list */}
      <section>
        <h2 className="font-semibold mb-2">All Events (Derived)</h2>
        {events.length === 0 ? (
          <div>—</div>
        ) : (
          <table className="border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Time</th>
                <th className="border px-2 py-1">Label</th>

              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{fmt(e.time)}</td>
                  <td className="border px-2 py-1">{e.label}</td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
