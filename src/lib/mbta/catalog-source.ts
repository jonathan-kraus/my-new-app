import { z } from "zod";
import type { CatalogPattern, CatalogStop, MbtaCatalog } from "./catalog-types";

const origin = "https://api-v3.mbta.com";
const identifier = z.object({ id: z.string().min(1), type: z.string() });
const resource = z.object({
  id: z.string().min(1),
  type: z.string(),
  attributes: z.record(z.string(), z.unknown()),
  relationships: z
    .record(
      z.string(),
      z
        .object({
          data: z.union([identifier, z.array(identifier), z.null()]).optional(),
        })
        .passthrough(),
    )
    .optional(),
});
const pageSchema = z.object({
  data: z.array(resource),
  included: z.array(resource).optional(),
  links: z.object({ next: z.string().nullable().optional() }).optional(),
});
type Resource = z.infer<typeof resource>;
const stopAttributes = z
  .object({
    name: z.string().min(1),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    location_type: z.number().int(),
    address: z.string().nullable().optional(),
    municipality: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    wheelchair_boarding: z.number().int().optional(),
    platform_code: z.string().nullable().optional(),
    platform_name: z.string().nullable().optional(),
  })
  .passthrough();
const routeAttributes = z.object({
  long_name: z.string(),
  short_name: z.string(),
  color: z.string().regex(/^[\da-f]{6}$/i),
  text_color: z.string().regex(/^[\da-f]{6}$/i),
  type: z.number().int(),
  sort_order: z.number().int(),
  direction_names: z.array(z.string()),
});
const patternAttributes = z.object({
  name: z.string(),
  direction_id: z.number().int().min(0).max(1),
  typicality: z.number().int(),
  canonical: z.boolean().nullable().default(null),
  sort_order: z.number().int(),
});

function relatedId(item: Resource, name: string) {
  const data = item.relationships?.[name]?.data;
  return data && !Array.isArray(data) ? data.id : null;
}

/** Follow every page; reject unexpected pagination targets before sending the API key. */
export async function fetchMbtaPages(path: string, fetcher = fetch) {
  let next: string | null = new URL(path, origin).href;
  const seen = new Set<string>();
  const data: Resource[] = [];
  const included = new Map<string, Resource>();
  while (next) {
    const url: URL = new URL(next, origin);
    if (url.origin !== origin || seen.has(url.href) || seen.size >= 100) {
      throw new Error("Invalid MBTA pagination");
    }
    seen.add(url.href);
    const response = await fetcher(url, {
      headers: process.env.MBTA_KEY
        ? { "x-api-key": process.env.MBTA_KEY }
        : {},
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`MBTA returned HTTP ${response.status}`);
    const page = pageSchema.parse(await response.json());
    data.push(...page.data);
    for (const item of page.included ?? [])
      included.set(`${item.type}:${item.id}`, item);
    next = page.links?.next ?? null;
  }
  return { data, included: [...included.values()] };
}

/** Import the subway/trolley network, including both directions and branch patterns. */
export async function fetchMbtaCatalog(fetcher = fetch): Promise<MbtaCatalog> {
  const routePage = await fetchMbtaPages(
    "/routes?filter[type]=0,1&sort=sort_order&page[limit]=100",
    fetcher,
  );
  const routes = routePage.data.map((item) => {
    if (item.type !== "route") throw new Error("Expected MBTA route");
    const attrs = routeAttributes.parse(item.attributes);
    return {
      id: item.id,
      name: attrs.long_name || attrs.short_name || item.id,
      color: attrs.color,
      textColor: attrs.text_color,
      routeType: attrs.type,
      sortOrder: attrs.sort_order,
      directionNames: attrs.direction_names,
    };
  });
  if (!routes.length) throw new Error("MBTA returned an empty route catalog");
  const routeIds = routes.map((route) => route.id).join(",");
  const [stopPage, patternPage] = await Promise.all([
    fetchMbtaPages(
      `/stops?filter[route]=${encodeURIComponent(routeIds)}&include=parent_station&page[limit]=100`,
      fetcher,
    ),
    fetchMbtaPages(
      `/route_patterns?filter[route]=${encodeURIComponent(routeIds)}&include=representative_trip.stops&sort=sort_order&page[limit]=100`,
      fetcher,
    ),
  ]);
  const stopsById = new Map<string, CatalogStop>();
  for (const item of [
    ...stopPage.included,
    ...patternPage.included,
    ...stopPage.data,
  ]) {
    if (item.type !== "stop") continue;
    const attrs = stopAttributes.parse(item.attributes);
    stopsById.set(item.id, {
      id: item.id,
      type: "stop",
      attributes: attrs,
      parentStationId: relatedId(item, "parent_station"),
    });
  }
  const trips = new Map(
    patternPage.included
      .filter((item) => item.type === "trip")
      .map((item) => [item.id, item]),
  );
  const patterns: CatalogPattern[] = patternPage.data.map((item) => {
    if (item.type !== "route_pattern")
      throw new Error("Expected MBTA route pattern");
    const attrs = patternAttributes.parse(item.attributes);
    const routeId = relatedId(item, "route");
    const tripId = relatedId(item, "representative_trip");
    const trip = tripId ? trips.get(tripId) : undefined;
    const stopData = trip?.relationships?.stops?.data;
    if (
      !routeId ||
      !routes.some((route) => route.id === routeId) ||
      !Array.isArray(stopData) ||
      !stopData.length
    ) {
      throw new Error(`Incomplete MBTA pattern ${item.id}`);
    }
    return {
      id: item.id,
      routeId,
      name: attrs.name,
      directionId: attrs.direction_id,
      typicality: attrs.typicality,
      canonical: attrs.canonical,
      sortOrder: attrs.sort_order,
      stopIds: stopData.map((stop) => stop.id),
    };
  });
  if (
    new Set(routes.map((route) => route.id)).size !== routes.length ||
    new Set(patterns.map((pattern) => pattern.id)).size !== patterns.length
  ) {
    throw new Error("MBTA returned duplicate route or pattern IDs");
  }
  for (const route of routes) {
    if (!patterns.some((pattern) => pattern.routeId === route.id))
      throw new Error(`Missing patterns for ${route.id}`);
  }
  for (const stop of stopsById.values()) {
    if (stop.parentStationId && !stopsById.has(stop.parentStationId))
      throw new Error(`Missing parent station for ${stop.id}`);
  }
  for (const pattern of patterns) {
    if (pattern.stopIds.some((id) => !stopsById.has(id)))
      throw new Error(`Missing stops for ${pattern.id}`);
  }
  return { routes, stops: [...stopsById.values()], patterns, syncedAt: null };
}
