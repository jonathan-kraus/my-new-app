/*
 * @FilePath: \my-new-app\app\stops\page.tsx
 * @LastEditTime: 2026-08-22 20:16:56
 */
"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function StopsPage() {
  const { data, isLoading } = useSWR("/api/stops", fetcher);

  if (isLoading) return <div>Loading stops...</div>;

  const stops = data?.data ?? [];

  return (
    <div>
      <h1>Choose a Stop</h1>
      <ul>
        {stops.map((stop: any) => (
          <li key={stop.id}>
            <a href={`/arrivals/${stop.id}`}>{stop.attributes.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
