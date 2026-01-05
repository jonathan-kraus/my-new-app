import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { getRuntimeBoolean } from "@/lib/runtimeConfig";
import { buildWeatherEmail } from "./buildWeatherEmail";
export async function sendWeatherEmail({
  to,
  weatherEmail,
}: {
  to: string;
  weatherEmail: ReturnType<typeof buildWeatherEmail>;
}) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY!,
  });

  const enabled = await getRuntimeBoolean("email.weather.enabled", true);
  if (!enabled) {
    console.log("Weather email disabled via RuntimeConfig");
    return;
  }

  const sentFrom = new Sender("weather@yourdomain.com", "Weather Bot");
  const recipients = [new Recipient(to)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(weatherEmail.subject)
    .setHtml(weatherEmail.html)
    .setText(weatherEmail.text);

  await mailerSend.email.send(emailParams);
}
