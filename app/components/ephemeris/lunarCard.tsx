"use client";

import React from "react";

type LunarEvent = {
  name: string;
  timeLocal: string;
};

type LunarCardProps = {
  next: LunarEvent | null; // strict-safe: caller must explicitly pass null if missing
};

export function LunarCard({ next }: LunarCardProps) {
  // Explicit guard — strict mode requires this
  if (!next) {
    return (
      <div className="rounded-lg border p-4 space-y-1">
        <h3 className="font-semibold">Next Lunar Event</h3>
        <p className="text-sm opacity-80">No upcoming event</p>
        <p className="text-lg font-bold">—</p>
      </div>
    );
  }

  // At this point, next is fully non-null and safe
  return (
    <div className="rounded-lg border p-4 space-y-1">
      <h3 className="font-semibold">Next Lunar Event</h3>
      <p className="text-sm opacity-80">{next.name}</p>
      <p className="text-lg font-bold">{next.timeLocal}</p>
    </div>
  );
}
