/*
 * @FilePath: \my-new-app\app\travel\next\page.tsx
 * @LastEditTime: 2026-02-24 00:51:25
 */
import { getNextTravelEvent } from "@/lib/travel/next-event";

export default async function NextTravelPage() {
  const event = await getNextTravelEvent();
  console.log(event?.snapshot.segments[0].seats);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Next Trip</h1>

      {!event && (
        <p className="text-muted-foreground">No upcoming flights found.</p>
      )}

      {event && (
        <div className="rounded-lg border p-6 space-y-4">
          <div className="text-xl font-medium">
            {event.segment.departureAirport} → {event.segment.arrivalAirport}
          </div>

          <div className="text-muted-foreground">
            {event.departureDateTime.toLocaleString()}
          </div>

          <div className="text-sm">Flight: {event.segment.flightNumber}</div>

          <div className="text-sm">
            Confirmation: {event.snapshot.confirmationCode}
          </div>

          <div className="text-sm">
            Seat(s): {event.segment.seats ? event.segment.seats : "—"}
          </div>
        </div>
      )}
    </div>
  );
}
