/*
 * @FilePath: \my-new-app\lib\server\email\sendForecastEmail.ts
 * @LastEditTime: 2026-09-06 21:44:09
 */
// lib/server/email/sendForecastEmail.ts
"use server";

import { Resend } from "resend";
import { renderForecastEmail } from "./renderForecastEmail";
import { z } from "zod";
import { getConfig, setConfig } from "@/lib/runtime/config";
import { getThrottleStatus } from "./throttle-utils";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

const MESSAGE_PREFIX = "SendForecastEmail -- ";

const forecastEmailSchema = z.object({
  locationName: z.string().trim().min(1).max(120),

  temperature: z.coerce.number().finite(),
  feelsLike: z.coerce.number().finite(),
  humidity: z.coerce.number().finite().min(0).max(100),
  windSpeed: z.coerce.number().finite().min(0),

  fetchedAt: z.string().trim().min(1).max(100),
  source: z.string().trim().min(1).max(100),

  sunrise: z.string().max(100).optional(),
  sunset: z.string().max(100).optional(),
  moonrise: z.string().max(100).optional(),
  moonset: z.string().max(100).optional(),
  moonPhaseName: z.string().max(100).optional(),
  moonPhaseEmoji: z.string().max(20).optional(),
});

export type ForecastEmailData = z.infer<typeof forecastEmailSchema>;

function readFormValue(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatTemperature(value: number) {
  return `${Math.round(value)}°F`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatWind(value: number) {
  return `${Math.round(value)} mph`;
}

function formatTime(value?: string) {
  return value?.trim() || "—";
}

export async function sendForecastEmail(form: FormData) {
  const built = staticUniversalContext("FORECAST_EMAIL");
  let eventIndex = 0;

  const parsed = forecastEmailSchema.safeParse({
    locationName: readFormValue(form, "locationName"),
    temperature: readFormValue(form, "temperature"),
    feelsLike: readFormValue(form, "feelsLike"),
    humidity: readFormValue(form, "humidity"),
    windSpeed: readFormValue(form, "windSpeed"),
    fetchedAt: readFormValue(form, "fetchedAt"),
    source: readFormValue(form, "source"),
    sunrise: readFormValue(form, "sunrise"),
    sunset: readFormValue(form, "sunset"),
    moonrise: readFormValue(form, "moonrise"),
    moonset: readFormValue(form, "moonset"),
    moonPhaseName: readFormValue(form, "moonPhaseName"),
    moonPhaseEmoji: readFormValue(form, "moonPhaseEmoji"),
  });

  if (!parsed.success) {
    await logj({
      domain: "weather",
      level: "warn",
      message: MESSAGE_PREFIX + "Invalid email data",
      file: "lib/server/email/sendForecastEmail.ts",
      line: 215,
      payload: {
        issues: parsed.error.issues,
      },
      meta: {
        built: {
          ...built,
          eventIndex: ++eventIndex,
        },
      },
    });

    return {
      ok: false as const,
      reason: "invalid_payload" as const,
      detail: "The forecast email data was invalid.",
    };
  }

  const data = parsed.data;

  const enabled = await getConfig("email_enabled", "1");

  if (String(enabled) !== "1") {
    await logj({
      domain: "weather",
      level: "info",
      message: MESSAGE_PREFIX + "Email disabled by flag",
      file: "lib/server/email/sendForecastEmail.ts",
      line: 244,
      payload: {
        locationName: data.locationName,
      },
      meta: {
        built: {
          ...built,
          eventIndex: ++eventIndex,
        },
      },
    });

    return {
      ok: false as const,
      reason: "disabled" as const,
      detail: "Email sending is currently disabled.",
    };
  }

  const throttleMinutesRaw = await getConfig(
    "forecast.email.throttle.minutes",
    "15",
  );

  const throttleMinutes =
    typeof throttleMinutesRaw === "number"
      ? throttleMinutesRaw
      : Number(throttleMinutesRaw ?? 15);

  const lastSentRaw = await getConfig("forecast.email.last_sent_at", "");

  const lastSentAt =
    typeof lastSentRaw === "string" && lastSentRaw.trim().length > 0
      ? lastSentRaw
      : null;

  const throttleStatus = getThrottleStatus(
    lastSentAt,
    Number.isFinite(throttleMinutes) ? throttleMinutes : 15,
  );

  if (throttleStatus.isThrottled) {
    return {
      ok: false as const,
      reason: "throttled" as const,
      detail: throttleStatus.timeUntilAllowed,
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const resend = new Resend(apiKey);
  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const subject = `Weather and astronomy for ${data.locationName}`;
    const forecastRowsRaw = form.get("forecastRows");
    const forecastRows =
      typeof forecastRowsRaw === "string" ? JSON.parse(forecastRowsRaw) : [];

    const { data: resendData, error } = await resend.emails.send({
      from: "Weather Bot <forecast@kraus.my.id>",
      to: ["jonathankraus2026@outlook.com"],
      subject,
      react: renderForecastEmail(data, forecastRows),
    });

    if (error) {
      console.error("SendForecastEmail -- Resend error:", error);
      throw new Error(error.message);
    }

    console.info("SendForecastEmail -- Forecast email sent", {
      emailId: resendData?.id,
    });

    const sentAt = new Date().toISOString();

    await setConfig("forecast.email.last_sent_at", sentAt);

    await logj({
      domain: "weather",
      level: "info",
      message: MESSAGE_PREFIX + "Forecast email sent",
      file: "lib/server/email/sendForecastEmail.ts",
      line: 337,
      payload: {
        locationName: data.locationName,
        temperature: data.temperature,
        forecastSource: data.source,
        sentAt,
      },
      meta: {
        built: {
          ...built,
          eventIndex: ++eventIndex,
        },
      },
    });

    return {
      ok: true as const,
      sent: true as const,
      sentAt,
    };
  } catch (error: unknown) {
    const errorRecord =
      error && typeof error === "object" && !Array.isArray(error)
        ? (error as Record<string, unknown>)
        : null;

    const detail =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : "Resend request failed with a non-Error response.";

    await logj({
      domain: "weather",
      level: "error",
      message: MESSAGE_PREFIX + "Resend error",
      file: "lib/server/email/sendForecastEmail.ts",
      line: 375,
      payload: {
        locationName: data.locationName,
        detail,
        status,
        errorType:
          error === null
            ? "null"
            : Array.isArray(error)
              ? "array"
              : typeof error,
        errorName: error instanceof Error ? error.name : null,
        errorKeys: errorRecord ? Object.keys(errorRecord) : [],
      },
      meta: {
        built: {
          ...built,
          eventIndex: ++eventIndex,
        },
      },
    });

    return {
      ok: false as const,
      reason: "error" as const,
      detail:
        typeof status === "number"
          ? `Send request failed (${status}).`
          : "Send could not send the email.",
    };
  }
}
