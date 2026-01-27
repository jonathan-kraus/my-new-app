"use client";

import { format } from "date-fns";
import { useLiveCountdown } from "@/hooks/useLiveCountdown";

export function NextEventCard({
  nextEvent,
  nextEventTime,
}: {
  nextEvent: string;
  nextEventTime: Date | null;
}) {
  const countdown = useLiveCountdown(nextEventTime);

  return (
    <div className="p-6 bg-white/5 rounded-xl border border-white/10 backdrop-blur">
      <h2 className="text-lg font-semibold mb-4">Next Event</h2>

      <div className="text-2xl font-semibold">{nextEvent}</div>

      <div className="mt-2 text-white/80">
        {nextEventTime ? format(nextEventTime, "h:mm:ss a") : "—"}
      </div>

      <div className="mt-4 text-sm text-white/60">
        {countdown ? `Countdown: ${countdown}` : "—"}
      </div>
    </div>
  );
}
