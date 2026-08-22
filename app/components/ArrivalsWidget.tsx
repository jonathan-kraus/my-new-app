/*
 * @FilePath: \my-new-app\app\astronomy\components\ArrivalsWidget.tsx
 * @LastEditTime: 2026-08-22 17:27:33
 */
"use client";

import useSWR from "swr";
import { Card } from "@/components/ui/card";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function ArrivalsWidget({ stop }: { stop: string }) {
  const { data, isLoading } = useSWR(`/api/arrivals/${stop}`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data ?? [];

  return (
    <Card className="p-4 shadow-lg border border-neutral-200 bg-white/70 backdrop-blur-md">
      <h2 className="text-xl font-semibold mb-3">Arrivals — {stop}</h2>

      {isLoading && (
        <div className="animate-pulse text-neutral-500">Loading…</div>
      )}

      <ul className="space-y-2">
        {predictions.map((p: any) => {
          const arrival = p.attributes.arrival_time;
          const route = p.relationships.route.data.id;
          const time = arrival ? new Date(arrival).toLocaleTimeString() : "—";

          return (
            <li
              key={p.id}
              className="flex items-center justify-between p-2 rounded-md bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="font-medium text-neutral-700">{route}</span>
              <span className="text-neutral-900">{time}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
