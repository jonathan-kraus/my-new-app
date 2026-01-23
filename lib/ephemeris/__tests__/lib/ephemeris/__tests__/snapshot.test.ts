import { getEphemerisSnapshot } from "../getEphemerisSnapshot";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    ephemeris: {
      findMany: jest.fn(),
    },
  },
}));

describe("getEphemerisSnapshot", () => {
  it("builds a complete snapshot", async () => {
    prisma.ephemeris.findMany.mockResolvedValue([
      {
        date: "2026-01-23",
        location: "KOP",
        sunrise: "2026-01-23T07:16:00-05:00",
        sunset: "2026-01-23T17:16:00-05:00",
        moonrise: "2026-01-23T11:38:00-05:00",
        moonset: "2026-01-23T02:11:00-05:00",
        illumination: 1.5,
      },
    ]);

    const snapshot = await getEphemerisSnapshot("KOP");

    expect(snapshot.solar.sunrise.name).toBe("Sunrise");
    expect(snapshot.solar.sunrise.timestamp).toBe("2026-01-23T07:16:00-05:00");
    expect(snapshot.lunar.illumination).toBe(1.5);
    expect(snapshot.nextEvent).toBeDefined();
  });
});
