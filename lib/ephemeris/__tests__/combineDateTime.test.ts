import { combineDateTime } from "@/lib/ephemeris/utils/combineDateTime";

describe("combineDateTime", () => {
  const base = new Date("2026-01-31T00:00:00-05:00");

  test("preserves offset", () => {
    const result = combineDateTime(base, "07:09:00-05:00");
    expect(result).toBe("2026-01-31T07:09:00-05:00");
  });

  test("throws on UTC timestamps", () => {
    expect(() => combineDateTime(base, "07:09:00Z")).toThrow("UTC timestamp");
  });

  test("throws on missing offset", () => {
    expect(() => combineDateTime(base, "07:09:00")).toThrow(
      "expected a time string with offset",
    );
  });

  test("handles seconds correctly", () => {
    const result = combineDateTime(base, "12:34:56-05:00");
    expect(result).toBe("2026-01-31T12:34:56-05:00");
  });

  test("handles midnight", () => {
    const result = combineDateTime(base, "00:00:00-05:00");
    expect(result).toBe("2026-01-31T00:00:00-05:00");
  });
});
