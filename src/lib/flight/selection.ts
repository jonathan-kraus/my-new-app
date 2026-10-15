import type { Flight, FlightPosition } from "./types";

export function positionTime(position: FlightPosition): number {
  const value = position.timestamp;
  return typeof value === "string"
    ? Date.parse(value)
    : value < 1e12
      ? value * 1000
      : value;
}

export function latestPosition(positions: FlightPosition[]) {
  return positions.reduce<FlightPosition | null>(
    (latest, position) =>
      Number.isFinite(positionTime(position)) &&
      (!latest || positionTime(position) > positionTime(latest))
        ? position
        : latest,
    null,
  );
}

export function isAirborne(flight: Flight, now = Date.now()) {
  if (
    flight.actual_on ||
    flight.actual_in ||
    /arrived|landed|cancelled|canceled/i.test(flight.status ?? "")
  )
    return false;
  if (flight.actual_off) {
    const departure = Date.parse(flight.actual_off);
    return departure <= now && now - departure < 24 * 60 * 60 * 1000;
  }
  return /en\s?route|airborne/i.test(flight.status ?? "");
}

export function isFreshPosition(position: FlightPosition, now = Date.now()) {
  const age = now - positionTime(position);
  return age >= -60_000 && age <= 15 * 60_000;
}

export function selectFlight(flights: Flight[], now = Date.now()) {
  const active = flights.filter((flight) => isAirborne(flight, now));
  if (active.length) {
    return active.sort(
      (a, b) =>
        (b.last_position ? positionTime(b.last_position) || 0 : 0) -
        (a.last_position ? positionTime(a.last_position) || 0 : 0),
    )[0];
  }
  // For a typed flight number, use the nearest occurrence, not API ordering.
  return [...flights].sort((a, b) => {
    const distance = (flight: Flight) => {
      const time = Date.parse(
        flight.actual_out ?? flight.estimated_out ?? flight.scheduled_out,
      );
      return Number.isFinite(time) ? Math.abs(time - now) : Infinity;
    };
    return distance(a) - distance(b);
  })[0];
}

export function isNearbyAirborne(
  flight: Flight,
  bounds: { minLat: number; minLon: number; maxLat: number; maxLon: number },
  now = Date.now(),
) {
  const p = flight.last_position;
  return (
    isAirborne(flight, now) &&
    !!p &&
    isFreshPosition(p, now) &&
    typeof p.latitude === "number" &&
    typeof p.longitude === "number" &&
    p.latitude >= bounds.minLat &&
    p.latitude <= bounds.maxLat &&
    p.longitude >= bounds.minLon &&
    p.longitude <= bounds.maxLon
  );
}
