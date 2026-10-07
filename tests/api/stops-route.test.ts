import { afterEach, expect, it, vi } from "vitest";
import { GET } from "../../app/api/stops/[stop]/route";

vi.unmock("next/server");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("awaits dynamic stop params before requesting stop details", async () => {
  const data = { data: { id: "place-sstat", type: "stop" } };
  const fetchMock = vi.fn().mockResolvedValue(Response.json(data));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("MBTA_KEY", "test-key");

  const response = await GET(
    new Request("http://localhost/api/stops/place-sstat"),
    { params: Promise.resolve({ stop: "place-sstat" }) },
  );

  expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
    "https://api-v3.mbta.com/stops/place-sstat?api_key=test-key",
  );
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual(data);
});
