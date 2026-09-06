"use client";
import type { Location } from "@/lib/types";
import { useState, useTransition } from "react";
import { sendForecastEmail } from "@/lib/server/email/sendForecastEmail";
type ForecastRow = {
  date: Date;
  max: number;
  min: number;
  code: number;
};
const [isPending, startTransition] = useTransition();
const [emailMessage, setEmailMessage] = useState<string | null>(null);
const weatherCodeIcons: Record<number, string> = {
  0: "☀️", // Clear sky
  1: "🌤️", // Mainly clear
  2: "⛅", // Partly cloudy
  3: "☁️", // Overcast

  45: "🌫️", // Fog
  48: "🌫️", // Depositing rime fog

  51: "🌦️", // Light drizzle
  53: "🌦️", // Moderate drizzle
  55: "🌧️", // Dense drizzle

  61: "🌦️", // Slight rain
  63: "🌧️", // Moderate rain
  65: "🌧️", // Heavy rain

  71: "🌨️", // Slight snow
  73: "🌨️", // Moderate snow
  75: "❄️", // Heavy snow

  80: "🌦️", // Rain showers
  81: "🌧️", // Moderate showers
  82: "⛈️", // Violent showers

  95: "⛈️", // Thunderstorm
  96: "⛈️", // Thunderstorm with hail
  99: "⛈️", // Severe hailstorm
};

export type ForecastCardProps = {
  location: Location;
  current: {
    temperature: number;
    windspeed: number;
    humidity?: number;
  };
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
  fetchedAt: string;
  source: string;
  astronomy: {
    sunrise?: string;
    sunset?: string;
    moonrise?: string;
    moonset?: string;
    moonPhaseName?: string;
    moonPhaseEmoji?: string;
  };
  sendForecastEmailAction: (formData: FormData) => void | Promise<void>;
};

export function ForecastCard({
  location,
  current,
  forecast,
  fetchedAt,
  source,
  astronomy,
  sendForecastEmailAction,
}: ForecastCardProps) {
  const rows: ForecastRow[] =
    forecast.time.length === forecast.temperature_2m_max.length &&
    forecast.time.length === forecast.temperature_2m_min.length &&
    forecast.time.length === forecast.weathercode.length
      ? forecast.time.map((t, i) => ({
          date: new Date(t),
          max: forecast.temperature_2m_max[i]!,
          min: forecast.temperature_2m_min[i]!,
          code: forecast.weathercode[i]!,
        }))
      : [];

  async function inSendEmail() {
    console.log("inSendEmail key:", "key");
    setEmailMessage(null);
    const form = new FormData();
    form.set("locationName", location.name);
    form.set("temperature", String(current.temperature));
    form.set("feelsLike", String(current.temperature));
    form.set("humidity", String(current.humidity ?? 0));
    form.set("windSpeed", String(current.windspeed));
    form.set("fetchedAt", fetchedAt);
    form.set("source", source);

    form.set("sunrise", astronomy.sunrise ?? "");
    form.set("sunset", astronomy.sunset ?? "");
    form.set("moonrise", astronomy.moonrise ?? "");
    form.set("moonset", astronomy.moonset ?? "");
    form.set("moonPhaseName", astronomy.moonPhaseName ?? "");
    form.set("moonPhaseEmoji", astronomy.moonPhaseEmoji ?? "");
    startTransition(async () => {
      const result = await sendForecastEmail(form);

      if (result.ok) {
        setEmailMessage("Forecast email sent.");
        return;
      }

      if (result.reason === "throttled") {
        setEmailMessage(
          `Email throttled. ${result.detail ?? "Please try again later."}`,
        );
        return;
      }

      if (result.reason === "disabled") {
        setEmailMessage("Forecast email sending is disabled.");
        return;
      }

      setEmailMessage(result.detail ?? "Unable to send forecast email.");
    });
  }
  const test_msg1 = "This is a test email FORECASTCARD";
  const test_subject = "Test Email Subject FORECASTCARD";
  let jei = 0;

  // console.log("sendTestEmail result FORECASTCARD:", result);

  return (
    <div
      className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl text-white
                animate-[fadeIn_0.5s_ease-out]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{location.name}</h2>
        <button
          type="button"
          onClick={inSendEmail}
          disabled={isPending}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg text-sm font-medium transition"
        >
          {isPending ? "Sending…" : "Email Forecast"}
        </button>
      </div>

      {/* Forecast Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left">
          <tbody className="divide-y divide-white/10">
            {rows.map((row, i) => (
              <tr
                key={i}
                className="hover:bg-white/5 transition-colors
               animate-[rowIn_0.4s_ease-out]
               [animation-delay:${i * 80}ms]"
              >
                <td className="py-3 px-4 font-medium block md:table-cell">
                  {row.date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </td>

                <td className="py-3 px-4 block md:table-cell">
                  <span className="opacity-90">
                    {row.max}° / {row.min}°
                  </span>
                </td>

                <td className="py-3 px-4 text-right opacity-70 block md:table-cell md:text-right">
                  {weatherCodeIcons[row.code] ?? "❓"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {emailMessage ? (
        <p
          className="mt-3 text-sm text-white/80"
          role="status"
          aria-live="polite"
        >
          {emailMessage}
        </p>
      ) : null}
      <p className="mt-4 text-xs opacity-70">
        Source: {source} · Fetched:{" "}
        {new Date(fetchedAt).toLocaleTimeString("en-US")}
      </p>
    </div>
  );
}
