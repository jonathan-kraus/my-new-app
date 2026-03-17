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

export type Ctx = {
  requestId: string;
  eventIndex: number;

  route: string;
  page: string; // temporary compatibility field

  method: string;
  url: string;

  ip?: string;
  userAgent?: string;

  sessionEmail?: string;
  userId?: string;

  version: string;

  zulu: string;  // ISO timestamp
  local: string; // localized timestamp

  deploymentId: string;
  buildTimestamp: string;
  gitCommit: string;
  gitBranch: string;

  runtime: {
    node: string;
    region: string;
  };
};

import { z } from "zod";

export const CtxSchema = z.object({
  requestId: z.string(),
  eventIndex: z.number(),

  route: z.string(),
  page: z.string(),

  method: z.string(),
  url: z.string(),

  ip: z.string().optional(),
  userAgent: z.string().optional(),

  sessionEmail: z.string().optional(),
  userId: z.string().optional(),

  version: z.string(),

  zulu: z.string(),  // ISO timestamp
  local: z.string(), // localized timestamp

  deploymentId: z.string(),
  buildTimestamp: z.string(),
  gitCommit: z.string(),
  gitBranch: z.string(),

  runtime: z.object({
    node: z.string(),
    region: z.string(),
  }),
});

export type CtxSchema = z.infer<typeof CtxSchema>;
