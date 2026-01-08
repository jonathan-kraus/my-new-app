"use client";

import { useEffect, useState } from "react";
import { buildAstronomyEvents } from "@/lib/astronomy-ui";
import { formatCountdown } from "@/lib/time";

interface LiveTimelineProps {
  today: any; // we can tighten this later
  tomorrow: any; // optional or required depending on your data
}
function formatEventTime(date: Date | null) {
  return date
    ? date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "—";
}
export default function LiveTimeline({ today, tomorrow }: LiveTimelineProps) {
  const [now, setNow] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const {
    events,
    nextEvent,
    previousEvent,
    currentEvent,
    timeUntilNext,
    timeSincePrevious,
  } = buildAstronomyEvents(today, tomorrow);

  return (
    <div className="rounded-xl bg-white/5 p-5 border border-white/10 space-y-4">
      <h2 className="text-xl font-semibold text-white mb-2">Live Timeline</h2>

      {/* Current Event */}
      {currentEvent && (
        <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
          <div className="text-white font-medium">
            In Progress: {currentEvent.label}
          </div>
          <div className="text-gray-300 text-sm">
            Started{" "}
            {currentEvent?.at
              ? formatCountdown(Date.now() - currentEvent.at.getTime())
              : "—"}{" "}
            ago
          </div>
        </div>
      )}

      {/* Next Event */}
      {nextEvent && (
        <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30">
          <div className="text-white font-medium">
            Next Event: {nextEvent.label}
          </div>
          <div className="text-gray-300 text-sm">
            In {timeUntilNext ? formatCountdown(timeUntilNext) : "—"}
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="space-y-2">
        {events.map((e, i) => {
          const isPast = !!e.at && e.at.getTime() < now.getTime();
          const isCurrent = currentEvent && currentEvent.label === e.label;
          const isNext = nextEvent && nextEvent.label === e.label;

          return (
            <div
              key={i}
              className={`p-2 rounded border ${
                isCurrent
                  ? "bg-blue-500/20 border-blue-400/40"
                  : isNext
                    ? "bg-green-500/20 border-green-400/40"
                    : isPast
                      ? "bg-white/5 border-white/10 opacity-60"
                      : "bg-white/5 border-white/10"
              }`}
            >
              <div className="text-white">{e.label}</div>
              <div className="text-gray-400 text-sm">
                {formatEventTime(e.at)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
