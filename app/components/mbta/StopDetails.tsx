"use client";

import useSWR from "swr";
import type { StopDetail } from "@/lib/mbta/catalog-types";
import { mbtaFetcher } from "@/lib/mbta/fetcher";

function accessibility(value?: number) {
  return value === 1
    ? "Accessible"
    : value === 2
      ? "Not wheelchair accessible"
      : "Accessibility information unavailable";
}

export function StopDetails({ stopId }: { stopId: string }) {
  const { data, error, isLoading } = useSWR<{ data: StopDetail }>(
    `/api/stops/${encodeURIComponent(stopId)}`,
    mbtaFetcher,
  );
  if (isLoading) return <p role="status">Loading stop details…</p>;
  if (error || !data)
    return <p role="alert">Stop details are temporarily unavailable.</p>;
  const stop = data.data;
  const attrs = stop.attributes;
  return (
    <section
      aria-label={`${attrs.name} details`}
      className="space-y-4 rounded-xl border border-blue-400/40 bg-blue-900/40 p-5"
    >
      <h3 className="text-lg font-semibold">{attrs.name}</h3>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-blue-200">Address</dt>
          <dd>{attrs.address || attrs.municipality || "Not provided"}</dd>
        </div>
        <div>
          <dt className="text-sm text-blue-200">Accessibility</dt>
          <dd>{accessibility(attrs.wheelchair_boarding)}</dd>
        </div>
        <div>
          <dt className="text-sm text-blue-200">Latitude</dt>
          <dd>{attrs.latitude ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="text-sm text-blue-200">Longitude</dt>
          <dd>{attrs.longitude ?? "Not provided"}</dd>
        </div>
      </dl>
      {attrs.description && <p>{attrs.description}</p>}
      <div>
        <p className="mb-2 text-sm text-blue-200">Lines serving this station</p>
        <div className="flex flex-wrap gap-2">
          {stop.routes.map((route) => (
            <span
              key={route.id}
              className="rounded px-2 py-1 text-sm font-semibold"
              style={{
                backgroundColor: `#${route.color}`,
                color: `#${route.textColor}`,
              }}
            >
              {route.name}
            </span>
          ))}
        </div>
      </div>
      {attrs.latitude !== null && attrs.longitude !== null && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${attrs.latitude},${attrs.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block underline"
        >
          Open in maps
        </a>
      )}
      {stop.platforms.length > 0 && (
        <div>
          <h4 className="mb-2 font-medium">Platforms</h4>
          <ul className="space-y-2">
            {stop.platforms.map((platform) => (
              <li key={platform.id} className="text-sm">
                {platform.attributes.platform_name ||
                  platform.attributes.description ||
                  platform.attributes.name}
                {platform.attributes.platform_code &&
                  ` · ${platform.attributes.platform_code}`}
                <span className="block text-blue-200">
                  {accessibility(platform.attributes.wheelchair_boarding)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
