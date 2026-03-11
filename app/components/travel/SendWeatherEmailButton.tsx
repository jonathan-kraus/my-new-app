/*
 * @FilePath: \my-new-app\app\components\travel\SendWeatherEmailButton.tsx
 * @LastEditTime: 2026-03-11 00:49:04
 */
"use client";

import { toast } from "react-hot-toast";
import { logit } from "@/lib/log/logit.client";

export function SendWeatherEmailButton() {
  async function handleClick() {
    try {
      const res = await fetch("/api/email/weather", { method: "POST" });
      const data = await res.json();
      const eventIndex = 22;
      const requestId = crypto.randomUUID();
      const ctx = {
        page: "/sidenav/email-test",
        file: "app/components/sidenav/EmailLink.tsx",
      };
      logit(
        "jonathan",
        {
          level: "info",
          message: "weather_email_clicked",
          data,
          ...ctx,
        },
        { eventIndex },
        {
          requestId: requestId,
          route: "/sidenav/email-test",
          userId: "JK",
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
        },
      );

      toast.success("Weather email sent!");
    } catch (err) {
      toast.error("Failed to send weather email");
      const eventIndex = 22;
      const requestId = crypto.randomUUID();
      logit(
        "jonathan",
        {
          level: "error",
          message: "weather_email_error",
          error: String(err),
        },
        { eventIndex },
        {
          requestId: requestId,
          zulu: new Date().toISOString(),
          local: new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
          }),
        },
      );
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
