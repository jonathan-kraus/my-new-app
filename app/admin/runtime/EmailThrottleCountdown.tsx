"use client";
/*
 * @FilePath: \my-new-app\app\admin\runtime\EmailThrottleCountdown.tsx
 * @LastEditTime: 2026-07-24 19:14:31
 */

import { useEffect, useState } from "react";

export function EmailThrottleCountdown({
  lastSent,
  throttleMinutes,
}: {
  lastSent: string | null;
  throttleMinutes: number;
}) {
  // Parse timestamp once (pure)
  const last = lastSent ? new Date(lastSent) : null;

  // Compute nextAllowed once (pure)
  const nextAllowed =
    last && !isNaN(last.getTime())
      ? new Date(last.getTime() + throttleMinutes * 60 * 1000)
      : null;

  // Initial derived state (pure, lazy)
  const [remaining, setRemaining] = useState<string>(() => {
    if (!nextAllowed || throttleMinutes <= 0) return "Ready now";
    return "";
  });

  const [status, setStatus] = useState<"ready" | "countdown" | "invalid">(() => {
    if (!nextAllowed || throttleMinutes <= 0) return "ready";
    return "invalid";
  });

  // Countdown effect — always runs, but exits early if invalid
  useEffect(() => {
    if (!nextAllowed) return;

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

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [nextAllowed]);

  // Early return AFTER hooks
  if (!nextAllowed) {
    return (
      <div className="px-4 py-3 rounded-lg border bg-red-600/20 text-red-300 border-red-600/40">
        <div className="text-sm opacity-70">Next test email allowed in</div>
        <div className="text-xl font-semibold">Invalid timestamp</div>
      </div>
    );
  }

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
