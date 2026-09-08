export type EphemerisEvent = {
  name: string;
  timestamp: string; // ISO string from DB
  timeLocal: string; // "6:22 AM"
  date: string; // "2026-01-25"
  isTomorrow: boolean;
  type: "solar" | "lunar";
  dateObj: Date;
};

export type SolarWindow = {
  start: EphemerisEvent | null;
  end: EphemerisEvent | null;
};

export type SolarSnapshot = {
  sunrise: EphemerisEvent;
  sunset: EphemerisEvent;

  blueHour: {
    sunrise: SolarWindow;
    sunset: SolarWindow;
  };

  goldenHour: {
    sunrise: SolarWindow;
    sunset: SolarWindow;
  };
};

export type LunarSnapshot = {
  date: string;
  moonrise: EphemerisEvent | null;
  moonset: EphemerisEvent | null;
  illumination: number | null;
  phaseName: string;
};

export type EphemerisSnapshot = {
  solar: SolarSnapshot;
  lunar: LunarSnapshot;
  nextEvent: EphemerisEvent;
  fetchedAt: string;
};
