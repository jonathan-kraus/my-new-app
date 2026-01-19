"use client";
import { useUnifiedAstronomyCountdown } from "@/hooks/useUnifiedAstronomyCountdown";
import { AstronomyCardProps } from "@/lib/astronomy/types";
import { useNow } from "@/hooks/useNow";

export function AstronomyCard({ today, tomorrow }: AstronomyCardProps) {
  const { nextEvent, allEvents } = useUnifiedAstronomyCountdown(
    today,
    tomorrow,
  );

  if (!nextEvent) return null;

  if (!nextEvent.time) {
    return <div>No upcoming events</div>;
  }

  // now you can safely use nextEvent.time
  return (
    <div>
      <p>{nextEvent.label}</p>
      <p>{nextEvent.time.toLocaleTimeString()}</p>
      <div>
        {" "}
        {allEvents.map((e) => (
          <div key={e.label + e.time.toISOString()}>
            {" "}
            {e.label}: {e.time.toLocaleTimeString()}{" "}
          </div>
        ))}{" "}
      </div>{" "}
      ;
    </div>
  );
}
