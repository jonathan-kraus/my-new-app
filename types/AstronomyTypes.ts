export interface SolarTimes {
  sunrise: Date | null;
  sunset: Date | null;
  nextSunrise: Date | null;
  nextSunset: Date | null;
  sunriseBlueStart: Date | null;
  sunriseBlueEnd: Date | null;
  sunriseGoldenStart: Date | null;
  sunriseGoldenEnd: Date | null;

  sunsetBlueStart: Date | null;
  sunsetBlueEnd: Date | null;
  sunsetGoldenStart: Date | null;
  sunsetGoldenEnd: Date | null;

  fetchedAt: Date;
}
export interface LunarTimes {
  moonrise: Date | null;
  moonset: Date | null;

  nextMoonrise: Date | null;
  nextMoonset: Date | null;

  moonPhase: number;
  fetchedAt: Date;
}

export interface AstronomyHookResult {
  today: any | null;
  tomorrow: any | null;
  solar: SolarTimes | null;
  lunar: LunarTimes | null;
}
