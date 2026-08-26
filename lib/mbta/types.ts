/*
 * @FilePath: \my-new-app\lib\mbta\types.ts
 * @LastEditTime: 2026-08-26 01:14:05
 */
export interface MBTAStop {
  id: string;
  type: "stop";
  attributes: {
    name: string;
    platform_code?: string;
    platform_name?: string;
  };
}

export interface MBTAPrediction {
  id: string;
  type: "prediction";
  attributes: {
    arrival_time: string | null;
    departure_time: string | null;
    direction_id: number | null;
    stop_sequence: number;
  };
  relationships: {
    stop: {
      data: {
        id: string;
        type: "stop";
      };
    };
    trip?: {
      data: {
        id: string;
        type: "trip";
      } | null;
    };
  };
}
export function getStopName(stopId: string) {
  const stop = greenCStops.find((s) => s.id === stopId);
  return stop?.attributes?.name ?? stopId;
}

export const greenCStops: MBTAStop[] = [
  { id: "place-clmnl", type: "stop", attributes: { name: "Cleveland Circle" } },
  { id: "place-engav", type: "stop", attributes: { name: "Englewood Ave" } },
  { id: "place-denrd", type: "stop", attributes: { name: "Dean Road" } },
  { id: "place-tapst", type: "stop", attributes: { name: "Tappan Street" } },
  {
    id: "place-wascm",
    type: "stop",
    attributes: { name: "Washington Square" },
  },
  { id: "place-fbkst", type: "stop", attributes: { name: "Fairbanks Street" } },
  { id: "place-brnhl", type: "stop", attributes: { name: "Brandon Hall" } },
  { id: "place-sumav", type: "stop", attributes: { name: "Summit Ave" } },
  { id: "place-cool", type: "stop", attributes: { name: "Coolidge Corner" } },
  { id: "place-stplb", type: "stop", attributes: { name: "St. Paul Street" } },
  { id: "place-kntst", type: "stop", attributes: { name: "Kent Street" } },
  { id: "place-hwsst", type: "stop", attributes: { name: "Hawes Street" } },
  {
    id: "place-smary",
    type: "stop",
    attributes: { name: "St. Mary’s Street" },
  },
  {
    id: "place-hymnl",
    type: "stop",
    attributes: { name: "Hynes Convention Center" },
  },
];

export interface MBTAStopPrediction {
  stop: MBTAStop;
  predictions: MBTAPrediction[];
}
