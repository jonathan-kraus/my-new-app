import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  sync: vi.fn(),
  status: vi.fn(),
  log: vi.fn(),
}));
vi.mock("@/lib/runtime/admin", () => ({
  requireRuntimeAdmin: mocks.authorize,
  RuntimeAccessError: class extends Error {
    constructor(public status: number) {
      super("Denied");
    }
  },
}));
vi.mock("@/lib/mbta/catalog", () => ({
  getMbtaSyncState: mocks.status,
  CatalogSyncBusyError: class extends Error {},
}));
vi.mock("@/lib/mbta/sync", () => ({ syncMbtaCatalog: mocks.sync }));
vi.mock("@/lib/log/logj", () => ({ logj: mocks.log }));
import { GET, POST } from "../../app/api/admin/mbta/route";
import { GET as cron } from "../../app/api/cron/mbta/route";
import { RuntimeAccessError } from "@/lib/runtime/admin";
import { CatalogSyncBusyError } from "@/lib/mbta/catalog";

beforeEach(() => {
  vi.resetAllMocks();
  mocks.authorize.mockResolvedValue(undefined);
  mocks.sync.mockResolvedValue({ stopCount: 390 });
  mocks.log.mockResolvedValue(undefined);
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});
const request = (origin = "http://localhost") =>
  new Request("http://localhost/api/admin/mbta", {
    method: "POST",
    headers: { origin },
  });

describe("administrator refresh", () => {
  it.each([401, 403] as const)(
    "rejects unauthorized refreshes with %i",
    async (status) => {
      mocks.authorize.mockRejectedValue(new RuntimeAccessError(status));
      expect((await POST(request())).status).toBe(status);
      expect(mocks.sync).not.toHaveBeenCalled();
    },
  );
  it("rejects cross-origin writes even for an administrator", async () => {
    expect((await POST(request("https://other.example"))).status).toBe(403);
    expect(mocks.sync).not.toHaveBeenCalled();
  });
  it("allows an authorized same-origin refresh", async () => {
    expect((await POST(request())).status).toBe(200);
    expect(mocks.sync).toHaveBeenCalledOnce();
  });
  it("reports concurrent refreshes as a retryable conflict", async () => {
    mocks.sync.mockRejectedValue(new CatalogSyncBusyError());
    expect((await POST(request())).status).toBe(409);
  });
  it("protects refresh status", async () => {
    mocks.authorize.mockRejectedValue(new RuntimeAccessError(401));
    expect((await GET(request())).status).toBe(401);
    expect(mocks.status).not.toHaveBeenCalled();
  });
});
describe("scheduled refresh", () => {
  it("logs only secret suffixes on rejected requests", async () => {
    vi.stubEnv("CRON_SECRET", "configured-private-abcde");
    const response = await cron(
      new Request("http://localhost/api/cron/mbta", {
        headers: { authorization: "Bearer supplied-private-vwxyz" },
      }),
    );
    expect(response.status).toBe(401);
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "MBTA",
        level: "warn",
        message: "Cron authorization rejected",
        payload: {
          secretConfigured: true,
          authorizationPresent: true,
          bearerFormatValid: true,
          configuredSecretSuffix: "abcde",
          suppliedSecretSuffix: "vwxyz",
        },
      }),
    );
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain("private");
    expect(await response.json()).toEqual({ error: "Unauthorized" });
    expect(mocks.sync).not.toHaveBeenCalled();
  });
  it("does not expose short secrets or malformed authorization headers", async () => {
    vi.stubEnv("CRON_SECRET", "tiny");
    await cron(
      new Request("http://localhost/api/cron/mbta", {
        headers: { authorization: "Basic private-header" },
      }),
    );
    expect(mocks.log).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: "MBTA",
        level: "warn",
        message: "Cron authorization rejected",
        payload: {
          secretConfigured: true,
          authorizationPresent: true,
          bearerFormatValid: false,
          configuredSecretSuffix: "[too short]",
          suppliedSecretSuffix: null,
        },
      }),
    );
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain("tiny");
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain(
      "private-header",
    );
  });
  it("fails closed if CRON_SECRET is missing", async () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(
      (await cron(new Request("http://localhost/api/cron/mbta"))).status,
    ).toBe(401);
    expect(mocks.sync).not.toHaveBeenCalled();
  });
  it("rejects an incorrect secret", async () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    expect(
      (
        await cron(
          new Request("http://localhost/api/cron/mbta", {
            headers: { authorization: "Bearer wrong" },
          }),
        )
      ).status,
    ).toBe(401);
    expect(mocks.sync).not.toHaveBeenCalled();
  });
  it("accepts the configured scheduler secret", async () => {
    vi.stubEnv("CRON_SECRET", "test-secret");
    expect(
      (
        await cron(
          new Request("http://localhost/api/cron/mbta", {
            headers: { authorization: "Bearer test-secret" },
          }),
        )
      ).status,
    ).toBe(200);
    expect(mocks.sync).toHaveBeenCalledOnce();
  });
});
