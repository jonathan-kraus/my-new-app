import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import type { Mock } from "vitest";

// ---------------------------------------------------------------------------
// MODULE MOCKS
// ---------------------------------------------------------------------------

vi.mock("@/lib/db.prisma8", () => ({
  db8: {
    orm: {
      public: {
        Location: {
          where: vi.fn(),
        },
        ForecastSnapshot: {
          where: vi.fn(),
          create: vi.fn(),
        },
      },
    },
  },
}));

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id: "u1", name: "Jonathan", email: "jonathan@kraus.my.id" },
  }),
}));
vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockResolvedValue("10"),
}));
vi.mock("@/lib/log/logj", () => ({
  logj: vi.fn(),
}));

vi.mock("@/lib/log/context", () => ({
  enrichContext: vi.fn().mockResolvedValue({
    requestId: "req-123",
    page: "/api/weather/forecast",
    userId: "u1",
  }),
}));

vi.mock("@/lib/astronomy/getAstronomySnapshot", () => ({
  getAstronomySnapshot: vi.fn().mockResolvedValue({
    today: {
      sunrise: "06:30",
      sunset: "20:30",
      moonrise: "10:00",
      moonset: "23:00",
      phaseName: "Full Moon",
    },
    tomorrow: null,
  }),
}));

// Mock fetch globally
global.fetch = vi.fn();

// ---------------------------------------------------------------------------
// IMPORTS AFTER MOCKS
// ---------------------------------------------------------------------------

const { db8 } = await import("@/lib/db.prisma8");
const { logj } = await import("@/lib/log/logj");

// ---------------------------------------------------------------------------
// TYPED MOCK HELPERS
// ---------------------------------------------------------------------------

const mockedFetch = global.fetch as Mock;
const mockedLog = vi.mocked(logj, true);

// ---------------------------------------------------------------------------
// FACTORY HELPERS
// ---------------------------------------------------------------------------

const makeLocation = (overrides = {}) => ({
  id: "KOP",
  name: "King of Prussia",
  createdAt: new Date(),
  updatedAt: new Date(),
  key: "KOP",
  timezone: "America/New_York",
  isDefault: false,
  latitude: 40.1,
  longitude: -75.3,
  ...overrides,
});

const makeSnapshot = (overrides = {}) => ({
  id: "snap-1",
  locationId: "KOP",
  fetchedAt: new Date(),
  payload: {
    current: {
      temperature: 30,
      windspeed: 5,
      humidity: 60,
    },
    forecast: {
      time: ["2026-01-24"],
      temperature_2m_max: [40],
      temperature_2m_min: [20],
      weathercode: [1],
    },
  },
  ...overrides,
});

const mockApiResponse = (overrides = {}) => ({
  current: {
    temperature: 32,
    wind_speed_10m: 5,
    relative_humidity_2m: 65,
  },
  daily: {
    time: ["2026-01-24"],
    temperature_2m_max: [40],
    temperature_2m_min: [20],
    weathercode: [1],
  },
  ...overrides,
});

const makeRequest = (url: string) => new Request(url);

// ---------------------------------------------------------------------------
// PRISMA 8 MOCK CHAIN HELPERS
// ---------------------------------------------------------------------------

const mockLocationLookup = (
  location: ReturnType<typeof makeLocation> | null,
) => {
  const first = vi.fn().mockResolvedValue(location);

  vi.mocked(db8.orm.public.Location.where).mockReturnValue({
    first,
  } as unknown as ReturnType<typeof db8.orm.public.Location.where>);

  return first;
};

const mockForecastLookup = (
  snapshot: ReturnType<typeof makeSnapshot> | null,
) => {
  const first = vi.fn().mockResolvedValue(snapshot);

  const orderBy = vi.fn().mockReturnValue({
    first,
  });

  const secondWhere = vi.fn().mockReturnValue({
    orderBy,
  });

  vi.mocked(db8.orm.public.ForecastSnapshot.where).mockReturnValue({
    where: secondWhere,
  } as unknown as ReturnType<typeof db8.orm.public.ForecastSnapshot.where>);

  return {
    first,
    orderBy,
    secondWhere,
  };
};

// ---------------------------------------------------------------------------
// RESET BEFORE EACH TEST
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(db8.orm.public.Location.where).mockReset();
  vi.mocked(db8.orm.public.ForecastSnapshot.where).mockReset();
  vi.mocked(db8.orm.public.ForecastSnapshot.create).mockReset();
});

// ---------------------------------------------------------------------------
// TESTS
// ---------------------------------------------------------------------------

describe("GET /api/weather/forecast", () => {
  it("returns 400 when locationId is missing", async () => {
    const res = await GET(makeRequest("http://localhost/api/weather/forecast"));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBe("Missing location");
  });

  it("returns 404 when location does not exist", async () => {
    mockLocationLookup(null);

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP"),
    );
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBe("Invalid location");
  });

  it("returns cached forecast when snapshot exists", async () => {
    mockLocationLookup(makeLocation());
    mockForecastLookup(makeSnapshot());

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("cache");
    expect(json.current.temperature).toBe(30);
    expect(json.forecast.temperature_2m_max).toEqual([40]);
    expect(json.astronomy).toBeDefined();
    expect(mockedLog).toHaveBeenCalled();
  });

  it("fetches external API and stores snapshot on cache miss", async () => {
    mockLocationLookup(makeLocation());
    mockForecastLookup(null);

    mockedFetch.mockResolvedValue({
      json: () => Promise.resolve(mockApiResponse()),
    } as Response);

    vi.mocked(db8.orm.public.ForecastSnapshot.create).mockResolvedValue(
      makeSnapshot({ id: "snap-1" }) as unknown as Awaited<
        ReturnType<typeof db8.orm.public.ForecastSnapshot.create>
      >,
    );

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP"),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.source).toBe("api");
    expect(json.current.temperature).toBe(32);

    expect(mockedLog).toHaveBeenCalledTimes(5);
    expect(db8.orm.public.ForecastSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        locationId: "KOP",
        payload: expect.objectContaining({
          current: expect.objectContaining({
            temperature: 32,
            windspeed: 5,
            humidity: 65,
          }),
        }),
      }),
    );
  });

  it("returns 502 when external API response is invalid", async () => {
    mockLocationLookup(makeLocation());
    mockForecastLookup(null);

    mockedFetch.mockResolvedValue({
      json: () => Promise.resolve({ bad: "data" }),
    } as Response);

    const res = await GET(
      makeRequest("http://localhost/api/weather/forecast?locationId=KOP"),
    );
    const json = await res.json();

    expect(res.status).toBe(502);
    expect(json.error).toBe("Forecast unavailable");

    expect(mockedLog).toHaveBeenCalledTimes(4);
  });
});
