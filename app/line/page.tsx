import Link from "next/link";
import { RouteBadge } from "@/app/components/LineArrivals";
import { lineNames, stopsByLine, type MBTALineId } from "@/lib/mbta/stops";

export default function LinesIndexPage() {
  const lines = Object.keys(stopsByLine) as MBTALineId[];

  return (
    <div className="max-w-xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold text-center mb-6">Train Arrivals</h1>

      <ul className="grid grid-cols-1 gap-3">
        {lines.map((lineId) => (
          <li key={lineId}>
            <Link
              href={`/line/${lineId}`}
              className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700"
            >
              <span className="flex items-center gap-3">
                <RouteBadge route={lineId} />
                <span className="font-semibold">{lineNames[lineId]}</span>
              </span>
              <span className="text-sm text-white/60">
                {stopsByLine[lineId].length} stops
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
