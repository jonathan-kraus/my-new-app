/*
 * @FilePath: \my-new-app\app\config\read\actions.ts
 * @LastEditTime: 2026-03-14 23:44:43
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
| where firstData.reason == "Flight"
| sort by _time desc
| project firstData.Variable01, firstData.Variable02, firstData.Variable03
| take 1
`;

  const res = await queryAxiom(q);

  await logit(
    "jonathan",
    { level: "info", message: "Read config data from Axiom" },
    { res },
    {
      page: "config/read",
      requestId,
      userId,
      eventIndex,
    }
  );

  return res;
}

