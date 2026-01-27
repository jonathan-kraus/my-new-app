// hooks\useLiveCountdown.ts

import { useEffect, useState } from "react";
export function useLiveCountdown(target: Date | null) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!target) return null;

  const diff = target.getTime() - now.getTime();

  // Grace window for "Now"
  if (diff <= 0 && diff > -5000) return "Now";

  // Event passed
  if (diff <= 0) return null;

  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${hours}h ${minutes}m ${seconds}s`;
}
