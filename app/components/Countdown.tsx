/*
 * @FilePath: \my-new-app\app\components\Countdown.tsx
 * @LastEditTime: 2026-11-12 13:24:27
 */
"use client";

import { useEffect, useState } from "react";

export function Countdown({ timestamp }: { timestamp: Date | string }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = timestamp instanceof Date ? timestamp : new Date(timestamp);

  if (Number.isNaN(target.getTime())) return <>—</>;

  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return <>Now</>;

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <>
      {hours}h {minutes}m
    </>
  );
}
