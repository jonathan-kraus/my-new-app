/*
 * @FilePath: \my-new-app\lib\schemas\page-schemas.ts
 * @LastEditTime: 2026-03-18 14:32:10
 */
// lib/schemas/page-schemas.ts
import { z } from "zod";

/** Session (partial) */
export const SessionUserSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  email: z.string().nullable(),
});
export const SessionSchema = z.object({
  user: SessionUserSchema.nullable().optional(),
});
export type Session = z.infer<typeof SessionSchema>;
export type SessionUser = z.infer<typeof SessionUserSchema>;

/** Location */
export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().optional(),
});
export type Location = z.infer<typeof LocationSchema>;

/** Weather data (adjust fields to match your API) */
export const WeatherConditionSchema = z.object({
  id: z.number().optional(),
  main: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const WeatherPointSchema = z.object({
  timestamp: z.string().optional(),
  temp: z.number().optional(),
  feels_like: z.number().optional(),
  humidity: z.number().optional(),
  wind_speed: z.number().optional(),
  condition: WeatherConditionSchema.optional(),
});

export const WeatherSchema = z.object({
  locationId: z.string().optional(),
  current: WeatherPointSchema.optional(),
  hourly: z.array(WeatherPointSchema).optional(),
  daily: z.array(WeatherPointSchema).optional(),
  raw: z.unknown().optional(),
});
export type Weather = z.infer<typeof WeatherSchema>;

/** Minimal request/context used for logging and enrichContext */
export const RequestContextSchema = z.object({
  requestId: z.string(),
  page: z.string(),
  userId: z.string().nullable().optional(),
});
export type RequestContext = z.infer<typeof RequestContextSchema>;
