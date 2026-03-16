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

	it("returns latest flight and weather rows", async () => {
		vi.mocked(queryAxiom).mockResolvedValueOnce([
			{ id: "f1", reason: "Flight", message: "flight" },
		]);
		vi.mocked(queryAxiom).mockResolvedValueOnce([
			{ id: "w1", reason: "Weather", message: "weather" },
		]);
		vi.mocked(queryAxiom).mockResolvedValueOnce([{ count: 2, last_time: "2026-03-16T00:00:00Z" }]);

		const res = await GET();
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.flight).toEqual({ id: "f1", reason: "Flight", message: "flight" });
		expect(json.weather).toEqual({ id: "w1", reason: "Weather", message: "weather" });
		expect(json.stats).toEqual({ count: 2, lastTime: "2026-03-16T00:00:00Z" });
		expect(queryAxiom).toHaveBeenCalledTimes(3);
		expect(res.status).toBe(200);
		const json = await res.json();
		expect(json.flight).toBeNull();
		expect(json.weather).toBeNull();
	});

	it("returns 500 on query failure", async () => {
		vi.mocked(queryAxiom).mockRejectedValueOnce(new Error("fail"));

		const res = await GET();
		expect(res.status).toBe(500);
		const json = await res.json();
		expect(json.error).toContain("fail");
	});
});
