"use client";

import { useUnifiedAstronomyCountdown } from "@/hooks/useUnifiedAstronomyCountdown";
import { useNow } from "@/hooks/useNow";
import { DashboardAstronomyClientProps } from "@/lib/astronomy/types";

export function DashboardAstronomyClient({
  today,
  tomorrow,
}: DashboardAstronomyClientProps) {
  const nextEvent = useUnifiedAstronomyCountdown(today, tomorrow);
  const now = useNow();


  if (!nextEvent) return null;
  if (!nextEvent?.time) {
    return (
      <div>
        {" "}
        <p>{nextEvent?.label}</p> <p>—</p>{" "}
      </div>
    );
  }
  const remainingMs = nextEvent.time.getTime() - now.getTime();

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-xl font-medium">Next Event</h2>
      <p>{nextEvent.label}</p>
      <p>{formatDuration(remainingMs)}</p>
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms <= 0) return "Now";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}
