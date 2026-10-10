import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchMbtaCatalog,
  fetchMbtaPages,
} from "../src/lib/mbta/catalog-source";
import { routesForStop, stopsForRoute } from "../src/lib/mbta/catalog-types";
import { mbtaFixture } from "./fixtures/mbta";

afterEach(() => vi.unstubAllEnvs());

describe("MBTA station relationships", () => {
  it("resolves platform IDs to one station without duplicating reverse-direction stops", () => {
    expect(
      stopsForRoute(mbtaFixture, "Green-C").map((stop) => stop.id),
    ).toEqual(["place-pktrm", "place-hymnl", "place-denrd"]);
  });
  it("finds connecting lines for both stations and their platforms", () => {
    expect(
      routesForStop(mbtaFixture, "place-pktrm").map((route) => route.id),
    ).toEqual(["Green-C", "Green-B", "Red"]);
    expect(
      routesForStop(mbtaFixture, "platform-hynes").map((route) => route.id),
    ).toEqual(["Green-C", "Green-B"]);
  });
  it("retains every canonical branch, including a temporarily closed branch", () => {
    const catalog = {
      ...mbtaFixture,
      patterns: [
        ...mbtaFixture.patterns,
        {
          ...mbtaFixture.patterns[0]!,
          id: "branch",
          typicality: 5,
          stopIds: ["place-pktrm", "place-alfcl"],
        },
      ],
    };
    expect(stopsForRoute(catalog, "Green-C").map((stop) => stop.id)).toContain(
      "place-alfcl",
    );
  });
});

describe("canonical branch membership", () => {
  const catalog = {
    ...mbtaFixture,
    routes: [
      ...mbtaFixture.routes,
      { ...mbtaFixture.routes[0]!, id: "Green-E" },
    ],
    stops: [
      ...mbtaFixture.stops,
      {
        ...mbtaFixture.stops[0]!,
        id: "place-mgngl",
        attributes: {
          ...mbtaFixture.stops[0]!.attributes,
          name: "Magoun Square",
        },
      },
    ],
    patterns: [
      ...mbtaFixture.patterns,
      ...["Green-B", "Green-C", "Green-E"].map((routeId) => ({
        ...mbtaFixture.patterns[0]!,
        id: routeId + "-magoun",
        routeId,
        canonical: routeId === "Green-E",
        typicality: routeId === "Green-E" ? 1 : 3,
        stopIds: ["place-mgngl", "place-pktrm"],
      })),
    ],
  };
  it("excludes occasional B/C patterns from the picker and station badges", () => {
    expect(
      routesForStop(catalog, "place-mgngl").map((route) => route.id),
    ).toEqual(["Green-E"]);
    expect(stopsForRoute(catalog, "Green-C").map((stop) => stop.id)).toEqual([
      "place-pktrm",
      "place-hymnl",
      "place-denrd",
    ]);
    expect(
      stopsForRoute(catalog, "Green-B").map((stop) => stop.id),
    ).not.toContain("place-mgngl");
    expect(stopsForRoute(catalog, "Green-E").map((stop) => stop.id)).toContain(
      "place-mgngl",
    );
  });
  it("uses typical service for old snapshots without admitting atypical patterns", () => {
    const legacy = {
      ...catalog,
      patterns: catalog.patterns.map((pattern) => ({
        ...pattern,
        canonical: null,
      })),
    };
    expect(
      routesForStop(legacy, "place-mgngl").map((route) => route.id),
    ).toEqual(["Green-E"]);
    expect(
      stopsForRoute(legacy, "Green-C").map((stop) => stop.id),
    ).not.toContain("place-mgngl");
  });
  it("does not promote explicitly noncanonical patterns into the line map", () => {
    const noncanonical = {
      ...catalog,
      patterns: catalog.patterns.map((pattern) => ({
        ...pattern,
        canonical: false,
      })),
    };
    expect(stopsForRoute(noncanonical, "Green-C")).toEqual([]);
    expect(routesForStop(noncanonical, "place-mgngl")).toEqual([]);
  });
});

describe("MBTA importer", () => {
  it("follows pagination and sends the key in headers rather than the URL", async () => {
    vi.stubEnv("MBTA_KEY", "test-key");
    const item = (id: string) => ({
      id,
      type: "stop",
      attributes: { name: id },
    });
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({
          data: [item("a")],
          links: { next: "/stops?page[offset]=1" },
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ data: [item("b")], links: { next: null } }),
      );
    const result = await fetchMbtaPages("/stops", fetcher);
    expect(result.data.map((stop) => stop.id)).toEqual(["a", "b"]);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0]![1]).toMatchObject({
      headers: { "x-api-key": "test-key" },
    });
    expect(String(fetcher.mock.calls[0]![0])).not.toContain("test-key");
  });
  it.each(["https://example.com/stops", "/stops"])(
    "rejects unsafe or repeated pagination: %s",
    async (next) => {
      const fetcher = vi
        .fn()
        .mockResolvedValue(Response.json({ data: [], links: { next } }));
      await expect(fetchMbtaPages("/stops", fetcher)).rejects.toThrow(
        "Invalid MBTA pagination",
      );
      expect(fetcher).toHaveBeenCalledOnce();
    },
  );
  it("rejects upstream failures instead of treating them as an empty catalog", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("unavailable", { status: 429 }));
    await expect(fetchMbtaCatalog(fetcher)).rejects.toThrow("HTTP 429");
  });
  it("builds the catalog from representative-trip order and parent stations", async () => {
    const fixture = mbtaFixture;
    const routeData = fixture.routes.map((route) => ({
      id: route.id,
      type: "route",
      attributes: {
        long_name: route.name,
        short_name: "",
        color: route.color,
        text_color: route.textColor,
        type: route.routeType,
        sort_order: route.sortOrder,
        direction_names: route.directionNames,
      },
    }));
    const stopData = fixture.stops.map((stop) => ({
      ...stop,
      relationships: {
        parent_station: {
          data: stop.parentStationId
            ? { id: stop.parentStationId, type: "stop" }
            : null,
        },
      },
    }));
    const patternData = fixture.patterns.map((pattern) => ({
      id: pattern.id,
      type: "route_pattern",
      attributes: {
        name: pattern.name,
        direction_id: pattern.directionId,
        typicality: pattern.typicality,
        canonical: pattern.canonical,
        sort_order: pattern.sortOrder,
      },
      relationships: {
        route: { data: { id: pattern.routeId, type: "route" } },
        representative_trip: {
          data: { id: `trip-${pattern.id}`, type: "trip" },
        },
      },
    }));
    const trips = fixture.patterns.map((pattern) => ({
      id: `trip-${pattern.id}`,
      type: "trip",
      attributes: {},
      relationships: {
        stops: { data: pattern.stopIds.map((id) => ({ id, type: "stop" })) },
      },
    }));
    const fetcher = vi.fn(async (url: string | URL | Request) => {
      const path = new URL(String(url)).pathname;
      return Response.json(
        path === "/routes"
          ? { data: routeData }
          : path === "/stops"
            ? { data: stopData }
            : { data: patternData, included: trips },
      );
    });
    const catalog = await fetchMbtaCatalog(fetcher);
    expect(catalog.patterns).toEqual(fixture.patterns);
    expect(catalog.stops).toHaveLength(fixture.stops.length);
    expect(catalog.routes).toEqual(fixture.routes);
    patternData[0]!.attributes.canonical = false;
    expect((await fetchMbtaCatalog(fetcher)).patterns[0]?.canonical).toBe(
      false,
    );
    // Canonical is nullable when upstream has no designation for a route.
    Reflect.deleteProperty(patternData[0]!.attributes, "canonical");
    expect((await fetchMbtaCatalog(fetcher)).patterns[0]?.canonical).toBeNull();
    // One missing representative trip must reject the entire import.
    trips.pop();
    await expect(fetchMbtaCatalog(fetcher)).rejects.toThrow(
      "Incomplete MBTA pattern",
    );
  });
});
