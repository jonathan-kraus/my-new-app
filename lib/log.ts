// lib/log.ts
"use client";

import { useSession } from "next-auth/react";

export function useLogger() {
  const { data: session } = useSession(); // safe, unconditionally called

  function info(message: string, data?: Record<string, any>) {
    if (typeof window === "undefined") return; // never run on server

    const payload = {
      level: "info",
      message,
      userId: 3456,
      page: window.location.pathname,
      data,
      createdAt: new Date().toISOString(),
    };

    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return { info };
}
