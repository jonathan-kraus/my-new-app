// app/astronomy/GoldenHourCard.tsx
"use client";

import { useGoldenHourTimeline } from "@/hooks/useGoldenHourTimeline";
import ProgressBar from "@/components/ProgressBar";
import { logit } from "@/lib/log/client";
type GoldenHourCardProps = {
  sunriseBlueStart: string;
  sunriseBlueEnd: string;
  sunriseGoldenStart: string;
  sunriseGoldenEnd: string;
  sunsetGoldenStart: string;
  sunsetGoldenEnd: string;
  sunsetBlueStart: string;
  sunsetBlueEnd: string;
  fetchedAt: string;
};

export default function GoldenHourCard(props: GoldenHourCardProps) {
  const t = useGoldenHourTimeline(props);
 logit({
          level: "info",
          message: `In Astronomy`,
          file: "app/astronomy/GoldenHourCard.tsx",
          line: 21,
          page: "Astronomy",
          data: {
            anydata: "no",
          },
        });  const format = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-400 text-white shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Golden & Blue Hours</h2>

      {/* Active or next event */}
      <div className="mb-4">
        {t.active ? (
          <p className="font-semibold">
            Currently in {t.active.label} • Ends in {t.countdown}
          </p>
        ) : t.next ? (
          <p className="font-semibold">
            {t.nextEventLabel} in {t.countdown}
          </p>
        ) : (
          <p className="opacity-80">No more events today</p>
        )}

        {/* Progress bar */}
        <div className="w-full h-3 bg-white/30 rounded-full mt-2 overflow-hidden">
          <ProgressBar
            value={t.progressPercent}
            barClassName="bg-yellow-300"
            className="bg-yellow-900/30"
          />
        </div>
      </div>

      {/* Timeline list */}
      <div className="space-y-2 text-sm">
        {t.timeline.map((p) => (
          <div key={p.label}>
            <span className="font-semibold">{p.label}:</span> {format(p.start)}{" "}
            – {format(p.end)}
          </div>
        ))}
      </div>

      <p className="text-sm opacity-80 mt-4">
        Updated {new Date(props.fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
