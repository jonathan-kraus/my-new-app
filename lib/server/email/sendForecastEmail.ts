/*
 * @FilePath: \my-new-app\lib\server\email\sendForecastEmail.ts
 * @LastEditTime: 2026-09-06 00:27:57
 */
// lib/server/email/sendForecastEmail.ts
"use server";

import { Resend } from "resend";
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

function buildForecastEmail(data: ForecastEmailData) {
  const subject = `Weather and astronomy for ${data.locationName}`;

  const text = [
    `Weather and astronomy for ${data.locationName}`,
    "",
    "Current weather",
    `Temperature: ${formatTemperature(data.temperature)}`,
    `Feels like: ${formatTemperature(data.feelsLike)}`,
    `Humidity: ${formatPercent(data.humidity)}`,
    `Wind speed: ${formatWind(data.windSpeed)}`,
    `Source: ${data.source}`,
    `Fetched: ${data.fetchedAt}`,
    "",
    "Sun and moon",
    `Sunrise: ${formatTime(data.sunrise)}`,
    `Sunset: ${formatTime(data.sunset)}`,
    `Moonrise: ${formatTime(data.moonrise)}`,
    `Moonset: ${formatTime(data.moonset)}`,
    `Moon phase: ${data.moonPhaseEmoji ?? ""} ${formatTime(data.moonPhaseName)}`,
    "",
    "Sent from My New App.",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:24px;background:#f3f4f6;color:#111827;font-family:Arial,Helvetica,sans-serif;">
        <main style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
          <header style="padding:28px 32px;background:#0f766e;color:#ffffff;">
            <p style="margin:0 0 6px;font-size:13px;opacity:0.85;">
              Weather and astronomy
            </p>
            <h1 style="margin:0;font-size:28px;line-height:1.2;">
              ${escapeHtml(data.locationName)}
            </h1>
          </header>

          <section style="padding:28px 32px;">
            <h2 style="margin:0 0 12px;font-size:18px;">
              Current weather
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.7;">
              <tbody>
                <tr>
                  <td style="color:#6b7280;">Temperature</td>
                  <td style="text-align:right;font-weight:700;">
                    ${formatTemperature(data.temperature)}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Feels like</td>
                  <td style="text-align:right;font-weight:700;">
                    ${formatTemperature(data.feelsLike)}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Humidity</td>
                  <td style="text-align:right;font-weight:700;">
                    ${formatPercent(data.humidity)}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Wind speed</td>
                  <td style="text-align:right;font-weight:700;">
                    ${formatWind(data.windSpeed)}
                  </td>
                </tr>
              </tbody>
            </table>

            <h2 style="margin:32px 0 12px;font-size:18px;">
              Sun and moon
            </h2>

            <table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.7;">
              <tbody>
                <tr>
                  <td style="color:#6b7280;">Sunrise</td>
                  <td style="text-align:right;font-weight:700;">
                    ${escapeHtml(formatTime(data.sunrise))}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Sunset</td>
                  <td style="text-align:right;font-weight:700;">
                    ${escapeHtml(formatTime(data.sunset))}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Moonrise</td>
                  <td style="text-align:right;font-weight:700;">
                    ${escapeHtml(formatTime(data.moonrise))}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Moonset</td>
                  <td style="text-align:right;font-weight:700;">
                    ${escapeHtml(formatTime(data.moonset))}
                  </td>
                </tr>
                <tr>
                  <td style="color:#6b7280;">Moon phase</td>
                  <td style="text-align:right;font-weight:700;">
                    ${escapeHtml(data.moonPhaseEmoji ?? "")}
                    ${escapeHtml(formatTime(data.moonPhaseName))}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <footer style="padding:16px 32px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:12px;">
            Source: ${escapeHtml(data.source)}<br />
            Fetched: ${escapeHtml(data.fetchedAt)}
          </footer>
        </main>
      </body>
    </html>
  `;

  return { subject, text, html };
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
      line: 167,
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
      line: 196,
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
    const { subject, text, html } = buildForecastEmail(data);

    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured.");
    }

    const resend = new Resend(apiKey);

    const { data: resendData, error } = await resend.emails.send({
      from: "Weather Bot <forecast@kraus.my.id>",
      to: ["jonathankraus2026@outlook.com"],
      subject,
      text,
      html,
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
      line: 276,
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
          : "MailerSend request failed with a non-Error response.";

    const mailerSendResponse =
      errorRecord?.response && typeof errorRecord.response === "object"
        ? (errorRecord.response as Record<string, unknown>)
        : null;

    const mailerSendBody =
      errorRecord?.body ??
      errorRecord?.data ??
      mailerSendResponse?.body ??
      mailerSendResponse?.data ??
      null;

    const status =
      errorRecord?.status ??
      errorRecord?.statusCode ??
      mailerSendResponse?.status ??
      mailerSendResponse?.statusCode ??
      null;

    await logj({
      domain: "weather",
      level: "error",
      message: MESSAGE_PREFIX + "MailerSend error",
      file: "lib/server/email/sendForecastEmail.ts",
      line: 307,
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
        mailerSendBody,
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
          ? `MailerSend request failed (${status}).`
          : "MailerSend could not send the email.",
    };
  }
}
