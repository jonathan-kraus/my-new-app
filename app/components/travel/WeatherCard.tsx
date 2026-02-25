import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

type WeatherResult = {
  outbound: { summary: string };
  return: { summary: string };
};

type Props = {
  snapshot: ParsedTravelSnapshot;
  weather: WeatherResult | null;
};

export function WeatherCard({ weather, snapshot }: Props) {
  if (!weather) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 shadow text-gray-300">
        <h2 className="text-lg font-semibold mb-3">Weather</h2>
        <div>No weather data available.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Weather</h2>

      <div className="space-y-4 text-sm text-gray-300">
        <div>
          <div className="font-medium text-gray-100">
            {snapshot.segments[0].date} — Arrival in{" "}
            {snapshot.segments[0].arrivalCity}
          </div>
          <div>{weather.outbound.summary}</div>
        </div>

        <div>
          <div className="font-medium text-gray-100">
            {snapshot.segments[1].date} — Return to{" "}
            {snapshot.segments[1].arrivalCity}
          </div>
          <div>{weather.return.summary}</div>
        </div>
      </div>
    </div>
  );
}
