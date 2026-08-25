/*
 * @FilePath: \my-new-app\app\components\ArrivalCard.tsx
 * @LastEditTime: 2026-08-25 19:12:02
 */
"use client";

import { Card } from "@/components/ui/card";

export interface Arrival {
  id: string;
  route: string;
  headsign: string | null;
  direction: "Inbound" | "Outbound";
  arrival: string;
  vehicle: string | null;
}

export function ArrivalCard({ a }: { a: Arrival }) {
  return (
    <Card className="p-4 shadow-md border border-neutral-200 bg-white/70 backdrop-blur-md">
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-neutral-900">
          {a.direction}
          {a.headsign && ` — ${a.headsign}`}
        </h3>

        <div className="text-neutral-700">
          <span className="font-medium">Route:</span> {a.route}
        </div>

        <div className="text-neutral-700">
          <span className="font-medium">Arrives:</span> {a.arrival}
        </div>

        <div className="text-neutral-700">
          <span className="font-medium">Vehicle:</span> {a.vehicle ?? "Unknown"}
        </div>
      </div>
    </Card>
  );
}
