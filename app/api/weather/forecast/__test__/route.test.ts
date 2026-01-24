import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

// --- Module Mocks -----------------------------------------------------

vi.mock("@/lib/db", () => ({
  db: {
    location: { findUnique: vi.fn() },
    forecastSnapshot: { findFirst: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "u1", name: "Jon", email: "jon@example.com" },
  }),
}));

vi.mock("@/lib/log/logit", () => ({ logit: vi.fn() }));
vi.mock("@/lib/log/context", () => ({
  enrichContext: vi.fn().mockResolvedValue({
    requestId: "req-123",
    page: "/api/weather/forecast",
    userId: "u1",
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// --- Imports AFTER mocks ---------------------------------------------
const { db } = await import("@/lib/db");
const { logit } = await import("@/lib/log/logit");

// --- Helpers ----------------------------------------------------------

const mockedDb = vi.mocked(db, true);
const mockedFetch = global.fetch as vi.Mock;
const mockedLog = vi.mocked(logit, true);

const makeRequest = (url: string) => new Request(url);

const mockLocation = (overrides = {}) => ({
  id: "KOP",
  latitude: 40.1,
  longitude: -75.3,
  ...overrides,
});

const mockSnapshot = (overrides = {}) => ({
  fetchedAt: new Date(),
  payload: {
    current: { temp: 30 },
    forecast: { highs: [40, 41] },
  },
  ...overrides,
});

const mockApiResponse = (overrides = {}) => ({
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
  ...overrides,
});

// --- Reset before each test ------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Tests ------------------------------------------------------------

describe("GET /api/weather/forecast", () => {
  it("returns 400 when locationId is missing", async () => {
    const res = await GET(makeRequest("http://localhost/api/weather/forecast"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing location");
  });

  it("returns 404 when location does not exist", async () => {
    mockedDb.location.findUnique.mockResolvedValue(null);

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP")
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Invalid location");
  });

  it("returns cached forecast when snapshot exists", async () => {
    mockedDb.location.findUnique.mockResolvedValue(mockLocation());
    mockedDb.forecastSnapshot.findFirst.mockResolvedValue(mockSnapshot());

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("cache");
    expect(json.current.temp).toBe(30);
    expect(json.forecast.highs).toEqual([40, 41]);
    expect(mockedLog).toHaveBeenCalled();
  });

  it("fetches external API and stores snapshot on cache miss", async () => {
    mockedDb.location.findUnique.mockResolvedValue(mockLocation());
    mockedDb.forecastSnapshot.findFirst.mockResolvedValue(null);

    mockedFetch.mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse()),
    });

    mockedDb.forecastSnapshot.create.mockResolvedValue({
      id: "snap-1",
      fetchedAt: new Date(),
    });

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP")
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("api");
    expect(json.current.temperature).toBe(32);

    expect(mockedLog).toHaveBeenCalledTimes(3);
    expect(mockedDb.forecastSnapshot.create).toHaveBeenCalled();
  });

  it("returns 502 when external API response is invalid", async () => {
    mockedDb.location.findUnique.mockResolvedValue(mockLocation());
    mockedDb.forecastSnapshot.findFirst.mockResolvedValue(null);

    mockedFetch.mockResolvedValue({
      json: () => Promise.resolve({ bad: "data" }),
    });

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP")
    );
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Forecast unavailable");

    expect(mockedLog).toHaveBeenCalledTimes(3);
  });
});
