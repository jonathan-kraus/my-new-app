/*
 * @FilePath     : \my-new-app\app\debug\ephemeris\events\page.tsx
 * @Author       : Jonathan
 * @Date         : 2026-02-11 12:53:50
 * @Description  :
 * @LastEditors  : Jonathan
 * @LastEditTime : 2026-02-11 12:53:50
 */

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EphemerisDebugPage() {
  const events = await db.ephemerisDebug.findMany({
    orderBy: { receivedAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Ephemeris Debug</h1>

      <p className="text-gray-400">
        Showing the 50 most recent ephemeris debug events.
      </p>

      <div className="space-y-6">
        {events.map((e) => (
          <div
            key={e.id}
            className="border border-gray-700 rounded-lg p-4 bg-gray-900"
          >
            {/* Header */}
            <div className="flex justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {e.date ?? "No date"}
                </div>
                <div className="text-gray-400 text-sm">
                  Received: {e.receivedAt.toISOString()}
                </div>
              </div>

              <div className="text-gray-400 text-sm">
                Location: {e.locationId ?? "N/A"}
              </div>
            </div>

            {/* Solar + Lunar */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold mb-1">Solar</div>
                <div>Sunrise: {e.sunrise ?? "—"}</div>
                <div>Sunset: {e.sunset ?? "—"}</div>
                <div>Blue Start: {e.sunriseBlueStart ?? "—"}</div>
                <div>Blue End: {e.sunriseBlueEnd ?? "—"}</div>
                <div>Golden Start: {e.sunriseGoldenStart ?? "—"}</div>
                <div>Golden End: {e.sunriseGoldenEnd ?? "—"}</div>
              </div>

              <div>
                <div className="font-semibold mb-1">Lunar</div>
                <div>Moonrise: {e.moonrise ?? "—"}</div>
                <div>Moonset: {e.moonset ?? "—"}</div>
                <div>Phase: {e.moonPhase ?? "—"}</div>
              </div>
            </div>

            {/* Raw JSON */}
            <details className="mt-4">
              <summary className="cursor-pointer text-blue-400">
                Raw Payload
              </summary>
              <pre className="mt-2 p-2 bg-black text-xs overflow-x-auto rounded">
                {JSON.stringify(e.raw, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
