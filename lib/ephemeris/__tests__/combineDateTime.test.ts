// MUST be first
import { mockDb } from "@/test/__mocks__/db";

vi.mock("@/lib/db", () => ({
  db: mockDb,
}));

import { combineDateTime } from "../utils/combineDateTime";
import { date } from "zod";

describe("combineDateTime", () => {
  beforeEach(() => {
    mockDb.runtimeConfig.findUnique.mockResolvedValue(null);
  });

  it("combines date and time correctly", async () => {
    const result = await combineDateTime(
      new Date("2026-01-21"),
      "12:34:00-05:00",
    );

    expect(typeof result).toBe("string");
    expect(result).toBe("2026-01-21T12:34:00-05:00");
  });
});
