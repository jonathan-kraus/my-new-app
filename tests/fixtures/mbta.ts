import type {
  CatalogStop,
  MbtaCatalog,
} from "../../src/lib/mbta/catalog-types";

const station = (id: string, name: string): CatalogStop => ({
  id,
  type: "stop",
  parentStationId: null,
  attributes: { name, latitude: 42.3, longitude: -71.1, location_type: 1 },
});
export const mbtaFixture: MbtaCatalog = {
  routes: ["Green-C", "Green-B", "Red"].map((id, sortOrder) => ({
    id,
    name: id,
    color: "00843D",
    textColor: "FFFFFF",
    routeType: 0,
    sortOrder,
    directionNames: ["Westbound", "Eastbound"],
  })),
  stops: [
    station("place-denrd", "Dean Road"),
    station("place-hymnl", "Hynes Convention Center"),
    station("place-pktrm", "Park Street"),
    station("place-alfcl", "Alewife"),
    {
      ...station("platform-hynes", "Hynes Convention Center"),
      parentStationId: "place-hymnl",
      attributes: {
        name: "Hynes Convention Center",
        latitude: 42.3,
        longitude: -71.1,
        location_type: 0,
        platform_name: "Kenmore & West",
      },
    },
  ],
  patterns: [
    {
      id: "c",
      routeId: "Green-C",
      name: "Cleveland Circle",
      directionId: 0,
      typicality: 1,
      sortOrder: 0,
      stopIds: ["place-pktrm", "platform-hynes", "place-denrd"],
    },
    {
      id: "c-reverse",
      routeId: "Green-C",
      name: "Government Center",
      directionId: 1,
      typicality: 1,
      sortOrder: 1,
      stopIds: ["place-denrd", "platform-hynes", "place-pktrm"],
    },
    {
      id: "b",
      routeId: "Green-B",
      name: "Boston College",
      directionId: 0,
      typicality: 1,
      sortOrder: 0,
      stopIds: ["place-pktrm", "platform-hynes"],
    },
    {
      id: "red",
      routeId: "Red",
      name: "Ashmont",
      directionId: 0,
      typicality: 1,
      sortOrder: 0,
      stopIds: ["place-alfcl", "place-pktrm"],
    },
  ],
  syncedAt: "2026-10-07T18:00:00.000Z",
};
