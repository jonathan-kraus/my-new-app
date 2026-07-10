// app/travel/next/page.tsx
import { getNextTravelSnapshot } from "@/lib/server/travel/getNextTravelSnapshot";
import { DateTime } from "luxon";
import { IngestButton } from "./IngestButton";


export default async function TravelNextPage() {
  const trip = await getNextTravelSnapshot();

  // 1. Null-safe: no upcoming trips
  if (!trip || !trip.segments || trip.segments.length === 0) {
    return (
      <div className="p-6 text-slate-200">
        <h1 className="text-2xl font-bold mb-2">Your Next Trip</h1>
        <p className="text-slate-400">No upcoming trips found.</p>
        <IngestButton />
      </div>
    );
  }

  // 2. Safely extract first segment
  const first = trip.segments[0];
  if (!first) {
    return (
      <div className="p-6 text-slate-200">
        <h1 className="text-2xl font-bold mb-2">Your Next Trip</h1>
        <p className="text-slate-400">Trip found, but no segments available.</p>
      </div>
    );
  }

  // 3. Parse date safely with Luxon
  const dt = DateTime.fromFormat(first.date, "EEEE, LLLL d, yyyy");
  const now = DateTime.now();

  const daysUntil = Math.ceil(dt.diff(now, "days").days);

  return (
    <div className="p-6 text-slate-100 space-y-6">
      <h1 className="text-2xl font-bold">Your Next Trip</h1>

      {/* Countdown */}
      <div className="bg-slate-900 p-4 rounded border border-slate-700">
        <p className="text-xl font-semibold text-cyan-300">
          {daysUntil} days until your trip
        </p>
        <p className="text-slate-400">{first.date}</p>
      </div>

      {/* Trip Summary */}
      <div className="bg-slate-900 p-4 rounded border border-slate-700 space-y-2">
        <h2 className="text-lg font-semibold text-emerald-300">
          Flight Details
        </h2>

        <p>
          <strong>From:</strong> {first.departureCity} ({first.departureAirport}
          )
        </p>
        <p>
          <strong>To:</strong> {first.arrivalCity} ({first.arrivalAirport})
        </p>
        <p>
          <strong>Flight:</strong> {first.flightNumber}
        </p>
        <p>
          <strong>Departure:</strong> {first.departureTime}
        </p>
        <p>
          <strong>Arrival:</strong> {first.arrivalTime}
        </p>

        {first.seats?.length > 0 && (
          <p>
            <strong>Seats:</strong> {first.seats.join(", ")}
          </p>
        )}
      </div>

      {/* Raw Debug */}
      <div className="bg-slate-950 p-4 rounded border border-slate-800 text-xs">
        <strong>Raw Snapshot:</strong>
        <pre className="overflow-auto mt-2">
          {JSON.stringify(trip, null, 2)}
        </pre>
      </div>
    </div>
  );
}
