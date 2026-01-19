// lib/log/types.ts

export type GithubPayload = { [key: string]: any };
export type NotesPayload = { [key: string]: any };
export type WeatherPayload = { [key: string]: any };
export type EphemerisPayload = { [key: string]: any };

// NEW
export type JonathanPayload = { [key: string]: any };

export type DomainPayload =
  | { github: GithubPayload }
  | { notes: NotesPayload }
  | { weather: WeatherPayload }
  | { ephemeris: EphemerisPayload }
  | { jonathan: JonathanPayload }; // NEW

export interface LogMeta {
  requestId: string | null;
  route: string | null;
  userId: string | null;
}

export type LogitInput = DomainPayload & {
  level: "info" | "error" | "warn";
  message: string;
  meta: LogMeta;
};

export interface InternalEvent {
  timestamp: number;
  level: "info" | "error" | "warn";
  message: string;
  domain: string;
  payload: Record<string, any>;
  meta: LogMeta;
}
