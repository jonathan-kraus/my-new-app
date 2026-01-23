// lib/ephemeris/types.ts

export type EphemerisEvent = {
  name: string;
  timestamp: string; // full ISO timestamp from DB
  timeLocal: string; // "7:16 AM"
  date: string; // "2026-01-23"
  isTomorrow: boolean;
  type: "solar" | "lunar";
};

export type SolarSnapshot = {
  sunrise: EphemerisEvent;
  sunset: EphemerisEvent;
};

export type LunarSnapshot = {
  moonrise: EphemerisEvent;
  moonset: EphemerisEvent;
  illumination: number;
};

export type EphemerisSnapshot = {
  solar: SolarSnapshot;
  lunar: LunarSnapshot;
  nextEvent: EphemerisEvent;
  fetchedAt: string;
};
