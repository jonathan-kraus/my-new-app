export type StopAttributes = {
  name: string;
  latitude: number | null;
  longitude: number | null;
  location_type: number;
  address?: string | null;
  municipality?: string | null;
  description?: string | null;
  wheelchair_boarding?: number;
  platform_code?: string | null;
  platform_name?: string | null;
};

export type CatalogStop = {
  id: string;
  type: "stop";
  attributes: StopAttributes;
  parentStationId: string | null;
};

export type CatalogRoute = {
  id: string;
  name: string;
  color: string;
  textColor: string;
  routeType: number;
  sortOrder: number;
  directionNames: string[];
};

export type CatalogPattern = {
  id: string;
  routeId: string;
  name: string;
  directionId: number;
  typicality: number;
  canonical: boolean | null;
  sortOrder: number;
  stopIds: string[];
};

export type MbtaCatalog = {
  routes: CatalogRoute[];
  stops: CatalogStop[];
  patterns: CatalogPattern[];
  syncedAt: string | null;
};

export type StopDetail = CatalogStop & {
  routes: CatalogRoute[];
  platforms: CatalogStop[];
  syncedAt: string | null;
};

export const frequentStops = [
  { id: "place-denrd", name: "Dean Road", routeId: "Green-C" },
  { id: "place-hymnl", name: "Hynes Convention Center", routeId: "Green-C" },
] as const;

export function stationId(stop: CatalogStop) {
  return stop.parentStationId ?? stop.id;
}

/** Canonical patterns define the line map, including regular branches/closed stops. */
function displayPatterns(catalog: MbtaCatalog) {
  const canonicalRoutes = new Set(
    catalog.patterns
      .filter((pattern) => pattern.canonical === true)
      .map((pattern) => pattern.routeId),
  );
  return catalog.patterns.filter((pattern) =>
    canonicalRoutes.has(pattern.routeId)
      ? pattern.canonical === true
      : // Older snapshots and routes without canonical metadata use typical service.
        pattern.canonical == null && pattern.typicality === 1,
  );
}

/** Preserve pattern order, resolving boarding platforms to their stations. */
export function stopsForRoute(catalog: MbtaCatalog, routeId: string) {
  const byId = new Map(catalog.stops.map((stop) => [stop.id, stop]));
  const patterns = displayPatterns(catalog)
    .filter((pattern) => pattern.routeId === routeId)
    .sort(
      (a, b) =>
        (a.typicality === 1 ? 0 : 1) - (b.typicality === 1 ? 0 : 1) ||
        a.directionId - b.directionId ||
        a.sortOrder - b.sortOrder ||
        a.id.localeCompare(b.id),
    );
  const stations = new Map<string, CatalogStop>();
  for (const pattern of patterns) {
    for (const id of pattern.stopIds) {
      const platform = byId.get(id);
      if (!platform) continue;
      const stop = byId.get(stationId(platform)) ?? platform;
      stations.set(stop.id, stop);
    }
  }
  return [...stations.values()];
}

export function routesForStop(catalog: MbtaCatalog, stopId: string) {
  const stop = catalog.stops.find((candidate) => candidate.id === stopId);
  if (!stop) return [];
  const station = stationId(stop);
  const ids = new Set(
    catalog.stops
      .filter((candidate) => stationId(candidate) === station)
      .map((candidate) => candidate.id),
  );
  const routeIds = new Set(
    displayPatterns(catalog)
      .filter((pattern) => pattern.stopIds.some((id) => ids.has(id)))
      .map((pattern) => pattern.routeId),
  );
  return catalog.routes.filter((route) => routeIds.has(route.id));
}
