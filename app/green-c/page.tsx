"use client";

import { useState } from "react";
import useSWR from "swr";
import { splitInboundOutbound } from "@/lib/mbta/splitInboundOutbound";
import { ArrivalCard } from "@/components/ArrivalCard";
import { greenCStops } from "@/lib/mbta/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function GreenCPage() {
  const [stopId, setStopId] = useState("place-denrd");

  const { data, isLoading } = useSWR(`/api/arrivals/${stopId}`, fetcher, {
    refreshInterval: 15000,
  });

  const predictions = data?.data ?? [];
  const { inbound, outbound } = splitInboundOutbound(predictions);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">T T T</h1>

      {/* ⭐ STOP SELECTOR (this is what disappeared) */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Choose a stop:</label>
        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="p-2 border rounded-md"
        >
          {greenCStops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.attributes.name}
            </option>
          ))}
        </select>
      </div>

      {/* ⭐ Two-column layout */}
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
