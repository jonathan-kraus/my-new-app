/*
 * @FilePath: \my-new-app\app\config\create\page.tsx
 * @LastEditTime: 2026-03-15 20:11:43
 */

import { axiomIngest } from "@/lib/axiom";
import { logit } from "@/lib/log/logit";

export type config = {
  id: string;
  reason: string;
  message: string;
  Variable01: string;
  Variable02: string;
  Variable03: string;
};
export default async function AxiomConfig() {
  const requestId = crypto.randomUUID();
  const userId = "JK";
  const eventIndex = 22;
await logit(
  "jonathan",
  { level: "info", message: "In AxiomConfig" },
  {
    userid: userId,
    requestId: requestId,
    eventIndex: eventIndex
  },
  {
    page: "page.tsx",
    zulu: new Date().toISOString(),
    local: new Date().toLocaleString("en-US", {

    })

  }
);
//-------------------------------------------------------------------------
await axiomIngest(
  [
    {
      id: crypto.randomUUID(),
      reason: "Flight",
      message: "Config for favorite flights",
      Variable01: "AA1976",
      Variable02: "AA607",
      Variable03: "AA1211",

    }
  ],
  "config"
);
await logit(
  "jonathan",
  { level: "info", message: "Flight call complete" },
  {
configmessage: "Config for favorite flights"
  },
  {
    page: "page.tsx",
    requestId,
    userId,
    eventIndex,

  }
);

await axiomIngest(
  [
    {
      id: crypto.randomUUID(),
      reason: "Weather",
      message: "Config for favorite cities",
      Variable01: "KOP",
      Variable02: "Brookline",
      Variable03: "Williamstown"
    }
  ],
  "config"

);
await logit(
  "jonathan",
  { level: "info",
    message: "Weather call complete" },
  {configmessage: "Config for favorite cities"},
  {
    page: "page.tsx",
    requestId,
    userId,
    eventIndex,

  }
);

  // --- Log the combined result --------------------------------------------
  await logit(
    "jonathan",
    { level: "info", message: "Config Complete" },
    {

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


          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
