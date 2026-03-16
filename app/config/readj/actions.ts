"use server";

import { queryAxiom } from "@/lib/axiom/query";

export async function readFlightConfig() {
  const q = `
  | where data.reason == "Flight"
  | sort by _time desc
  | take 1
  `;

  const rows = await queryAxiom(q);
  console.log("FLIGHT QUERY ROWS:", JSON.stringify(rows, null, 2));
  return rows[0]?.data ?? null;
}

export async function readWeatherConfig() {
  const q = `
  | where data.reason == "Weather"
  | sort by _time desc
  | take 1
  `;

  const rows = await queryAxiom(q);
  console.log("WEATHER QUERY ROWS:", JSON.stringify(rows, null, 2));
  return rows[0]?.data ?? null;
}
