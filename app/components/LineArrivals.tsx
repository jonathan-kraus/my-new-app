"use client";

import { useState } from "react";
import useSWR from "swr";
import type { MbtaCatalog } from "@/lib/mbta/catalog-types";
import { stopsForRoute } from "@/lib/mbta/catalog-types";
import { mbtaFetcher } from "@/lib/mbta/fetcher";
import { StopDetails } from "@/components/mbta/StopDetails";

type Prediction = {
  id: string;
  attributes: {
    arrival_time: string | null;
    departure_time: string | null;
    direction_id: number;
    status?: string | null;
  };
  relationships: {
    route?: { data: { id: string } | null };
    trip?: { data: { id: string } | null };
    vehicle?: { data: { id: string } | null };
  };
};
type Included = {
  id: string;
  type: string;
  attributes?: { headsign?: string };
};

function countdown(time: string | null) {
  if (!time) return "—";
  const minutes = Math.floor((new Date(time).getTime() - Date.now()) / 60000);
  return minutes < 0
    ? "Arriving now"
    : minutes === 0
      ? "Less than 1 min"
      : `${minutes} min`;
}

export function LineArrivals({
  catalog,
  lineId,
  stopId,
  onStopChange,
}: {
  catalog: MbtaCatalog;
  lineId: string;
  stopId: string;
  onStopChange: (id: string) => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const route = catalog.routes.find((candidate) => candidate.id === lineId);
  const stops = stopsForRoute(catalog, lineId);
  const selectedStop = stops.find((stop) => stop.id === stopId);
  const { data, error, isLoading, isValidating } = useSWR<{
    data: Prediction[];
    included?: Included[];
  }>(
    selectedStop
      ? `/api/arrivals/${encodeURIComponent(selectedStop.id)}`
      : null,
    mbtaFetcher,
    { refreshInterval: 15000, keepPreviousData: false },
  );
  const predictions = [...(data?.data ?? [])].sort((a, b) => {
    const time = (prediction: Prediction) =>
      new Date(
        prediction.attributes.arrival_time ??
          prediction.attributes.departure_time ??
          "9999-01-01",
      ).getTime();
    return time(a) - time(b);
  });
  return (
    <section className="space-y-5" aria-label="Stop arrivals">
      <div>
        <label htmlFor="mbta-stop" className="mb-2 block font-medium">
          Choose a stop
        </label>
        <select
          id="mbta-stop"
          value={stopId}
          onChange={(event) => onStopChange(event.target.value)}
          className="w-full rounded-lg border border-blue-400/40 bg-blue-950 p-3"
        >
          {stops.map((stop) => (
            <option key={stop.id} value={stop.id}>
              {stop.attributes.name}
            </option>
          ))}
        </select>
      </div>
      {selectedStop && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold">
                {selectedStop.attributes.name}
              </h2>
              <p className="text-sm text-blue-200">
                Live arrivals · updates every 15 seconds
              </p>
            </div>
            <button
              type="button"
              aria-expanded={detailsOpen}
              aria-controls="mbta-stop-details"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="rounded-lg border border-blue-400/50 px-4 py-2 hover:bg-blue-900"
            >
              {detailsOpen ? "Hide details" : "Stop details"}
            </button>
          </div>
          {detailsOpen && (
            <div id="mbta-stop-details">
              <StopDetails key={stopId} stopId={stopId} />
            </div>
          )}
          {isLoading && <p role="status">Loading arrivals…</p>}
          {error && (
            <p role="alert" className="text-amber-200">
              Live arrivals are temporarily unavailable.
              {data && " Showing the last received predictions."}
            </p>
          )}
          {!isLoading && !error && predictions.length === 0 && (
            <p>No trains predicted at this stop right now.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {predictions.map((prediction) => {
              const routeId =
                prediction.relationships.route?.data?.id ?? lineId;
              const predictionRoute = catalog.routes.find(
                (candidate) => candidate.id === routeId,
              );
              const trip = data?.included?.find(
                (item) =>
                  item.type === "trip" &&
                  item.id === prediction.relationships.trip?.data?.id,
              );
              const direction =
                predictionRoute?.directionNames[
                  prediction.attributes.direction_id
                ] ??
                route?.directionNames[prediction.attributes.direction_id] ??
                "";
              const arrival =
                prediction.attributes.arrival_time ??
                prediction.attributes.departure_time;
              return (
                <article
                  key={prediction.id}
                  className="space-y-2 rounded-xl bg-blue-900/60 p-4"
                >
                  <span
                    className="inline-block rounded px-2 py-1 text-sm font-semibold"
                    style={{
                      backgroundColor: `#${predictionRoute?.color ?? "374151"}`,
                      color: `#${predictionRoute?.textColor ?? "FFFFFF"}`,
                    }}
                  >
                    {predictionRoute?.name ?? routeId}
                  </span>
                  <h3 className="font-semibold">
                    {trip?.attributes?.headsign || direction || "Train arrival"}
                  </h3>
                  <p className="text-2xl font-bold">
                    {prediction.attributes.status || countdown(arrival)}
                  </p>
                  {arrival && (
                    <p className="text-sm text-blue-200">
                      {new Date(arrival).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {prediction.relationships.vehicle?.data?.id && (
                    <p className="text-xs text-blue-200">
                      Vehicle {prediction.relationships.vehicle.data.id}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
          {isValidating && !isLoading && (
            <p role="status" className="text-xs text-blue-200">
              Updating arrivals…
            </p>
          )}
        </>
      )}
    </section>
  );
}
