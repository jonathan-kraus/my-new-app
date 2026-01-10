// app/astronomy/LunarCard.tsx
"use client";

import { LunarTimes } from "@/types/AstronomyTypes";

export default function LunarCard({
  moonrise,
  moonset,
  nextMoonrise,
  nextMoonset,
  fetchedAt,
  moonPhase,
}: LunarTimes) {
  const format = (d: Date | null) =>
    d
      ? d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
        })
      : "—";

  return (
    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-black text-slate-100 shadow-lg space-y-4">
      <h2 className="text-2xl font-bold">Lunar Timeline</h2>

      <div className="space-y-1 text-sm">
        <p>🌙 Moonrise: {format(moonrise)}</p>
        <p>🌘 Moonset: {format(moonset)}</p>
        <p>🌒 Next Moonrise: {format(nextMoonrise)}</p>
        <p>🌓 Next Moonset: {format(nextMoonset)}</p>
        <p>🌗 Phase: {moonPhase.toFixed(2)}</p>
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
