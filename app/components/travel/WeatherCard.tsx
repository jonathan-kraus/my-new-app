import type { Prisma } from "@prisma/client";
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

type TravelSegment = Prisma.TravelSegmentGetPayload<{}>;

type Props = {
  snapshot: ParsedTravelSnapshot;
  weather: {
    outbound: {
      summary: string;
    };
  };
};

export function WeatherCard({ snapshot, weather }: Props) {
  const segments = snapshot.segments;

  if (segments.length < 1) {
    throw new Error("WeatherCard requires at least 1 segment");
  }

  const [seg0] = segments as [TravelSegment, ...TravelSegment[]];

  return (
    <div>
      <div className="font-medium text-gray-100">
        {seg0.date} — Arrival in {seg0.arrivalCity}
      </div>
      <div>{weather.outbound.summary}</div>
    </div>
  );
}
