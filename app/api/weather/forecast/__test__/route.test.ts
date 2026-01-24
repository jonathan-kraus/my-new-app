import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextResponse } from "next/server";

// --- Mocks -------------------------------------------------------------

vi.mock("@/lib/db", () => ({
  db: {
    location: {
      findUnique: vi.fn(),
    },
    forecastSnapshot: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "u1", name: "Jon", email: "jon@example.com" },
  }),
}));

vi.mock("@/lib/log/logit", () => ({
  logit: vi.fn(),
}));

vi.mock("@/lib/log/context", () => ({
  enrichContext: vi.fn().mockResolvedValue({
    requestId: "req-123",
    page: "/api/weather/forecast",
    userId: "u1",
  }),
}));

// Mock fetch for Open-Meteo
global.fetch = vi.fn();

// ----------------------------------------------------------------------

const { db } = await import("@/lib/db");
const { logit } = await import("@/lib/log/logit");

function makeRequest(url: string) {
  return new Request(url);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/weather/forecast", () => {
  // ------------------------------------------------------------------
  // 1. Missing locationId
  // ------------------------------------------------------------------
  it("returns 400 when locationId is missing", async () => {
    const req = makeRequest("http://localhost/api/weather/forecast");
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing location");
  });

  // ------------------------------------------------------------------
  // 2. Invalid location
  // ------------------------------------------------------------------
  it("returns 404 when location does not exist", async () => {
    db.location.findUnique.mockResolvedValue(null);

    const req = makeRequest(
      "http://localhost/api/weather/forecast?locationId=KOP",
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Invalid location");
  });

  // ------------------------------------------------------------------
  // 3. Cache HIT
  // ------------------------------------------------------------------
  it("returns cached forecast when snapshot exists", async () => {
    db.location.findUnique.mockResolvedValue({
      id: "KOP",
      latitude: 40.1,
      longitude: -75.3,
    });

    db.forecastSnapshot.findFirst.mockResolvedValue({
      fetchedAt: new Date(),
      payload: {
        current: { temp: 30 },
        forecast: { highs: [40, 41] },
      },
    });

    const req = makeRequest(
      "http://localhost/api/weather/forecast?locationId=KOP",
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("cache");
    expect(json.current.temp).toBe(30);
    expect(json.forecast.highs).toEqual([40, 41]);

    // logit should have been called for cache hit
    expect(logit).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // 4. Cache MISS → Fetch external API
  // ------------------------------------------------------------------
  it("fetches external API and stores snapshot on cache miss", async () => {
    db.location.findUnique.mockResolvedValue({
      id: "KOP",
      latitude: 40.1,
      longitude: -75.3,
    });

    db.forecastSnapshot.findFirst.mockResolvedValue(null);

    // Mock Open-Meteo API response
    global.fetch.mockResolvedValue({
      json: () =>
        Promise.resolve({
          current_weather: {
            temperature: 32,
            weathercode: 1,
            windspeed: 5,
            winddirection: 180,
            time: "2026-01-24T00:00",
          },
          daily: {
            time: ["2026-01-24"],
            temperature_2m_max: [40],
            temperature_2m_min: [20],
            weathercode: [1],
          },
        }),
    });

    db.forecastSnapshot.create.mockResolvedValue({
      id: "snap-1",
      fetchedAt: new Date(),
    });

    const req = makeRequest(
      "http://localhost/api/weather/forecast?locationId=KOP",
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("api");
    expect(json.current.temperature).toBe(32);

    // Should log cache miss + API response + snapshot stored
    expect(logit).toHaveBeenCalledTimes(3);

    // Should store snapshot
    expect(db.forecastSnapshot.create).toHaveBeenCalled();
  });

  // ------------------------------------------------------------------
  // 5. Invalid API response (Zod fail)
  // ------------------------------------------------------------------
  it("returns 502 when external API response is invalid", async () => {
    db.location.findUnique.mockResolvedValue({
      id: "KOP",
      latitude: 40.1,
      longitude: -75.3,
    });

    db.forecastSnapshot.findFirst.mockResolvedValue(null);

    // Invalid response → missing fields
    global.fetch.mockResolvedValue({
      json: () => Promise.resolve({ bad: "data" }),
    });

    const req = makeRequest(
      "http://localhost/api/weather/forecast?locationId=KOP",
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Forecast unavailable");

    // Should log API response + error
    expect(logit).toHaveBeenCalledTimes(3);
  });
});
