"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";

export function Countdown({ timestamp }: { timestamp: Date }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = formatDistanceToNowStrict(timestamp, {
    roundingMethod: "floor",
    addSuffix: false,
  });

  return <span>Countdown: {countdown}</span>;
}
