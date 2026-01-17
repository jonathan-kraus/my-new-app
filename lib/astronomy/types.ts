export interface SolarDay {
  sunrise: string | null
  sunset: string | null
  nextSunrise: string | null
}

export interface LunarDay {
  moonrise: string | null
  moonset: string | null
  nextMoonrise: string | null
}
