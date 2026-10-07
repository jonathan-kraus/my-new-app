import { beforeEach, expect, it, vi } from "vitest";
import { mbtaFixture } from "./fixtures/mbta";

const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  publish: vi.fn(),
  failure: vi.fn(),
}));
vi.mock("../src/lib/mbta/catalog-source", () => ({
  fetchMbtaCatalog: mocks.fetch,
}));
vi.mock("../src/lib/mbta/catalog", () => ({
  publishMbtaCatalog: mocks.publish,
  recordMbtaSyncFailure: mocks.failure,
  CatalogSyncBusyError: class extends Error {},
}));
import { syncMbtaCatalog } from "../src/lib/mbta/sync";
import { CatalogSyncBusyError } from "../src/lib/mbta/catalog";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.failure.mockResolvedValue(undefined);
});

it("publishes only after the complete import is available", async () => {
  mocks.fetch.mockResolvedValue(mbtaFixture);
  mocks.publish.mockResolvedValue({ routeCount: 3 });
  await expect(syncMbtaCatalog()).resolves.toEqual({ routeCount: 3 });
  expect(mocks.publish).toHaveBeenCalledWith(mbtaFixture, expect.any(String));
  expect(mocks.failure).not.toHaveBeenCalled();
});
it("keeps the old catalog when any API page fails", async () => {
  mocks.fetch.mockRejectedValue(new Error("HTTP 429"));
  await expect(syncMbtaCatalog()).rejects.toThrow("HTTP 429");
  expect(mocks.publish).not.toHaveBeenCalled();
  expect(mocks.failure).toHaveBeenCalledOnce();
});
it("records a publication failure without swallowing the original error", async () => {
  mocks.fetch.mockResolvedValue(mbtaFixture);
  mocks.publish.mockRejectedValue(new Error("Database unavailable"));
  mocks.failure.mockRejectedValue(new Error("Status also unavailable"));
  await expect(syncMbtaCatalog()).rejects.toThrow("Database unavailable");
});
it("does not overwrite status when a newer refresh already won", async () => {
  mocks.fetch.mockResolvedValue(mbtaFixture);
  mocks.publish.mockRejectedValue(new CatalogSyncBusyError());
  await expect(syncMbtaCatalog()).rejects.toBeInstanceOf(CatalogSyncBusyError);
  expect(mocks.failure).not.toHaveBeenCalled();
});
