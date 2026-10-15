import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn(async () => "AAL3166"),
}));
import { GET } from "../../app/api/fa/flight/route";
import { getConfig } from "@/lib/runtime/config";

const fetchMock = vi.fn();
const position = {
  timestamp: "2026-10-15T11:59:00Z",
  altitude: 28,
  groundspeed: 188,
};
const airborne = {
  ident: "AAL3166",
  fa_flight_id: "active",
  status: "Enroute",
  actual_off: "2026-10-15T10:00:00Z",
  last_position: position,
};
const future = {
  ident: "AAL3166",
  fa_flight_id: "future",
  status: "Scheduled",
  scheduled_out: "2026-10-18T04:31:00Z",
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-15T12:00:00Z"));
  fetchMock.mockReset();
  vi.mocked(getConfig).mockResolvedValue("AAL3166");
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
function request(query = "") {
  return {
    nextUrl: new URL(`http://localhost/api/fa/flight${query}`),
  } as NextRequest;
}
it("rejects an invalid exact flight ID without calling FlightAware", async () => {
  expect((await GET(request("?flightId=bad%2Fid"))).status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});
it.each([
  ["upstream failure", "unavailable", 503, 502],
  ["invalid JSON", "not json", 200, 502],
  ["empty results", '{"flights":[]}', 200, 404],
  ["missing results", "{}", 200, 404],
])(
  "handles %s without attempting a track lookup",
  async (_label, body, status, expected) => {
    fetchMock.mockResolvedValueOnce(new Response(body, { status }));
    expect((await GET(request())).status).toBe(expected);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  },
);
it("normalizes AA flight numbers and does not present a scheduled flight as live", async () => {
  vi.mocked(getConfig).mockResolvedValue("aa3166");
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ flights: [future] })),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ positions: [] })),
  );
  const response = await GET(request());
  expect(fetchMock.mock.calls[0]?.[0]).toMatch(/\/flights\/AAL3166$/);
  expect(await response.json()).toMatchObject({
    status: "Scheduled",
    live_altitude: null,
    phase: "unknown",
  });
});
it("retains the last position when fetching the track throws", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ flights: [airborne] })),
  );
  fetchMock.mockRejectedValueOnce(new Error("Network unavailable"));
  expect(await (await GET(request())).json()).toMatchObject({
    fa_flight_id: "active",
    live_altitude: 2800,
  });
});
it("does not label stale telemetry as live", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        flights: [
          {
            ...airborne,
            last_position: { ...position, timestamp: "2026-10-15T10:00:00Z" },
          },
        ],
      }),
    ),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ positions: null })),
  );
  expect(await (await GET(request())).json()).toMatchObject({
    live_altitude: null,
    live_timestamp: null,
    phase: "unknown",
  });
});
it("uses the active occurrence and its latest track instead of the first future result", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ flights: [future, airborne] })),
  );
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({
        positions: [
          position,
          { ...position, timestamp: "2026-10-15T11:58:00Z" },
        ],
      }),
    ),
  );
  const response = await GET(request());
  expect(await response.json()).toMatchObject({
    fa_flight_id: "active",
    status: "Enroute",
    live_altitude: 2800,
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1]?.[0]).toContain("/active/track");
});
it("loads the exact Skybox occurrence and retains last position when track fails", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ flights: [future, airborne] })),
  );
  fetchMock.mockResolvedValueOnce(new Response("unavailable", { status: 503 }));
  const response = await GET(request("?flightId=active"));
  expect(fetchMock.mock.calls[0]?.[0]).toMatch(/\/flights\/active$/);
  expect(await response.json()).toMatchObject({
    fa_flight_id: "active",
    ident: "AAL3166",
    live_altitude: 2800,
  });
});
it("does not silently substitute another occurrence when an exact ID is missing", async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ flights: [future] })),
  );
  expect((await GET(request("?flightId=active"))).status).toBe(404);
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
