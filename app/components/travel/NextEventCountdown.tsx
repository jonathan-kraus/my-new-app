import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

type Props = {
  snapshot: ParsedTravelSnapshot;
};

export function NextEventCountdown({ snapshot }: Props) {
  const next = snapshot.segments[0]; // or your unified next-event logic

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Next Event</h2>

      <div className="text-gray-300 text-sm">
        <div className="font-medium text-gray-100">
          {next.departureAirport} → {next.arrivalAirport}
        </div>
        <div>{next.departureTime}</div>
        <div className="mt-2 text-gray-400">Countdown coming soon…</div>
      </div>
    </div>
  );
}
