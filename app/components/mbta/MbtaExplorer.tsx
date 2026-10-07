"use client";

import { useState } from "react";
import useSWR from "swr";
import { LineArrivals } from "@/components/LineArrivals";
import {
  frequentStops,
  stopsForRoute,
  type MbtaCatalog,
} from "@/lib/mbta/catalog-types";
import { mbtaFetcher } from "@/lib/mbta/fetcher";

export function MbtaExplorer({
  initialRouteId = "Green-C",
}: {
  initialRouteId?: string;
}) {
  const {
    data: catalog,
    error,
    isLoading,
    mutate,
  } = useSWR<MbtaCatalog>("/api/mbta/catalog", mbtaFetcher);
  const [routeId, setRouteId] = useState(initialRouteId);
  const [stopId, setStopId] = useState(
    initialRouteId === "Green-C" ? "place-denrd" : "",
  );
  const route =
    catalog?.routes.find((candidate) => candidate.id === routeId) ??
    catalog?.routes[0];
  const stops = catalog && route ? stopsForRoute(catalog, route.id) : [];
  const selectedStopId = stops.some((stop) => stop.id === stopId)
    ? stopId
    : (stops[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <p className="text-sm font-medium text-blue-200">
          Subway &amp; trolley
        </p>
        <h1 className="mt-1 text-3xl font-bold">MBTA arrivals</h1>
        <p className="mt-2 text-blue-100">
          Your usual stops, and the rest of the network.
        </p>
      </header>
      <section
        aria-label="Frequent stops"
        className="grid gap-3 sm:grid-cols-2"
      >
        {frequentStops.map((stop) => (
          <button
            key={stop.id}
            type="button"
            disabled={
              !catalog ||
              !stopsForRoute(catalog, stop.routeId).some(
                (candidate) => candidate.id === stop.id,
              )
            }
            aria-pressed={
              route?.id === stop.routeId && selectedStopId === stop.id
            }
            onClick={() => {
              setRouteId(stop.routeId);
              setStopId(stop.id);
            }}
            className="rounded-xl border border-blue-400/40 bg-blue-900/60 p-4 text-left hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-blue-300 disabled:opacity-50"
          >
            <span className="block text-xs text-blue-200">Frequent stop</span>
            <span className="mt-1 block font-semibold">{stop.name}</span>
          </button>
        ))}
      </section>
      {isLoading && <p role="status">Loading stops…</p>}
      {error && (
        <div role="alert" className="rounded-xl border border-amber-400/40 p-4">
          <p>The stop catalog is temporarily unavailable.</p>
          <button
            type="button"
            onClick={() => void mutate()}
            className="mt-2 underline"
          >
            Try again
          </button>
        </div>
      )}
      {catalog && route && (
        <>
          <div>
            <label htmlFor="mbta-route" className="mb-2 block font-medium">
              Choose a line
            </label>
            <select
              id="mbta-route"
              value={route.id}
              onChange={(event) => {
                setRouteId(event.target.value);
                setStopId("");
              }}
              className="w-full rounded-lg border border-blue-400/40 bg-blue-950 p-3"
            >
              {catalog.routes.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </select>
          </div>
          <LineArrivals
            key={route.id}
            catalog={catalog}
            lineId={route.id}
            stopId={selectedStopId}
            onStopChange={setStopId}
          />
        </>
      )}
    </div>
  );
}
