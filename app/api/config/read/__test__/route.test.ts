import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/axiom/query", () => ({
  queryAxiom: vi.fn(),
}));

const { queryAxiom } = await import("@/lib/axiom/query");

describe("GET /api/config/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns latest flight and weather rows with new stats shape", async () => {
    // First call → Flight rows
    vi.mocked(queryAxiom).mockResolvedValueOnce([
      { id: "f1", reason: "Flight", message: "flight", _time: "2026-03-16T00:00:00Z" } as any,
    ]);

    // Second call → Weather rows
    vi.mocked(queryAxiom).mockResolvedValueOnce([
      { id: "w1", reason: "Weather", message: "weather", _time: "2026-03-16T00:00:00Z" } as any,
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();

    expect(json.flight).toEqual({
      id: "f1",
      reason: "Flight",
      message: "flight",
      _time: "2026-03-16T00:00:00Z",
    });

    expect(json.weather).toEqual({
      id: "w1",
      reason: "Weather",
      message: "weather",
      _time: "2026-03-16T00:00:00Z",
    });

    // New stats shape
    expect(json.stats).toEqual({
      total: 2,
      flights: 1,
      weather: 1,
      lastUpdated: "2026-03-16T00:00:00Z",
    });

    // Only 2 calls now (Flight + Weather)
    expect(queryAxiom).toHaveBeenCalledTimes(2);
  });

  it("returns 500 on query failure", async () => {
    vi.mocked(queryAxiom).mockRejectedValueOnce(new Error("fail"));

    const res = await GET();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toContain("fail");
  });
});
