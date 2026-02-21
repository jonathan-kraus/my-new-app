import { db } from "@/lib/db";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ephemeris Debug Events",
};

export default async function EphemerisDebugPage() {
  const events = await db.ephemerisDebug.findMany({
    orderBy: { createdAt: "desc" },
    take: 200, // keep it fast
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-black">
        Ephemeris Debug Events
      </h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full text-sm text-black">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Location</th>
              <th className="px-3 py-2 text-left">Fetched</th>
              <th className="px-3 py-2 text-left">Sunrise</th>
              <th className="px-3 py-2 text-left">Sunset</th>
              <th className="px-3 py-2 text-left">Raw</th>
            </tr>
          </thead>

          <tbody>
            {events.map((e) => (
              <DebugRow key={e.id} event={e} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DebugRow({ event }: { event: any }) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-3 py-2">{event.date}</td>
      <td className="px-3 py-2">{event.locationId}</td>
      <td className="px-3 py-2">{event.fetchedAt}</td>
      <td className="px-3 py-2">{event.sunrise}</td>
      <td className="px-3 py-2">{event.sunset}</td>
      <td className="px-3 py-2">
        <details className="cursor-pointer">
          <summary className="text-blue-600">View</summary>
          <pre className="mt-2 p-2 bg-gray-100 text-gray-900 rounded text-xs overflow-x-auto">
            {JSON.stringify(event.raw, null, 2)}
          </pre>
        </details>
      </td>
    </tr>
  );
}
