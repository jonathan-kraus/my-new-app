import { z } from "zod";

export const CurrentWeatherSchema = z.object({
  temperature: z.number(),
  windspeed: z.number(),
});

export const DailyForecastSchema = z.object({
  time: z.array(z.string()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  weathercode: z.array(z.number()),
});

export const ForecastResponseSchema = z.object({
  current_weather: CurrentWeatherSchema,
  daily: DailyForecastSchema,
});
