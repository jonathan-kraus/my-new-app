/*
 * @FilePath: \my-new-app\app\components\ArrivalCard.tsx
 * @LastEditTime: 2026-08-25 14:32:23
 */
import { MBTAPrediction } from "@/lib/mbta/types";
export function ArrivalCard({ prediction }: { prediction: MBTAPrediction }) {
  const arrival = prediction.attributes.arrival_time;
  const time = arrival ? new Date(arrival).toLocaleTimeString() : "—";
  const route = prediction.relationships.trip?.data?.id ?? "Unknown";

  return (
    <div className="p-2 rounded-md bg-neutral-50 border border-neutral-200">
      <div className="font-medium">{route}</div>
      <div>{time}</div>
    </div>
  );
}
