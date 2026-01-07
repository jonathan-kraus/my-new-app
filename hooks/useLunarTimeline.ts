"use client";

import { useNow } from "./useNow";

// Interpret an ISO string as LOCAL time instead of UTC
function toLocalDate(iso: string) {
  const d = new Date(iso);
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  );
}

export function useLunarTimeline(
  moonriseStr: string | null,
  moonsetStr: string | null,
) {
  const now = useNow();

  // Early return if missing data
  if (!moonriseStr || !moonsetStr) {
    return {
      now,
      moonrise: null,
      moonset: null,
      visibilityHours: 0,
      isVisible: false,
      nextEventLabel: "No lunar data",
      countdown: "",
      progressPercent: 0,
    };
  }

  // Convert API ISO → local Date
  const moonrise = toLocalDate(moonriseStr);
  const moonset = toLocalDate(moonsetStr);

  // Handle wrap-around (moonset after midnight)
  let adjustedMoonset = moonset;
  if (moonset <= moonrise) {
    adjustedMoonset = new Date(moonset.getTime() + 24 * 60 * 60 * 1000);
  }

  const visibilityMs = adjustedMoonset.getTime() - moonrise.getTime();
  const visibilityHours = visibilityMs / 1000 / 60 / 60;

  // Normalize "now" into same timeline
  let normalizedNow = now;
  if (now < moonrise && now > adjustedMoonset) {
    normalizedNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }

  const isVisible =
    normalizedNow >= moonrise && normalizedNow <= adjustedMoonset;

  let nextEventLabel = "";
  let nextEventTime: Date;

  if (normalizedNow < moonrise) {
    nextEventLabel = "Moonrise";
    nextEventTime = moonrise;
  } else if (normalizedNow < adjustedMoonset) {
    nextEventLabel = "Moonset";
    nextEventTime = adjustedMoonset;
  } else {
    nextEventLabel = "Tomorrow's Moonrise";
    nextEventTime = new Date(moonrise.getTime() + 24 * 60 * 60 * 1000);
  }

  const diffMs = nextEventTime.getTime() - normalizedNow.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 1000 / 60));
  const hours = Math.floor(diffMin / 60);
  const minutes = diffMin % 60;
  const countdown = `${hours}h ${minutes}m`;

  let progressPercent = 0;
  if (isVisible) {
    const elapsed = normalizedNow.getTime() - moonrise.getTime();
    progressPercent = Math.min(
      100,
      Math.max(0, (elapsed / visibilityMs) * 100)
    );
  }

  return {
    now,
    moonrise,
    moonset: adjustedMoonset,
    visibilityHours,
    isVisible,
    nextEventLabel,
    countdown,
    progressPercent,
  };
}
