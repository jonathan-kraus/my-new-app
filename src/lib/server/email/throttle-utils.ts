// lib\server\email\throttle-utils.ts
import {
  differenceInMinutes,
  isAfter,
  addMinutes,
  formatDistanceToNow,
} from "date-fns";

export interface ThrottleStatus {
  isThrottled: boolean;
  canSendNow: boolean;
  nextAllowedTime: Date | null;
  lastSentTime: Date | null;
  timeUntilAllowed: string; // Human-readable relative time
  remainingMinutes: number; // Positive if throttled, negative if past window
  throttleWindowMinutes: number;
}

export function getThrottleStatus(
  lastSentRaw: string | null,
  throttleMinutes: number,
): ThrottleStatus {
  const now = new Date();
  const lastSent = lastSentRaw ? new Date(lastSentRaw) : null;

  // If no last sent or invalid date, can send immediately
  if (!lastSent || isNaN(lastSent.getTime())) {
    return {
      isThrottled: false,
      canSendNow: true,
      nextAllowedTime: null,
      lastSentTime: null,
      timeUntilAllowed: "Ready now",
      remainingMinutes: 0,
      throttleWindowMinutes: throttleMinutes,
    };
  }

  const nextAllowed = addMinutes(lastSent, throttleMinutes);
  const minutesUntilNext = differenceInMinutes(nextAllowed, now);
  const isThrottled = isAfter(nextAllowed, now);

  // Generate human-readable relative time
  let timeUntilAllowed: string;
  if (isThrottled) {
    // Throttled - show time until allowed
    timeUntilAllowed = formatDistanceToNow(nextAllowed, { addSuffix: true });
  } else {
    // Not throttled - could show how long past the window we are
    const minutesPastWindow = Math.abs(minutesUntilNext);
    if (minutesPastWindow < 1) {
      timeUntilAllowed = "Ready now";
    } else {
      timeUntilAllowed = `Ready now (${formatDistanceToNow(nextAllowed, { addSuffix: true })})`;
    }
  }

  return {
    isThrottled,
    canSendNow: !isThrottled,
    nextAllowedTime: nextAllowed,
    lastSentTime: lastSent,
    timeUntilAllowed,
    remainingMinutes: minutesUntilNext, // Positive if throttled, negative if past window
    throttleWindowMinutes: throttleMinutes,
  };
}
