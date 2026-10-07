"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { useSWRConfig } from "swr";
import { mbtaFetcher } from "@/lib/mbta/fetcher";

type SyncState = {
  lastSuccessAt: string | null;
  lastAttemptAt: string;
  lastError: string | null;
  routeCount: number;
  stopCount: number;
  patternCount: number;
};

export function MbtaRefresh() {
  const { data, error, mutate } = useSWR<{ state: SyncState | null }>(
    "/api/admin/mbta",
    mbtaFetcher,
  );
  const { mutate: mutateCache } = useSWRConfig();
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  async function refresh() {
    setRefreshing(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/mbta", { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Refresh failed.");
      setMessage("The MBTA catalog has been refreshed.");
      await mutate();
      await mutateCache(
        (key) =>
          typeof key === "string" &&
          (key === "/api/mbta/catalog" || key.startsWith("/api/stops")),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-5 p-6">
      <h1 className="text-3xl font-bold">MBTA stop catalog</h1>
      <p>
        Refresh station details, platforms, lines, and route patterns from MBTA.
        Live arrivals update separately.
      </p>
      {error && <p role="alert">Could not load refresh status.</p>}
      {data && (
        <div className="space-y-2 rounded-xl bg-blue-900/60 p-4">
          <p>
            Last successful refresh:{" "}
            {data.state?.lastSuccessAt
              ? new Date(data.state.lastSuccessAt).toLocaleString()
              : "Not loaded yet"}
          </p>
          {data.state && (
            <p>
              {data.state.routeCount} lines · {data.state.stopCount} stations
              and platforms · {data.state.patternCount} route patterns
            </p>
          )}
          {data.state?.lastError && (
            <p role="alert" className="text-amber-200">
              {data.state.lastError}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        disabled={refreshing}
        onClick={() => void refresh()}
        className="rounded-lg bg-blue-600 px-4 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
      >
        {refreshing
          ? "Refreshing…"
          : data?.state?.lastSuccessAt
            ? "Refresh MBTA data"
            : "Load MBTA data"}
      </button>
      {message && <p role="status">{message}</p>}
      <Link href="/mbta" className="block underline">
        View MBTA arrivals
      </Link>
    </div>
  );
}
