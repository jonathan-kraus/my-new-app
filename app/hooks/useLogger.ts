"use client";

import { authClient } from "@/lib/auth-client";

export function useLogger() {
  const { data: session } = authClient.useSession();

  function info(message: string, data?: Record<string, any>) {
    if (typeof window === "undefined") return;

    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "info",
        message,
        userId: session?.user?.id ?? null,
        page: window.location.pathname,
        data,
        createdAt: new Date().toISOString(),
      }),
    });
  }

  return { info };
}
