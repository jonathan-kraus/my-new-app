vi.mock("@/lib/db", () => ({
	db: {
		ephemerisDebug: {
			create: vi.fn(),
		},
	},
}));

/*
 * @FilePath: \my-new-app\lib\ephemeris\__tests__\writeEphemerisDebugEvent.test.ts
 * @LastEditTime: 2026-03-04 21:26:07
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "@/lib/db";
import {
	writeEphemerisDebugEvent,
	// If these are not exported, move them to a utils file or export for testing
} from "@/lib/ephemeris/writeEphemerisDebugEvent";

// Re-import private helpers if you export them for testing
import * as mod from "@/lib/ephemeris/writeEphemerisDebugEvent";

describe("writeEphemerisDebugEvent", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	// -----------------------------
	// toIsoString tests
	// -----------------------------
	it("toIsoString returns ISO string for valid input", () => {
		const result = (mod as any).toIsoString("2024-01-01T12:00:00Z");
		expect(result).toBe("2024-01-01T12:00:00.000Z");
	});

	it("toIsoString returns null for invalid input", () => {
		const result = (mod as any).toIsoString("not-a-date");
		expect(result).toBeNull();
	});

	// -----------------------------
	// toJsonSafe tests
	// -----------------------------
	it("toJsonSafe deep clones JSON-safe values", () => {
		const input = { a: 1, b: "x" };
		const result = (mod as any).toJsonSafe(input);

		expect(result).toEqual(input);
		expect(result).not.toBe(input); // ensure clone
	});

	it("toJsonSafe falls back to String(value) when JSON serialization fails", () => {
		const circular: any = {};
		circular.self = circular;

		const result = (mod as any).toJsonSafe(circular);
		expect(result).toBe("[object Object]");
	});

	// -----------------------------
	// writeEphemerisDebugEvent tests
	// -----------------------------
	it("writes a debug event with safe values", async () => {
		const create = vi.spyOn(db.ephemerisDebug, "create");
		mockResolvedValue({
			id: "ok",
			raw: {},
			createdAt: null,
			date: null,
			locationId: null,
			fetchedAt: null,
			sunrise: null,
			sunset: null,
			moonrise: null,
			moonset: null,
			moonPhase: null,
			sunriseBlueStart: null,
			sunriseBlueEnd: null,
			sunriseGoldenStart: null,
			sunriseGoldenEnd: null,
			sunsetGoldenStart: null,
			sunsetGoldenEnd: null,
			sunsetBlueStart: null,
			sunsetBlueEnd: null,
			receivedAt: new Date(),
		});

		await writeEphemerisDebugEvent({
			locationId: "123",
			fetchedAt: "2024-01-01T00:00:00Z",
			createdAt: "2024-01-01T00:00:00Z",
			date: "2024-01-01",
			sunrise: "06:00",
			sunset: "18:00",
			moonrise: null,
			moonset: null,
			moonPhase: 0.5,
			sunriseBlueStart: null,
			sunriseBlueEnd: null,
			sunriseGoldenStart: null,
			sunriseGoldenEnd: null,
			sunsetGoldenStart: null,
			sunsetGoldenEnd: null,
			sunsetBlueStart: null,
			sunsetBlueEnd: null,
			raw: { test: true },
		});

		expect(create).toHaveBeenCalledTimes(1);
		const call = create.mock.calls[0][0].data;

		expect(call.locationId).toBe("123");
		expect(call.fetchedAt).toBe("2024-01-01T00:00:00.000Z");
		expect(call.raw).toEqual({ test: true });
	});

	it("logs an error when db write fails", async () => {
		const create = vi.spyOn(db.ephemerisDebug, "create").mockRejectedValue(new Error("fail"));

		const error = vi.spyOn(console, "error").mockImplementation(() => {});

		await writeEphemerisDebugEvent({
			locationId: null,
			fetchedAt: null,
			createdAt: null,
			date: null,
			sunrise: null,
			sunset: null,
			moonrise: null,
			moonset: null,
			moonPhase: null,
			sunriseBlueStart: null,
			sunriseBlueEnd: null,
			sunriseGoldenStart: null,
			sunriseGoldenEnd: null,
			sunsetGoldenStart: null,
			sunsetGoldenEnd: null,
			sunsetBlueStart: null,
			sunsetBlueEnd: null,
			raw: "x",
		});

		expect(error).toHaveBeenCalled();
		expect(create).toHaveBeenCalled();
	});
});
