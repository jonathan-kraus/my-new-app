import { format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { buildEvent } from "../getEphemerisSnapshot";

const TZ = "America/New_York";

describe("buildEvent", () => {
  it("converts a timestamp into a normalized event", () => {
    const timestamp = "2026-01-23T07:16:00-05:00";

    const event = buildEvent("Sunrise", timestamp, "solar");

    const zoned = utcToZonedTime(timestamp, TZ);

    expect(event.name).toBe("Sunrise");
    expect(event.timestamp).toBe(timestamp);
    expect(event.timeLocal).toBe(format(zoned, "h:mm a"));
    expect(event.date).toBe("2026-01-23");
    expect(event.type).toBe("solar");
  });

  it("detects tomorrow correctly", () => {
    const tomorrow = "2026-01-24T07:16:00-05:00";

    const event = buildEvent("Sunrise", tomorrow, "solar");

    expect(event.isTomorrow).toBe(true);
  });
});
