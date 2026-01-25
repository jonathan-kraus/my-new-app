export type LogLevel = "info" | "warn" | "error";

export interface LogPayload {
  [key: string]: any;
}

export interface LogMeta {
  requestId?: string | null;
  userId?: string | null;
  route?: string | null;
  page?: string | null;
  file?: string | null;
  line?: number | null;
}

export interface CreateLogInput {
  level: LogLevel;
  message: string;
  payload?: LogPayload;
  meta?: LogMeta;
}

export interface LogitContext {
  requestId?: string | null;
  route?: string | null;
  userId?: string | null;
}
// All valid logging domains in your system.
// Add new domains here and your entire pipeline stays consistent.
export type Domain =
  | "activity"
  | "ephemeris"
  | "github"
  | "notes"
  | "system"
  | "weather"
  | "jonathan";

// Metadata attached to every log event.
// All fields are optional and use `undefined` instead of `null`
// to prevent schema drift in Axiom.
export type Meta = {
  requestId?: string;
  route?: string;
  userId?: string;
  eventIndex?: number;
  ip?: string;
  userAgent?: string;
};

// Arbitrary payload for any log event.
// You can refine this later if you want domain‑specific payload types.
//export type LogPayload = Record<string, any>;

// The internal event shape that flows through queue → scheduler → flush.
export type InternalEvent = {
  domain: Domain;
  payload: LogPayload;
  meta: Meta;
  timestamp: number;
};
