"use client";

export function useLogger() {
  function info(message: string, data?: Record<string, any>) {
    fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: "info",
        message,
        page: window.location.pathname,
        data,
        createdAt: new Date().toISOString(),
      }),
    });
  }

  return { info };
}
