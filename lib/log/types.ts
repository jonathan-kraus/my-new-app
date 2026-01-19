// All valid logging domains in your system.
// Add new domains here and your entire pipeline stays consistent.
export type Domain =
  | "weather"
  | "github"
  | "ephemeris"
  | "system"
  | "notes"
  | "activity"
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
export type LogPayload = Record<string, any>;

// The internal event shape that flows through queue → scheduler → flush.
export type InternalEvent = {
  domain: Domain;
  payload: LogPayload;
  meta: Meta;
  timestamp: number;
};
