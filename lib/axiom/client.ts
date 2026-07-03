"use client";

import { Logger } from "@axiomhq/logging";
import { createUseLogger, createWebVitalsComponent } from "@axiomhq/react";

/**
 * Client-side logging:
 * - Sends logs to /api/axiom via fetch()
 * - No API token exposed
 * - No Axiom client initialized in the browser
 */

async function sendToServer(log: any) {
  try {
    await fetch("/api/axiom", {
      method: "POST",
      body: JSON.stringify(log),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send log to server:", err);
  }
}

export const logger = new Logger({
  transports: [
    {
      send: sendToServer,
    },
  ],
});

export const useLogger = createUseLogger(logger);
export const WebVitals = createWebVitalsComponent(logger);
