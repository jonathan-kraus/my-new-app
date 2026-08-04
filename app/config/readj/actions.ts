/*
 * @FilePath: \my-new-app\app\config\readj\actions.ts
 * @LastEditTime: 2026-08-04 14:14:07
 */
"use server";

import { queryAxiom } from "@/lib/axiom/query";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";

const built = staticUniversalContext("Config");
let jei = 0;

export type ConfigEntry = {
  reason?: string;
  message?: string;
  Variable01: string;
  Variable02: string;
  Variable03: string;
  [key: string]: unknown; // allow extra Axiom fields
};

export async function readFlightConfig(): Promise<ConfigEntry | null> {
  const q = `
  | where data.reason == "Flight"
  | sort by _time desc
  | take 1
  `;
  const rows = await queryAxiom(q);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 31,
    payload: { "FLIGHT QUERY ROWS:": JSON.stringify(rows, null, 2) },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  console.log("FLIGHT QUERY ROWS:", JSON.stringify(rows, null, 2));

  // rows are already the event objects (or contain a nested data object)
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  // handle both shapes: flat fields or nested under `data`
  const data =
    (row.data as ConfigEntry | undefined) ?? (row as unknown as ConfigEntry);
  return data ?? null;
}

export async function readWeatherConfig(): Promise<ConfigEntry | null> {
  const q = `
  | where data.reason == "Weather"
  | sort by _time desc
  | take 1
  `;

  const rows = await queryAxiom(q);
  await logj({
    domain: "dashboard",
    level: "info",
    message: "Dashboard page loaded",
    file: "app/dashboard/page.tsx",
    line: 61,
    payload: { "WEATHER QUERY ROWS:": JSON.stringify(rows, null, 2) },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  console.log("WEATHER QUERY ROWS:", JSON.stringify(rows, null, 2));

  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;

  const data =
    (row.data as ConfigEntry | undefined) ?? (row as unknown as ConfigEntry);
  return data ?? null;
}
