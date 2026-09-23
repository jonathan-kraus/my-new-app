import { describe, expect, it } from "vitest";
import { assertRows, firstRow, assertNonEmptyArray } from "@/lib/db/safe";

describe.each([
  ["assertRows", assertRows, "Query returned no rows"],
  ["firstRow", firstRow, "Query returned no rows"],
  ["assertNonEmptyArray", assertNonEmptyArray, "Expected non-empty array"],
] as const)("%s", (_name, helper, message) => {
  it.each([undefined, null, []])(
    "rejects missing or empty input (%s)",
    (input) => {
      expect(() => helper(input)).toThrow(new Error(message));
      expect(() => helper(input, "astronomy snapshot")).toThrow(
        new Error(`${message}: astronomy snapshot`),
      );
    },
  );
});

it("returns the original non-empty arrays without copying or changing rows", () => {
  const rows = [{ id: "first" }, { id: "second" }];
  expect(assertRows(rows)).toBe(rows);
  expect(assertNonEmptyArray(rows)).toBe(rows);
  expect(firstRow(rows)).toBe(rows[0]);
});

it("accepts falsy values as rows rather than treating them as absent", () => {
  const rows = [0, false, "", null];
  expect(assertRows(rows)).toBe(rows);
  expect(assertNonEmptyArray(rows)).toBe(rows);
  expect(firstRow(rows)).toBe(0);
});
