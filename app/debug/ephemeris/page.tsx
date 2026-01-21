// app\debug\ephemeris\page.tsx
import { db } from "@/lib/db";
import { writeEphemerisDebugEvent } from "@/lib/ephemeris/debugEvent";
import { getNextEvent } from "@/lib/ephemeris/events";
import { startOfDay, addDays } from "date-fns";
import { getNextSolarEvent } from "@/lib/ephemeris/events";
import { SolarCard } from "@/components/ephemeris/solarCard";
import { formatEastern } from "@/lib/ephemeris/formatEastern";
export const dynamic = "force-dynamic";

export default async function DebugEPage() {
  // Find the default location
  const location = await db.location.findFirst({
    where: { isDefault: true },
  });

  // Compute today + tomorrow
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  // Fetch snapshots for the default location
  const [todaySnap, tomorrowSnap] = location
    ? await Promise.all([
        db.astronomySnapshot.findFirst({
          where: { locationId: location.id, date: today },
        }),
        db.astronomySnapshot.findFirst({
          where: { locationId: location.id, date: tomorrow },
        }),
      ])
    : [null, null];

  const next = getNextEvent(todaySnap, tomorrowSnap);
  const nextSolar = getNextSolarEvent(todaySnap, tomorrowSnap);

  // Fetch debug entries (raw ephemeris logs)
  const debugEntries = await db.ephemerisDebug.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold text-white">Ephemeris Debug</h1>

      {/* DEFAULT LOCATION */}
      <section>
        <h2 className="text-xl font-semibold text-blue-300">
          Default Location
        </h2>
        {location ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Name:</span> {location.name}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Latitude:</span>{" "}
              {location.latitude}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Longitude:</span>{" "}
              {location.longitude}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Timezone:</span>{" "}
              {location.timezone}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">No default location found.</p>
        )}
      </section>

      {/* TODAY */}
      <section>
        <h2 className="text-xl font-semibold text-blue-300">Today</h2>
        {todaySnap ? (
          <SnapshotCard snapshot={todaySnap} />
        ) : (
          <p className="text-gray-400">No snapshot for today.</p>
        )}
      </section>

      {/* TOMORROW */}
      <section>
        <h2 className="text-xl font-semibold text-blue-300">Tomorrow</h2>
        {tomorrowSnap ? (
          <SnapshotCard snapshot={tomorrowSnap} />
        ) : (
          <p className="text-gray-400">No snapshot for tomorrow.</p>
        )}
      </section>

      {/* RAW DEBUG ENTRIES */}
      <section>
        <h2 className="text-xl font-semibold text-blue-300">
          Raw Ephemeris Debug Entries
        </h2>

        {debugEntries.length === 0 && (
          <p className="text-gray-400">No debug entries recorded.</p>
        )}

        <div className="space-y-4">
          {debugEntries.map((e) => (
            <div
              key={e.id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
            >
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Date:</span> {e.date}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Location:</span> {e.locationId}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Received:</span>{" "}
                {new Date(e.receivedAt).toLocaleString()}
              </p>

              <details className="mt-3">
                <summary className="cursor-pointer text-blue-400">
                  Raw Payload
                </summary>
                <pre className="mt-2 text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
                  {JSON.stringify(e.raw, null, 2)}
                </pre>
              </details>
              <section className="mt-10">
                <h2 className="text-xl font-semibold text-blue-300">
                  Next Event
                </h2>

                {next ? (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mt-2">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Type:</span> {next.type}
                    </p>
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Time:</span>{" "}
                      {formatEastern(next.date)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">No upcoming events.</p>
                )}

                <form action="" method="GET" className="mt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Refresh
                  </button>
                </form>
              </section>
              <SolarCard today={todaySnap} nextSolar={nextSolar} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SnapshotCard({ snapshot }: { snapshot: any }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-2">
      <Field label="Date" value={snapshot.date.toISOString()} />
      <Field label="Sunrise" value={snapshot.sunrise} />
      <Field label="Sunset" value={snapshot.sunset} />
      <Field label="Moonrise" value={snapshot.moonrise} />
      <Field label="Moonset" value={snapshot.moonset} />
      <Field label="Moon Phase" value={snapshot.moonPhase?.toString()} />

      <Field label="Blue Start (AM)" value={snapshot.sunriseBlueStart} />
      <Field label="Blue End (AM)" value={snapshot.sunriseBlueEnd} />
      <Field label="Golden Start (AM)" value={snapshot.sunriseGoldenStart} />
      <Field label="Golden End (AM)" value={snapshot.sunriseGoldenEnd} />

      <Field label="Golden Start (PM)" value={snapshot.sunsetGoldenStart} />
      <Field label="Golden End (PM)" value={snapshot.sunsetGoldenEnd} />
      <Field label="Blue Start (PM)" value={snapshot.sunsetBlueStart} />
      <Field label="Blue End (PM)" value={snapshot.sunsetBlueEnd} />

      <details className="mt-3">
        <summary className="cursor-pointer text-blue-400">Raw Snapshot</summary>
        <pre className="mt-2 text-xs text-gray-300 bg-gray-900 p-3 rounded overflow-x-auto">
          {JSON.stringify(snapshot, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function Field({ label, value }: { label: string; value: any }) {
  return (
    <p className="text-sm text-gray-300">
      <span className="font-semibold">{label}:</span> {value ?? "—"}
    </p>
  );
}
