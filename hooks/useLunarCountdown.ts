import { useEffect, useState } from "react";

export function useLunarCountdown({
  today,
  tomorrow,
}: {
  today: {
    moonrise: string | null;
    moonset: string | null;
  };
  tomorrow: {
    moonrise: string | null;
    moonset: string | null;
  } | null;
}) {
  const [now, setNow] = useState(new Date());

  // Live ticking clock
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Parse lunar times
  const moonrise = today.moonrise ? new Date(today.moonrise) : null;
  const moonset = today.moonset ? new Date(today.moonset) : null;

  const nextMoonrise = tomorrow?.moonrise ? new Date(tomorrow.moonrise) : null;
  const nextMoonset = tomorrow?.moonset ? new Date(tomorrow.moonset) : null;

  // Helper: diff between now and target
  const diff = (target: Date) => {
    const ms = target.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    return {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    };
  };

  // Determine next lunar event
  let nextEventLabel = "No upcoming lunar events";
  let nextCountdown = { hours: 0, minutes: 0, seconds: 0 };

  if (moonrise && now < moonrise) {
    nextEventLabel = "Moonrise";
    nextCountdown = diff(moonrise);
  } else if (moonset && now < moonset) {
    nextEventLabel = "Moonset";
    nextCountdown = diff(moonset);
  } else if (nextMoonrise) {
    nextEventLabel = "Tomorrow's Moonrise";
    nextCountdown = diff(nextMoonrise);
  }

  // Visibility window
  const isVisible =
    moonrise && moonset ? now >= moonrise && now <= moonset : false;

  // Progress through lunar visibility
  let progressPercent = 0;
  if (moonrise && moonset && now >= moonrise && now <= moonset) {
    const total = moonset.getTime() - moonrise.getTime();
    const elapsed = now.getTime() - moonrise.getTime();
    progressPercent = Math.min(100, Math.max(0, (elapsed / total) * 100));
  }

  return {
    now,
    moonrise,
    moonset,
    nextMoonrise,
    nextMoonset,
    nextEventLabel,
    nextCountdown,
    isVisible,
    progressPercent,
  };
}
