/*
 * @FilePath: \my-new-app\app\components\ArrivalsWidget.tsx
 * @LastEditTime: 2026-08-24 15:37:06
 */
"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ArrivalsWidget({ stop }: { stop: string }) {
  const { data, isLoading } = useSWR(
    `/api/arrivals/${stop}?include=trip`,
    fetcher,
    {
      refreshInterval: 15000,
    },
  );

  const predictions = data?.data ?? [];
  const included = data?.included ?? [];

  // Build a lookup map for trip objects
  const tripMap = new Map();
  for (const item of included) {
    if (item.type === "trip") {
      tripMap.set(item.id, item);
    }
  }

  return (
    <Card className="p-4 shadow-lg border border-neutral-200 bg-white/70 backdrop-blur-md">
      <h2 className="text-xl font-semibold mb-3">Arrivals — {stop}</h2>

      {isLoading && (
        <div className="animate-pulse text-neutral-500">Loading…</div>
      )}

      <ul className="space-y-2">
        {predictions.map((p: any) => {
          // ⭐ Authoritative branch (Green-B / Green-C / Green-D / Green-E)
          const route = p.relationships.route.data.id;

          // ⭐ Arrival time
          const arrival = p.attributes.arrival_time;
          const time = arrival ? new Date(arrival).toLocaleTimeString() : "—";

          // ⭐ Direction (0 = Eastbound, 1 = Westbound)
          const directionId = p.attributes.direction_id;
          const directionText = directionId === 0 ? "Eastbound" : "Westbound";

          // ⭐ Trip lookup → terminal/headsign
          const tripId = p.relationships.trip?.data?.id;
          const trip = tripMap.get(tripId);
          const terminal = trip?.attributes?.headsign ?? "Unknown";

          return (
            <li
              key={p.id}
              className="flex flex-col p-2 rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-neutral-700">{route}</span>
                <span className="text-neutral-900">{time}</span>
              </div>

              <div className="text-sm text-neutral-600">
                {terminal} — {directionText}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
