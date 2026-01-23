// app/hooks/useLiveCountdown.ts

"use client";

import { useEffect, useState } from "react";

export function useLiveCountdown(targetISO: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetISO).getTime();
  const diff = target - now;

  if (diff <= 0) return "Now";

  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return `${h}h ${m}m ${sec}s`;
}
