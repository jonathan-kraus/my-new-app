/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 * @LastEditTime: 2026-08-25 14:32:03
 */
"use client";

import useSWR from "swr";
import { MBTAPrediction } from "@/lib/mbta/types";
import { splitInboundOutbound } from "@/lib/mbta/splitInboundOutbound";
import { ArrivalCard } from "@/app/components/ArrivalCard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GreenCPage() {
  const { data, isLoading } = useSWR(
    "/api/arrivals/place-denrd?include=trip",
    fetcher,
    { refreshInterval: 15000 },
  );

  if (isLoading) return <div>Loading…</div>;
  if (!data) return <div>No data.</div>;

  const predictions: MBTAPrediction[] = data.data;

  const { inbound, outbound } = splitInboundOutbound(predictions);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Green Line C — Dean Road</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="font-semibold mb-2">Inbound (Downtown)</h2>
          {inbound.length === 0 && <div>No inbound trains predicted.</div>}
          {inbound.map((p) => (
            <ArrivalCard key={p.id} prediction={p} />
          ))}
        </div>

        <div>
          <h2 className="font-semibold mb-2">Outbound (Cleveland Circle)</h2>
          {outbound.length === 0 && <div>No outbound trains predicted.</div>}
          {outbound.map((p) => (
            <ArrivalCard key={p.id} prediction={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
