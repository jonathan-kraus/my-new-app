/*
 * @FilePath: \my-new-app\app\config\read\actions.ts
 * @LastEditTime: 2026-03-15 00:16:21
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
['github-events']
| where reason == "Flight"
| sort by _time desc
| project
    Variable01,
    Variable02,
    Variable03
| take 1
`;

    const rows = await queryAxiom(q);


  await logit(
    "jonathan",
    { level: "info", message: "Read config data from Axiom" },
    { rows },
    {
      page: "config/read",
      requestId,
      userId,
      eventIndex,
    }
  );

    return rows![0] ?? null;
}

