import { Resend } from "resend";

import { getConfig, setConfig } from "@/lib/runtime/config";

import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import type { buildWeatherEmail } from "./buildWeatherEmail";
import { log } from "../../src/lib/log/logger";
export async function sendWeatherEmail({
  to,
  weatherEmail,
}: {
  to: string;
  weatherEmail: ReturnType<typeof buildWeatherEmail>;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  const fromEmail = "weather@www.kraus.my.id";
  const fromName = "Weather Bot";

  const built = staticUniversalContext("SendWeatherEmail");
  let jei = 0;
  const resend = new Resend(apiKey);

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [to],
    subject: weatherEmail.subject,
    text: weatherEmail.text,
    html: weatherEmail.html,
  });

  if (error) {
    throw new Error(error.message);
  }
  await logj({
    domain: "email",
    level: "info",
    message: "Email sent through Resend",
    file: "app/forecast/mailresend.tsx",
    line: 39,
    payload: {
      emailId: data?.id,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  console.log("Email sent through Resend", {
    emailId: data?.id,
  });
}
