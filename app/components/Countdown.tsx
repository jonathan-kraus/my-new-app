"use client";

import { useEffect, useState } from "react";

export function Countdown({ timestamp }: { timestamp: Date }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = timestamp.getTime() - now.getTime();
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
