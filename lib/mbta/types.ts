/*
 * @FilePath: \my-new-app\lib\mbta\types.ts
 * @LastEditTime: 2026-08-25 14:04:47
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

export interface MBTAStopPrediction {
  stop: MBTAStop;
  predictions: MBTAPrediction[];
}
