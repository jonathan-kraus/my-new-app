"use client";
import { formatTime } from "@/lib/astronomy/formatTime";
interface GoldenHourCardProps {
  sunriseBlueStart: Date | null;
  sunriseBlueEnd: Date | null;
  sunriseGoldenStart: Date | null;
  sunriseGoldenEnd: Date | null;

  sunsetGoldenStart: Date | null;
  sunsetGoldenEnd: Date | null;
  sunsetBlueStart: Date | null;
  sunsetBlueEnd: Date | null;
}

export function GoldenHourCard({
  sunriseBlueStart,
  sunriseBlueEnd,
  sunriseGoldenStart,
  sunriseGoldenEnd,
  sunsetGoldenStart,
  sunsetGoldenEnd,
  sunsetBlueStart,
  sunsetBlueEnd,
}: GoldenHourCardProps) {
  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur space-y-4">
      <h2 className="text-lg font-semibold">Golden & Blue Hours</h2>

      <div>
        <h3 className="font-semibold mb-1">Morning</h3>
        <p>
          Blue Hour: {formatTime(sunriseBlueStart)} –{" "}
          {formatTime(sunriseBlueEnd)}
        </p>
        <p>
          Golden Hour: {formatTime(sunriseGoldenStart)} –{" "}
          {formatTime(sunriseGoldenEnd)}
        </p>
      </div>

      <div>
        <h3 className="font-semibold mb-1">Evening</h3>
        <p>
          Golden Hour: {formatTime(sunsetGoldenStart)} –{" "}
          {formatTime(sunsetGoldenEnd)}
        </p>
        <p>
          Blue Hour: {formatTime(sunsetBlueStart)} – {formatTime(sunsetBlueEnd)}
        </p>
      </div>
    </div>
  );
}
