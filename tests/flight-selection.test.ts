import { describe, expect, it } from "vitest";
import {
  isNearbyAirborne,
  latestPosition,
  selectFlight,
} from "@/lib/flight/selection";
import type { Flight } from "@/lib/flight/types";

const now = Date.parse("2026-10-15T12:00:00Z");
const active = {
  ident: "AAL3166",
  fa_flight_id: "active",
  status: "En Route",
  actual_off: "2026-10-15T10:00:00Z",
  scheduled_out: "2026-10-15T09:30:00Z",
  last_position: {
    timestamp: "2026-10-15T11:59:00Z",
    altitude: 28,
    latitude: 40.4,
    longitude: -105.2,
  },
} as Flight;
const future = {
  ...active,
  fa_flight_id: "future",
  status: "Scheduled",
  actual_off: undefined,
  last_position: undefined,
  scheduled_out: "2026-10-18T04:31:00Z",
};
const bounds = { minLat: 40, maxLat: 41, minLon: -106, maxLon: -105 };

describe("flight occurrence selection", () => {
  it("selects the airborne occurrence even when a future flight is first", () => {
    expect(selectFlight([future, active], now)?.fa_flight_id).toBe("active");
  });
  it("does not mistake a landed flight with actual_off for an active flight", () => {
    const landed = {
      ...active,
      fa_flight_id: "landed",
      actual_on: "2026-10-15T11:50:00Z",
    };
    expect(selectFlight([future, landed, active], now)?.fa_flight_id).toBe(
      "active",
    );
  });
  it("finds newest ISO or numeric telemetry regardless of ordering", () => {
    const newest = active.last_position!;
    expect(
      latestPosition([newest, { ...newest, timestamp: now / 1000 - 120 }]),
    ).toEqual(newest);
    expect(latestPosition([{ ...newest, timestamp: "invalid" }])).toBeNull();
  });
  it("only includes fresh airborne positions inside the skybox", () => {
    expect(isNearbyAirborne(active, bounds, now)).toBe(true);
    for (const flight of [
      future,
      { ...active, actual_on: "2026-10-15T11:50:00Z" },
      {
        ...active,
        last_position: {
          ...active.last_position!,
          timestamp: "2026-10-15T10:00:00Z",
        },
      },
      { ...active, last_position: { ...active.last_position!, latitude: 42 } },
    ])
      expect(isNearbyAirborne(flight, bounds, now)).toBe(false);
  });
});
