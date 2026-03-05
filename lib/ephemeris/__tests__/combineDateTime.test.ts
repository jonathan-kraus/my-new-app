vi.mock("@/lib/runtime/config", () => ({
  getConfig: vi.fn().mockResolvedValue("0"),
}));

import { describe, it, expect } from "vitest";
import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";

describe("combineDateTime", () => {
  it("combines date and time with offset correctly", () => {
    const date = new Date(2026, 0, 21); // local midnight, avoids UTC shift
    const result = combineDateTime(date, "12:34:00-05:00");

    expect(result).toBe("2026-01-21T12:34:00-05:00");
  });

  it("rejects UTC timestamps", () => {
    const date = new Date(2026, 0, 21);


    expect(() => combineDateTime(date, "12:34:00Z")).toThrow(
      /received a UTC timestamp/i
    );
  });

  it("rejects time strings without an offset", () => {
    const date = new Date(2026, 0, 21);

    expect(() => combineDateTime(date, "12:34:00")).toThrow(
      /expected a time string with offset/i
    );
  });

  it("extracts the time part correctly when seconds are present", () => {
    const date = new Date(2026, 0, 21);
    const result = combineDateTime(date, "07:09:30-05:00");

    expect(result).toBe("2026-01-21T07:09:30-05:00");
  });

  it("extracts the time part correctly when seconds are omitted", () => {
    const date = new Date(2026, 0, 21);
    const result = combineDateTime(date, "18:22-05:00");

    expect(result).toBe("2026-01-21T18:22-05:00");
  });

  it("preserves the original offset exactly", () => {
    const date = new Date(2026, 0, 21);
    const result = combineDateTime(date, "05:15:00+02:30");

    expect(result).toBe("2026-01-21T05:15:00+02:30");
  });
});
