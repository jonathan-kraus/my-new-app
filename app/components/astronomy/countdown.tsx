"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

type Props = {
  sunsetIso: string;     // e.g. "2026-01-04T21:32:00Z"
  locationName: string;
};

export function SunsetCountdown({ sunsetIso, locationName }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const sunset = new Date(sunsetIso).getTime();
    const now = Date.now();
    const diff = Math.max(sunset - now, 0);
    return diff;
  });
  const [lastHours, setLastHours] = useState<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        const sunset = new Date(sunsetIso).getTime();
        const now = Date.now();
        const diff = Math.max(sunset - now, 0);
        return diff;
      });
    }, 60_000); // update every minute

    return () => clearInterval(id);
  }, [sunsetIso]);

  useEffect(() => {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    if (timeLeft === 0) return;

    // fire toast when the hour bucket changes: 6h -> 5h, 5h -> 4h, etc.
    if (lastHours !== null && hours !== lastHours) {
      toast(`☀️ Sunset in ${hours}h ${minutes}m in ${locationName}`, {
        duration: 4000,
      });
    }

    setLastHours(hours);
  }, [timeLeft, lastHours, locationName]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  if (timeLeft <= 0) {
    return <span>Sun has set</span>;
  }

  return (
    <span>
      Sunset in {hours} hours {minutes} minutes
    </span>
  );
}
