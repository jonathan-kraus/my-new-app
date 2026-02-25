/*
 * @FilePath: \my-new-app\components\travel\SendWeatherEmailButton.tsx
 * @LastEditTime: 2026-02-24 17:27:02
 */
"use client";

import { toast } from "react-hot-toast";
import { logit } from "@/lib/log/logit.client";

export function SendWeatherEmailButton() {
  async function handleClick() {
    try {
      const res = await fetch("/api/email/weather", { method: "POST" });
      const data = await res.json();

      logit("jonathan", {
        level: "info",
        message: "weather_email_clicked",
        payload: { data },
      });

      toast.success("Weather email sent!");
    } catch (err) {
      toast.error("Failed to send weather email");

      logit("jonathan", {
        level: "error",
        message: "weather_email_error",
        payload: { error: String(err) },
      });
    }
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Send Weather Email
    </button>
  );
}
