import { beforeEach, expect, it, vi } from "vitest";
import { mbtaFixture } from "../fixtures/mbta";

const mocks = vi.hoisted(() => ({ getStop: vi.fn() }));
vi.mock("@/lib/mbta/catalog", () => ({
  getMbtaStop: mocks.getStop,
  CatalogUnavailableError: class extends Error {},
}));
import { GET } from "../../app/api/stops/[stop]/route";

beforeEach(() => vi.resetAllMocks());
it("awaits dynamic stop params and serves stored details without calling MBTA", async () => {
  const data = {
    ...mbtaFixture.stops[0],
    routes: mbtaFixture.routes,
    platforms: [],
    syncedAt: mbtaFixture.syncedAt,
  };
  mocks.getStop.mockResolvedValue(data);
  const response = await GET(
    new Request("http://localhost/api/stops/place-denrd"),
    { params: Promise.resolve({ stop: "place-denrd" }) },
  );
  expect(mocks.getStop).toHaveBeenCalledExactlyOnceWith("place-denrd");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ data });
});
it("returns 404 for a stop absent from the catalog", async () => {
  mocks.getStop.mockResolvedValue(null);
  const response = await GET(
    new Request("http://localhost/api/stops/unknown"),
    { params: Promise.resolve({ stop: "unknown" }) },
  );
  expect(response.status).toBe(404);
});
it("returns a recoverable 503 when the catalog is unavailable", async () => {
  const { CatalogUnavailableError } = await import("@/lib/mbta/catalog");
  mocks.getStop.mockRejectedValue(new CatalogUnavailableError());
  const response = await GET(
    new Request("http://localhost/api/stops/place-denrd"),
    { params: Promise.resolve({ stop: "place-denrd" }) },
  );
  expect(response.status).toBe(503);
});
