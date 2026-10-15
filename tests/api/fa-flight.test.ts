import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn(async () => "AAL3166"),
}));
import { GET } from "../../app/api/fa/flight/route";

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
