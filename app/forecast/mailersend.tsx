import { Resend } from "resend";
import { z } from "zod";
import { getConfig, setConfig } from "@/lib/runtime/config";

import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

import type { buildWeatherEmail } from "./buildWeatherEmail";
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
  const toEmail = "jonathankraus2026@outlook.com";
  const resend = new Resend(apiKey);
  // app\forecast\mailersend.tsx

  const { data, error } = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: [toEmail],
    subject: weatherEmail.subject,
    text: weatherEmail.text,
    html: weatherEmail.html,
  });

  if (error) {
    throw new Error(error.message);
  }

  console.info("Email sent through Resend", {
    emailId: data?.id,
  });
}
