"use server";

import { getConfig, setConfig } from "@/lib/runtime/config";
import { Resend } from "resend";
import { buildTestEmail } from "@/lib/buildTestEmail";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { getThrottleStatus } from "./throttle-utils";

const built = staticUniversalContext("Jonathan");
const message_begin = "SendTestEmail -- ";

export async function sendTestEmail(message?: string, subject?: string) {
  let jei = 0;

  // --- 1. Read flag ---------------------------------------------------------
  const enabled = await getConfig("email_enabled", "1");

  if (String(enabled) !== "1") {
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Email disabled by flag",
      file: "lib/server/email/sendTestEmail.ts",
      line: 20,
      payload: { enabled },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return {
      ok: false,
      reason: "disabled",
      detail: "Email sending is disabled.",
    };
  }

  const throttleMinutes = Number(
    await getConfig("email.throttle.minutes", "0"),
  );

  const lastSentRaw = await getConfig("email.last_sent_at", "");

  // --- 2. Build email -------------------------------------------------------
  const baseEmail = buildTestEmail();

  const finalSubject = subject ?? baseEmail.subject;
  const finalText = message ?? baseEmail.text;
  const finalHtml = message
    ? `<pre style="font-family: system-ui; white-space: pre-wrap;">${message}</pre>`
    : baseEmail.html;

  // --- 3. Throttle ----------------------------------------------------------
  await logj({
    domain: "jonathan",
    level: "info",
    message: message_begin + "Throttle check starting",
    file: "lib/server/email/sendTestEmail.ts",
    line: 53,
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
    domain: "jonathan",
    level: "info",
    message: message_begin + "Throttle status computed",
    file: "lib/server/email/sendTestEmail.ts",
    line: 73,
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
    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Throttled",
      file: "lib/server/email/sendTestEmail.ts",
      line: 90,
      payload: { throttleStatus },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return {
      ok: false,
      reason: "throttled",
      detail: throttleStatus.timeUntilAllowed,
    };
  }

  // --- 4. Configure Resend --------------------------------------------------
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    await logj({
      domain: "jonathan",
      level: "error",
      message: message_begin + "RESEND_API_KEY is missing",
      file: "lib/server/email/sendTestEmail.ts",
      line: 111,
      payload: {},
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return {
      ok: false,
      reason: "configuration_error",
      detail: "RESEND_API_KEY is not configured.",
    };
  }

  const resend = new Resend(apiKey);

  // --- 5. Send email --------------------------------------------------------
  try {
    const { data: resendData, error } = await resend.emails.send({
      from: "Weather Bot <weather@kraus.my.id>",
      to: ["jonathankraus2026@outlook.com"],
      subject: finalSubject,
      text: finalText,
      html: finalHtml,
    });

    if (error) {
      throw new Error(error.message);
    }

    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Test email sent",
      file: "lib/server/email/sendTestEmail.ts",
      line: 144,
      payload: {
        emailId: resendData?.id,
        recipient: "jonathankraus2026@outlook.com",
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    // --- 6. Update timestamp ------------------------------------------------
    const newTimestamp = new Date().toISOString();

    await setConfig("email.last_sent_at", newTimestamp);

    await logj({
      domain: "jonathan",
      level: "info",
      message: message_begin + "Updated last_sent_at",
      file: "lib/server/email/sendTestEmail.ts",
      line: 162,
      payload: {
        lastSentAt: newTimestamp,
        emailId: resendData?.id,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return {
      ok: true,
      sent: true,
      emailId: resendData?.id,
    };
  } catch (err: unknown) {
    const detail =
      err instanceof Error ? err.message : "Unknown error while sending email.";

    await logj({
      domain: "jonathan",
      level: "error",
      message: message_begin + "Resend error",
      file: "lib/server/email/sendTestEmail.ts",
      line: 184,
      payload: { detail },
      meta: { built: { ...built, eventIndex: ++jei } },
    });

    return {
      ok: false,
      reason: "error",
      detail,
    };
  }
}
