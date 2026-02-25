/*
 * @FilePath: \my-new-app\lib\server\email\sendWeatherEmail.ts
 * @LastEditTime: 2026-02-24 18:07:11
 */
// lib/server/email/sendWeatherEmail.ts

import { logit } from "@/lib/log/logit";

export async function sendWeatherEmail() {
  // TODO: integrate MailerSend here
  // For now, return a mock payload so your UI works

  const result = {
    ok: true,
    message: "Weather email sent (mock)",
  };

  logit("jonathan", {
    level: "info",
    message: "weather_email_sent_mock",
    payload: result,
  });

  return result;
}
