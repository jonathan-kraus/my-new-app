/*
 * @FilePath: \my-new-app\app\components\travel\TripSummaryCard.tsx
 * @LastEditTime: 2026-02-24 19:13:37
 */
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

type Props = {
  snapshot: ParsedTravelSnapshot;
};

export function TripSummaryCard({ snapshot }: Props) {
  const seg0 = snapshot.segments[0];
  const seg1 = snapshot.segments[1];

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Trip Summary</h2>

      <div className="space-y-4 text-sm text-gray-300">
        <div>
          <div className="font-medium text-gray-100">{seg0.date}</div>
          <div>
            {seg0.departureAirport} → {seg0.arrivalAirport}
          </div>
          <div>
            {seg0.departureTime} → {seg0.arrivalTime}
          </div>
          <div className="text-gray-400">Seats: {seg0.seats.join(", ")}</div>
        </div>

        <div>
          <div className="font-medium text-gray-100">{seg1.date}</div>
          <div>
            {seg1.departureAirport} → {seg1.arrivalAirport}
          </div>
          <div>
            {seg1.departureTime} → {seg1.arrivalTime}
          </div>
          <div className="text-gray-400">Seats: {seg1.seats.join(", ")}</div>
        </div>
      </div>
    </div>
  );
}
