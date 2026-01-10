// app/astronomy/GoldenHourCard.tsx
"use client";

import { SolarTimes } from "@/types/AstronomyTypes";

type GoldenHourProps = Pick<
  SolarTimes,
  | "sunriseBlueStart"
  | "sunriseBlueEnd"
  | "sunriseGoldenStart"
  | "sunriseGoldenEnd"
  | "sunsetGoldenStart"
  | "sunsetGoldenEnd"
  | "sunsetBlueStart"
  | "sunsetBlueEnd"
  | "fetchedAt"
>;

export default function GoldenHourCard(props: GoldenHourProps) {
  const {
    sunriseBlueStart,
    sunriseBlueEnd,
    sunriseGoldenStart,
    sunriseGoldenEnd,
    sunsetGoldenStart,
    sunsetGoldenEnd,
    sunsetBlueStart,
    sunsetBlueEnd,
    fetchedAt,
  } = props;

  const format = (d: Date | null) =>
    d
      ? d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })
      : "—";

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-sky-500 via-sky-600 to-indigo-700 text-white shadow-lg space-y-4 md:col-span-2">
      <h2 className="text-2xl font-bold">Golden & Blue Hours</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-semibold mb-1">Morning</h3>
          <p>
            Blue Hour: {format(sunriseBlueStart)} – {format(sunriseBlueEnd)}
          </p>
          <p>
            Golden Hour: {format(sunriseGoldenStart)} –{" "}
            {format(sunriseGoldenEnd)}
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-1">Evening</h3>
          <p>
            Golden Hour: {format(sunsetGoldenStart)} – {format(sunsetGoldenEnd)}
          </p>
          <p>
            Blue Hour: {format(sunsetBlueStart)} – {format(sunsetBlueEnd)}
          </p>
        </div>
      </div>

      <p className="text-xs opacity-80">
        Updated{" "}
        {fetchedAt.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })}
      </p>
    </div>
  );
}
