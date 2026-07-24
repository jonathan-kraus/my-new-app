"use client";

import { useEffect, useState } from "react";

export function EmailThrottleCountdown({
  lastSent,
  throttleMinutes,
}: {
  lastSent: string | null;
  throttleMinutes: number;
}) {
  // Initial derived state
  const [remaining, setRemaining] = useState<string>(() => {
    if (!lastSent || throttleMinutes <= 0) return "Ready now";
    return "";
  });

  const [status, setStatus] = useState<"ready" | "countdown" | "invalid">(
    () => {
      if (!lastSent || throttleMinutes <= 0) return "ready";
      return "invalid";
    },
  );

  // Parse lastSent safely
  const last = lastSent ? new Date(lastSent) : null;

  // If timestamp is invalid → return JSX (never return a function)
  if (!last || isNaN(last.getTime())) {
    return (
      <div className="px-4 py-3 rounded-lg border bg-red-600/20 text-red-300 border-red-600/40">
        <div className="text-sm opacity-70">Next test email allowed in</div>
        <div className="text-xl font-semibold">Invalid timestamp</div>
      </div>
    );
  }

  // Compute next allowed send time
  const nextAllowed = new Date(last.getTime() + throttleMinutes * 60 * 1000);

  // Countdown effect
  useEffect(() => {
    function update() {
      const now = new Date();
      const diff = nextAllowed.getTime() - now.getTime();

      if (diff <= 0) {
        setRemaining("Ready now");
        setStatus("ready");
        return;
      }

      const minutes = Math.floor(diff / 1000 / 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setRemaining(`${minutes}m ${seconds}s`);
      setStatus("countdown");
    }

    update(); // run immediately
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextAllowed]);

  // Badge color classes
  const color =
    status === "ready"
      ? "bg-green-600/20 text-green-300 border-green-600/40"
      : status === "countdown"
        ? "bg-yellow-600/20 text-yellow-300 border-yellow-600/40"
        : "bg-red-600/20 text-red-300 border-red-600/40";

  return (
    <div
      className={`px-4 py-3 rounded-lg border ${color} transition-colors duration-300`}
    >
      <div className="text-sm opacity-70">Next test email allowed in</div>
      <div className="text-xl font-semibold">{remaining}</div>
    </div>
  );
}
