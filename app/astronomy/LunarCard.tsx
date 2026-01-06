// app/astronomy/LunarCard.tsx
"use client";

import { useLunarTimeline } from "@/hooks/useLunarTimeline";
import ProgressBar from "@/components/ProgressBar";
type LunarCardProps = {
  moonrise: string | null;
  moonset: string | null;
  fetchedAt: string;
};

export default function LunarCard({
  moonrise,
  moonset,
  fetchedAt,
}: LunarCardProps) {

  const t = useLunarTimeline(moonrise, moonset);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
if (!moonrise || !moonset) {
  return (
    <div className="p-6 rounded-xl bg-indigo-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Lunar Timeline</h2>
      <p className="opacity-80">No lunar data available.</p>
    </div>
  );
}

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-700 via-slate-800 to-black text-slate-50 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Lunar Timeline</h2>

      <div className="space-y-2">
<p>🌕 Moonrise: {t.moonrise ? formatTime(t.moonrise) : "—"}</p>
 <p>🌘 Moonset: {t.moonset ? formatTime(t.moonset) : "—"}</p>
        <p>🕒 Visibility: {t.visibilityHours.toFixed(2)} hours</p>
      </div>

      <div className="mt-4">
        <p className="font-semibold">
          {t.nextEventLabel} in {t.countdown}
        </p>

        <div className="w-full h-3 bg-white/20 rounded-full mt-2 overflow-hidden">
<ProgressBar
  value={t.progressPercent}
  barClassName="bg-yellow-300"
  className="bg-yellow-900/30"
/>

        <p className="text-sm mt-1 opacity-80">
          {t.isVisible
            ? "Moon is above the horizon"
            : "Moon is below the horizon"}
        </p>
      </div>
</div>
      <p className="text-sm opacity-70 mt-4">
        Updated {new Date(fetchedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
