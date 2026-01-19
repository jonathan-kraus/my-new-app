export type LogLevel = "info" | "warn" | "error";

export type EphemerisLog = Record<string, any>;
export type GithubLog = Record<string, any>;
export type WeatherLog = Record<string, any>;
export type NotesLog = Record<string, any>;

export type DomainPayload =
  | { ephemeris: EphemerisLog }
  | { github: GithubLog }
  | { weather: WeatherLog }
  | { notes: NotesLog };

export interface Meta {
  requestId?: string;
  durationMs?: number;
  route?: string;
  userId?: string;
  env: string;
  host?: string;
}

export interface LogitInput extends DomainPayload {
  level: LogLevel;
  message: string;
}

export interface InternalEvent extends DomainPayload {
  timestamp: number;
  level: LogLevel;
  message: string;
  meta: Meta;
}
