/*
 * @FilePath: \my-new-app\app\green-c\page.tsx
 */
"use client";

import { useState } from "react";
import { LineArrivals } from "@/app/components/LineArrivals";
import { lineNames, stopsByLine, type MBTALineId } from "@/lib/mbta/stops";

export default function GreenCPage() {
  const [lineId, setLineId] = useState<MBTALineId>("Green-C");
  const [stopId, setStopId] = useState<string>("place-denrd");
  const defaultStopByLine: Record<MBTALineId, string> = {
    "Green-B": "place-bland",
    "Green-C": "place-denrd",
    "Green-D": "place-river",
    "Green-E": "place-lech",
    Mattapan: "place-matt",
    Orange: "place-ogmnl",
    Red: "place-asmnl",
    Blue: "place-wondl",
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Choose a Line</h1>

      {/* Line Selector */}
      <select
        value={lineId}
        onChange={(e) => {
          const newLine = e.target.value as MBTALineId;
          setLineId(newLine);

          // ⭐ Set the default stop for that line
          setStopId(defaultStopByLine[newLine]);
        }}
        className="p-2 border rounded-md text-black bg-white dark:text-white dark:bg-gray-900 w-full mb-6"
      >
        {(Object.keys(stopsByLine) as MBTALineId[]).map((id) => (
          <option key={id} value={id}>
            {lineNames[id]}
          </option>
        ))}
      </select>

      {/* Arrivals for selected line */}
      <LineArrivals
        lineId={lineId}
        defaultStopId={stopsByLine[lineId][0]?.id}
      />
    </div>
  );
}
