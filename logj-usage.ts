/*
 * @FilePath: \my-new-app\logj-usage.ts
 * @LastEditTime: 2026-06-20 15:14:35
 */
// logj-usage.ts
// Examples of how to use the logj logger throughout your app.

import { logj } from "@/lib/log/logj";

// -----------------------------
// Simple messages
// -----------------------------

// logj.info("Starting environment check");
// logj.warn("Missing GitHub token");
// logj.error("Neon API failed");

// -----------------------------
// Messages with payload (meta)
// -----------------------------

// logj.info("User logged in", {
//   userId: 123,
//   role: "admin",
// });

// logj.warn("Slow response time", {
//   route: "/api/weather",
//   duration: 842,
// });

// logj.error("Failed to fetch Neon metadata", {
//   status: 401,
//   endpoint: "/api/neon",
// });

// -----------------------------
// Realistic examples from your app
// -----------------------------

// logj.info("Environment check complete", {
//   github: { ok: true },
//   neon: { ok: true },
//   vercel: { ok: true },
// });

// logj.error("Axiom ingestion failed", {
//   dataset: "myapp_logs",
//   reason: "401 unauthorized",
// });

// logj.warn("Unexpected null value in weather API", {
//   locationId: "KOP",
// });
