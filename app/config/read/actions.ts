/*
 * @FilePath: \my-new-app\app\config\read\actions.ts
 * @LastEditTime: 2026-03-15 13:17:25
 */
"use server";

import { queryAxiom } from "@/lib/axiom/query";
import { logit } from "@/lib/log/logit";
import crypto from "crypto";

export async function readConfigFromAxiom() {
  const requestId = crypto.randomUUID();
  const userId = "JK";
  const eventIndex = 22;

  const q = `
['config_control']
| where reason == "Flight"
| sort by _time desc

| take 1
`;

  const rows = await queryAxiom(q);
  console.log("ROWS:", rows);

  await logit(
    "jonathan",
    { level: "info", message: "Read config data from Axiom" },
    { rows },
    {
      page: "config/read",
      requestId,
      userId,
      eventIndex,
    },
  );

  return rows![0] ?? null;
}
