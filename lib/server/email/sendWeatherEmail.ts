"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { buildSendWeatherEmail } from "@/lib/buildSendWeatherEmail";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { getThrottleStatus } from "./throttle-utils";

const built = staticUniversalContext("SendWeatherEmail");
let jei = 0;
const message_begin = "SendWeatherEmail -- ";

export async function sendWeatherEmail(message?: string, subject?: string) {
  // --- 1. Read flag ---------------------------------------------------------
  const enabled = await getConfig("email_enabled", "1");

  await logj({
    domain: "email",
    level: "info",
    message: message_begin + "Checked email_enabled",
    file: "lib/server/email/sendWeatherEmail.ts",
    line: 16,
    payload: {
      enabled_raw: enabled,
      enabled_string: String(enabled),
      message,
      subject,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  if (String(enabled) !== "1") {
    await logj({
      domain: "email",
      level: "warn",
      message: message_begin + "Email sending disabled by runtime flag",
      file: "lib/server/email/sendWeatherEmail.ts",
      line: 33,
      payload: {},
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    return { ok: false, reason: "disabled" };
  }

  const throttleMinutes = Number(
    await getConfig("email.throttle.minutes", "0"),
  );
  const lastSentRaw = await getConfig("email.last_sent_at", "");

  // --- 2. Build email -------------------------------------------------------
  const baseEmail = await buildSendWeatherEmail();

  const finalSubject = subject || baseEmail.subject;
  const finalText = message || baseEmail.text;

  // Always include your template, optionally append message
  const finalHtml =
    baseEmail.html +
    (message
      ? `<div style="margin-top:20px; font-family: system-ui;">
           <pre>${message}</pre>
         </div>`
      : "");

  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const sentFrom = new Sender("jonathan@www.kraus.my.id", "Travel Weather Bot");
  const recipients = [new Recipient("jonathankraus2026@outlook.com")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(finalSubject)
    .setHtml(finalHtml)
    .setText(finalText);

  // --- 3. Throttle ----------------------------------------------------------
  await logj({
    domain: "email",
    level: "info",
    message: message_begin + "Throttle check starting",
    file: "lib/server/email/sendWeatherEmail.ts",
    line: 80,
    payload: {
      throttleMinutes,
      lastSentRaw,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const throttleStatus = getThrottleStatus(
    typeof lastSentRaw === "string" && lastSentRaw.length > 0
      ? lastSentRaw
      : null,
    throttleMinutes,
  );

  await logj({
    domain: "email",
    level: "info",
    message: message_begin + "Throttle status computed",
    file: "lib/server/email/sendWeatherEmail.ts",
    line: 94,
    payload: {
      isThrottled: throttleStatus.isThrottled,
      canSendNow: throttleStatus.canSendNow,
      timeUntilAllowed: throttleStatus.timeUntilAllowed,
      remainingMinutes: throttleStatus.remainingMinutes,
      throttleWindowMinutes: throttleStatus.throttleWindowMinutes,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  if (throttleStatus.isThrottled) {
    return {
      ok: false,
      reason: "throttled",
      detail: throttleStatus.timeUntilAllowed,
    };
  }

  // --- 4. Send email --------------------------------------------------------
  try {
    await mailerSend.email.send(emailParams);

    await logj({
      domain: "email",
      level: "info",
      message: message_begin + "Travel Weather email sent",
      file: "lib/server/email/sendWeatherEmail.ts",
      line: 128,
      payload: {
        subject: finalSubject,
        message_preview: message?.slice(0, 80),
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    // --- 5. Update timestamp --------------------------------------------------
    const newTimestamp = new Date().toISOString();
    const saved = await setConfig("email.last_sent_at", newTimestamp);

    await logj({
      domain: "email",
      level: "info",
      message: message_begin + "Updated last_sent_at",
      file: "lib/server/email/sendWeatherEmail.ts",
      line: 141,
      payload: {
        attempted: newTimestamp,
        saved,
        match: String(saved) === newTimestamp,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return { ok: true, sent: true };
  } catch (err: any) {
    await logj({
      domain: "email",
      level: "error",
      message: message_begin + "MailerSend error",
      file: "lib/server/email/sendWeatherEmail.ts",
      line: 156,
      payload: {
        error: err?.message,
        stack: err?.stack,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return { ok: false, reason: "error", detail: err.message };
  }
}
