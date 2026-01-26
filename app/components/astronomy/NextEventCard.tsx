"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict, format } from "date-fns";

export function NextEventCard({
  nextEvent,
  nextEventTime,
}: {
  nextEvent: string;
  nextEventTime: Date | null;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown =
    nextEventTime &&
    formatDistanceToNowStrict(nextEventTime, { roundingMethod: "floor" });

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
