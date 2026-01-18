import { useUnifiedAstronomyCountdown } from "@/hooks/useUnifiedAstronomyCountdown";
import { AstronomyCardProps } from "@/lib/astronomy/types";
import { useNow } from "@/hooks/useNow";

export function AstronomyCard({ today, tomorrow }: AstronomyCardProps) {
  const nextEvent = useUnifiedAstronomyCountdown(today, tomorrow);
  const now = useNow(); // ticks every second
  console.log("AstronomyCard props:", { today, tomorrow });

  function formatDuration(ms: number) {
    if (ms <= 0) return "Now";

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
  }

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
    <div>
      <div>{nextEvent.label}</div>
      <div>{formatDuration(remainingMs)}</div>
    </div>
  );
}
