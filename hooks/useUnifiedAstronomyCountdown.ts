// hooks\useUnifiedAstronomyCountdown.ts
"use client";

import { useNow } from "@/hooks/useNow";

export function useUnifiedAstronomyCountdown(snapshot: any | null) {
  const now = useNow();

  if (!snapshot || !snapshot.nextEvent) {
    return { label: null, countdown: null };
  }

  const { name, timestamp } = snapshot.nextEvent;
  if (!timestamp) return { label: name, countdown: null };

  const target = new Date(timestamp).getTime();
  const diff = target - now.getTime();
  if (diff <= 0) return { label: name, countdown: "—" };

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  return {
    label: name,
    countdown: `${hours}h ${minutes}m`,
  };
}
