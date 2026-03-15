/*
 * @FilePath: \my-new-app\app\config\create\page.tsx
 * @LastEditTime: 2026-03-14 23:57:07
 */

import crypto from "crypto";
import { logit } from "@/lib/log/logit";

export type config = {
  id: string;
  reason: string;
  message: string;
  Variable01: string;
  Variable02: string;
  Variable03: string;
};
export default async function AxiomTestPage() {
  const requestId = crypto.randomUUID();
  const userId = "JK";
  const eventIndex = 22;

  const firstData = {
    id: crypto.randomUUID(),
    reason: "Flight",
    message: "Config for favorite flights",
    Variable01: "AA1976",
    Variable02: "AA607",
    Variable03: "AA1211",
  };
  const secondData = {
    id: crypto.randomUUID(),
    reason: "Weather",
    message: "Config for favorite cities",
    Variable01: "KOP",
    Variable02: "Brookline",
    Variable03: "Williamstown",
  };
  await fetch("https://www.kraus.my.id/api/config/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstData,
    }),
  });

  await fetch("https://www.kraus.my.id/api/config/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secondData,
    }),
  });
  // --- Log the combined result --------------------------------------------
  await logit(
    "jonathan",
    { level: "info", message: "Config Create" },
    {
      firstData: firstData,
      secondData: secondData,
    },
    {
      page: "page.tsx",
      requestId,
      userId,
      eventIndex,
    },
  );

  // --- Render both API results --------------------------------------------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold mb-4">Result</h1>

      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
        {JSON.stringify(
          {
            requestId,

            firstData,
            secondData,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
