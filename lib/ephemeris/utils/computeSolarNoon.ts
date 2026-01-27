// lib\ephemeris\utils\computeSolarNoon.ts
import { useLogger } from "next-axiom";
export function computeSolarNoon(sunrise: Date, sunset: Date): Date {
  const log = useLogger({ source: "lib\ephemeris\utils\computeSolarNoon.ts" });
  log.info("Unhandled error", {
    message: "computeSolarNoon",
    sunrise: sunrise,
    sunset: sunset,
  });
  return new Date(
    sunrise.getTime() + (sunset.getTime() - sunrise.getTime()) / 2,
  );
}
