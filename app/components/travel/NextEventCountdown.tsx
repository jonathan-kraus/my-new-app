"use client";
import { parse, intervalToDuration, formatDuration } from "date-fns";
import { useState, useEffect } from "react";
import type { ParsedTravelSnapshot } from "@/lib/travel/parser/aa";

type Props = {
  snapshot: ParsedTravelSnapshot;
};

export function NextEventCountdown({ snapshot }: Props) {
  const next = snapshot.segments[0];
  const [countdown, setCountdown] = useState<string>("");

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
  }, [next.date, next.departureTime]);

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
