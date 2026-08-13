/*
 * @FilePath: \my-new-app\app\components\travel\NextEventCountdown.tsx
 * @LastEditTime: 2026-08-12 14:24:58
 */
"use client";
import { parse, intervalToDuration, formatDuration } from "date-fns";
import { useState, useEffect } from "react";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";
const built = await staticUniversalContext("dashboard");
let jei = 0;

logj({
  domain: "dashboard",
  level: "info",
  message: "NextEventCountdown loaded",
  file: "app/components/travel/NextEventCountdown.tsx",
  line: 14,
  payload: { some: "next event" },
  meta: { built: { ...built, eventIndex: ++jei } },
});

type Props = {
  snapshot: ParsedTravelSnapshot;
};

export function NextEventCountdown({ snapshot }: Props) {
  const next = snapshot.segments[0];
  const [countdown, setCountdown] = useState<string>("");

  // Early return BEFORE JSX and AFTER hooks
  if (!next) {
    return (
      <div className="bg-gray-900 rounded-lg p-4 shadow">
        <h2 className="text-lg font-semibold mb-3">Next Event</h2>
        <div className="text-gray-300 text-sm">No upcoming events</div>
      </div>
    );
  }

  useEffect(() => {
    const target = parse(
      `${next.date} ${next.departureTime}`,
      "EEEE, MMMM d, yyyy h:mm a",
      new Date(),
    );

    const update = () => {
      const now = new Date();
      if (now >= target) {
        setCountdown("Departing now!");
        return;
      }

      const duration = intervalToDuration({ start: now, end: target });
      setCountdown(
        formatDuration(duration, {
          format: ["days", "hours", "minutes", "seconds"],
        }),
      );
    };

    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <div className="bg-gray-900 rounded-lg p-4 shadow">
      <h2 className="text-lg font-semibold mb-3">Next Event</h2>
      <div className="text-gray-300 text-sm">
        <div className="font-medium text-gray-100">
          {next.departureAirport} → {next.arrivalAirport}
        </div>
        <div>
          {next.date} {next.departureTime}
        </div>
        <div className="mt-2 text-yellow-300 font-mono text-base">
          {countdown || "Calculating…"}
        </div>
      </div>
    </div>
  );
}
