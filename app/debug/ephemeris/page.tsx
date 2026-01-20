import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DebugEphemerisPage() {
  const events = await db.ephemerisDebug.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Ephemeris Debug Events</h1>

      {events.length === 0 && (
        <p className="text-gray-400">No ephemeris debug events recorded.</p>
      )}

      <div className="space-y-4">
        {events.map((e) => (
          <div
            key={e.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow"
          >
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Date:</span> {e.date}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-semibold">Location:</span> {e.locationId}
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Sunrise:</span> {e.sunrise}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Sunset:</span> {e.sunset}
              </p>

              <p className="text-sm text-gray-300">
                <span className="font-semibold">Moonrise:</span> {e.moonrise}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Moonset:</span> {e.moonset}
              </p>

              <p className="text-sm text-gray-300">
                <span className="font-semibold">Moon Phase:</span> {e.moonPhase}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Blue Start (AM):</span>{" "}
                {e.sunriseBlueStart}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Blue End (AM):</span>{" "}
                {e.sunriseBlueEnd}
              </p>

              <p className="text-sm text-gray-300">
                <span className="font-semibold">Golden Start (AM):</span>{" "}
                {e.sunriseGoldenStart}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Golden End (AM):</span>{" "}
                {e.sunriseGoldenEnd}
              </p>

              <p className="text-sm text-gray-300">
                <span className="font-semibold">Golden Start (PM):</span>{" "}
                {e.sunsetGoldenStart}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Golden End (PM):</span>{" "}
                {e.sunsetGoldenEnd}
              </p>

              <p className="text-sm text-gray-300">
                <span className="font-semibold">Blue Start (PM):</span>{" "}
                {e.sunsetBlueStart}
              </p>
              <p className="text-sm text-gray-300">
                <span className="font-semibold">Blue End (PM):</span>{" "}
                {e.sunsetBlueEnd}
              </p>
            </div>

            <p className="text-sm text-gray-300 mt-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}
