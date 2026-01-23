import { pickNextEvent } from "../getEphemerisSnapshot";

describe("pickNextEvent", () => {
  it("selects the earliest future event", () => {
    const now = new Date("2026-01-23T06:00:00-05:00").getTime();

    const events = [
      { name: "Sunset", timestamp: "2026-01-23T17:16:00-05:00" },
      { name: "Sunrise", timestamp: "2026-01-23T07:16:00-05:00" },
      { name: "Moonrise", timestamp: "2026-01-23T11:38:00-05:00" },
    ];

    const next = pickNextEvent(events, now);

    expect(next.name).toBe("Sunrise");
  });

  it("skips past events", () => {
    const now = new Date("2026-01-23T12:00:00-05:00").getTime();

    const events = [
      { name: "Sunrise", timestamp: "2026-01-23T07:16:00-05:00" }, // past
      { name: "Sunset", timestamp: "2026-01-23T17:16:00-05:00" }, // future
    ];

    const next = pickNextEvent(events, now);

    expect(next.name).toBe("Sunset");
  });
});
