import "server-only";
import { mbtaDb as db8 } from "./db";
import type { JsonValue } from "@prisma/orm-postgres/target/codec-types";
import type {
  CatalogRoute,
  MbtaCatalog,
  StopAttributes,
  StopDetail,
} from "./catalog-types";
import { routesForStop, stationId } from "./catalog-types";

export class CatalogUnavailableError extends Error {
  constructor() {
    super("The MBTA stop catalog has not been loaded yet.");
  }
}

export class CatalogSyncBusyError extends Error {
  constructor() {
    super(
      "An MBTA catalog refresh is already being published. Try again shortly.",
    );
  }
}

// One lock for this catalog only. Shared reads cannot observe a partial refresh.
const readLock = () =>
  db8.raw.sql`
  SELECT true AS acquired FROM pg_advisory_xact_lock_shared(1296192577, 1)
`
    .returnsRow({ acquired: "pg/bool@1" })
    .build();
const writeLock = () =>
  db8.raw.sql`
  SELECT pg_try_advisory_xact_lock(1296192577, 1) AS acquired
`
    .returnsRow({ acquired: "pg/bool@1" })
    .build();

export async function getMbtaSyncState() {
  return db8.orm.public.MbtaSyncState.where({ id: "catalog" }).first();
}

export async function getMbtaCatalog(): Promise<MbtaCatalog> {
  return db8.transaction(async (tx) => {
    await tx.query(readLock());
    const state = await tx.orm.public.MbtaSyncState.where({
      id: "catalog",
    }).first();
    if (!state?.lastSuccessAt) throw new CatalogUnavailableError();
    const routes = await tx.orm.public.MbtaRoute.orderBy((route) =>
      route.sortOrder.asc(),
    ).all();
    const stops = await tx.orm.public.MbtaStop.all();
    const patterns = await tx.orm.public.MbtaPattern.orderBy((pattern) =>
      pattern.sortOrder.asc(),
    ).all();
    const memberships = await tx.orm.public.MbtaPatternStop.orderBy((stop) =>
      stop.position.asc(),
    ).all();
    const sequences = new Map<string, string[]>();
    for (const membership of memberships) {
      const sequence = sequences.get(membership.patternId) ?? [];
      sequence.push(membership.stopId);
      sequences.set(membership.patternId, sequence);
    }
    return {
      routes: routes.map((route): CatalogRoute => ({
        id: route.id,
        name: route.name,
        color: route.color,
        textColor: route.textColor,
        routeType: route.routeType,
        sortOrder: route.sortOrder,
        directionNames: (route.attributes as { directionNames: string[] })
          .directionNames,
      })),
      stops: stops.map((stop) => ({
        id: stop.id,
        type: "stop" as const,
        attributes: stop.attributes as StopAttributes,
        parentStationId: stop.parentStationId,
      })),
      patterns: patterns.map((pattern) => ({
        ...pattern,
        stopIds: sequences.get(pattern.id) ?? [],
      })),
      syncedAt: state.lastSuccessAt,
    };
  });
}

export async function getMbtaStop(id: string): Promise<StopDetail | null> {
  const catalog = await getMbtaCatalog();
  const stop = catalog.stops.find((candidate) => candidate.id === id);
  if (!stop) return null;
  return {
    ...stop,
    routes: routesForStop(catalog, id),
    platforms: catalog.stops.filter(
      (candidate) => candidate.parentStationId === stationId(stop),
    ),
    syncedAt: catalog.syncedAt,
  };
}

/** Replace only catalog tables, atomically. Stable MBTA IDs remain the public identifiers. */
export async function publishMbtaCatalog(
  catalog: MbtaCatalog,
  startedAt: string,
) {
  return db8.transaction(async (tx) => {
    const [lock] = await tx.query(writeLock());
    if (!lock?.acquired) throw new CatalogSyncBusyError();
    const state = await tx.orm.public.MbtaSyncState.where({
      id: "catalog",
    }).first();
    // A slow fetch must never replace a snapshot fetched by a newer invocation.
    if (state?.lastAttemptAt && state.lastAttemptAt > startedAt)
      throw new CatalogSyncBusyError();
    await tx.execute(tx.sql.public.MbtaPatternStop.delete().build());
    await tx.execute(tx.sql.public.MbtaPattern.delete().build());
    await tx.execute(tx.sql.public.MbtaRoute.delete().build());
    await tx.execute(tx.sql.public.MbtaStop.delete().build());
    const stopRows = catalog.stops.map((stop) => ({
      id: stop.id,
      name: stop.attributes.name,
      latitude: stop.attributes.latitude,
      longitude: stop.attributes.longitude,
      locationType: stop.attributes.location_type,
      parentStationId: stop.parentStationId,
      attributes: stop.attributes as JsonValue,
    }));
    await tx.execute(tx.sql.public.MbtaStop.insert(stopRows).build());
    await tx.execute(
      tx.sql.public.MbtaRoute.insert(
        catalog.routes.map(({ directionNames, ...route }) => ({
          ...route,
          attributes: { directionNames } as JsonValue,
        })),
      ).build(),
    );
    await tx.execute(
      tx.sql.public.MbtaPattern.insert(
        catalog.patterns.map(({ stopIds: _stopIds, ...pattern }) => pattern),
      ).build(),
    );
    const membershipRows = catalog.patterns.flatMap((pattern) =>
      pattern.stopIds.map((stopId, position) => ({
        id: `${pattern.id}:${position}`,
        patternId: pattern.id,
        stopId,
        position,
      })),
    );
    await tx.execute(
      tx.sql.public.MbtaPatternStop.insert(membershipRows).build(),
    );
    const syncedAt = new Date().toISOString();
    const values = {
      lastAttemptAt: startedAt,
      lastSuccessAt: syncedAt,
      lastError: null,
      routeCount: catalog.routes.length,
      stopCount: catalog.stops.length,
      patternCount: catalog.patterns.length,
    };
    await tx.orm.public.MbtaSyncState.upsert({
      conflictOn: { id: "catalog" },
      create: { id: "catalog", ...values },
      update: values,
    });
    return { ...values, membershipCount: membershipRows.length };
  });
}

export async function recordMbtaSyncFailure(startedAt: string) {
  await db8.transaction(async (tx) => {
    const [lock] = await tx.query(writeLock());
    if (!lock?.acquired) return;
    const state = await tx.orm.public.MbtaSyncState.where({
      id: "catalog",
    }).first();
    if (state?.lastAttemptAt && state.lastAttemptAt > startedAt) return;
    const values = {
      lastAttemptAt: startedAt,
      lastError:
        "Refresh failed. The previous catalog has been retained. Check the server logs and retry.",
    };
    await tx.orm.public.MbtaSyncState.upsert({
      conflictOn: { id: "catalog" },
      create: {
        id: "catalog",
        ...values,
        lastSuccessAt: null,
        routeCount: 0,
        stopCount: 0,
        patternCount: 0,
      },
      update: values,
    });
  });
}
