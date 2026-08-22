/*
 * @FilePath: \my-new-app\app\arrivals\[stop]\page.tsx
 * @LastEditTime: 2026-08-22 17:33:22
 */
// app/arrivals/[stop]/page.tsx
import { mbta } from "@/lib/mbta";
import { ArrivalsWidget } from "@/components/ArrivalsWidget";

export default async function Arrivals({
  params,
}: {
  params: { stop: string };
}) {
  const data = await mbta("predictions", { "filter[stop]": params.stop });

  return (
    <div>
      <h1>Arrivals for {params.stop}</h1>
      <ul>
        {data.data.map((p: any) => {
          const arrival = p.attributes.arrival_time;
          const route = p.relationships.route.data.id;
          return (
            <li key={p.id}>
              {route}: {arrival ? new Date(arrival).toLocaleTimeString() : "—"}
            </li>
          );
        })}
      </ul>
      <ArrivalsWidget stop="place-dean" />
    </div>
  );
}
