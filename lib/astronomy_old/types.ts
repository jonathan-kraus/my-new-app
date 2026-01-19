// lib/astronomy/types.ts

//
// Core snapshot type — matches your Prisma model exactly.
// This is the shape returned from the database.
//

export type AstronomySnapshot = {
  id: string;
  locationId: string;

  // Solar
  sunrise: string;
  sunset: string;

  // Lunar
  moonrise: string;
  moonset: string;

  // Golden / Blue Hour
  sunriseBlueStart: string;
  sunriseBlueEnd: string;
  sunriseGoldenStart: string;
  sunriseGoldenEnd: string;
  sunsetGoldenStart: string;
  sunsetGoldenEnd: string;
  sunsetBlueStart: string;
  sunsetBlueEnd: string;

  // Metadata
  fetchedAt: Date;
  createdAt: Date;
};

//
// Shared timeline period type
//

export type TimePeriod = {
  label: string;
  start: Date;
  end: Date;
};

//
// Solar timeline return type
//

export type SolarTimeline = {
  now: Date;
  sunrise: Date;
  sunset: Date;
  dayLengthHours: number;
  isDaytime: boolean;
  nextEventLabel: string;
  countdown: string;
  progressPercent: number;
};

//
// Lunar timeline return type
//

export type LunarTimeline = {
  now: Date;
  moonrise: Date;
  moonset: Date;
  visibilityHours: number;
  isVisible: boolean;
  nextEventLabel: string;
  countdown: string;
  progressPercent: number;
};

//
// Golden hour timeline return type
//

export type GoldenHourTimeline = {
  now: Date;
  active: TimePeriod | null;
  next: TimePeriod | null;
  nextEventLabel: string;
  countdown: string;
  progressPercent: number;
  timeline: TimePeriod[];
};
