import { z } from "zod";

export const CurrentWeatherSchema = z.object({
  temperature: z.number(),
  windspeed: z.number(),
  relative_humidity_2m: z.number().optional(),
});

export const DailyForecastSchema = z.object({
  time: z.array(z.string()),
  temperature_2m_max: z.array(z.number()),
  temperature_2m_min: z.array(z.number()),
  weathercode: z.array(z.number()),
});

export const ForecastResponseSchema = z.object({
  current: CurrentWeatherSchema,
  daily: DailyForecastSchema,
});

export const InternalForecastResponseSchema = z.object({
  location: z.any(), // or a LocationSchema if you have one
  current: CurrentWeatherSchema,
  forecast: DailyForecastSchema,
  fetchedAt: z.string(),
  source: z.string(),
});

export type ForecastResponse = z.infer<typeof InternalForecastResponseSchema>;
