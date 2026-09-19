"use client";

/**
 * Client-side logging:
 * - No transports
 * - No Axiom client
 * - Just sends events to the server
 */

export async function logToServer(event: unknown) {
  try {
    await fetch("/api/axiom", {
      method: "POST",
      body: JSON.stringify([event]),
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Failed to send log:", err);
  }
}
