// app/ping/page.tsx

import { refreshLogRowEstimateForToday } from "@/lib/db/refreshLogRowEstimateForToday";
import { logit } from "@/lib/log/logit";

export default async function AxiomTestPage() {
const ctx = {requestId: crypto.randomUUID(),
                page: "ping",
                userId: "JK",
              zulu: new Date().toISOString(),
              local: new Date().toLocaleString("en-US", {
                timeZone: "America/New_York",
              })
              };

  // --- Fetch two APIs in parallel -----------------------------------------
  const [pingRes, secondRes] = await Promise.all([
    fetch("https://www.kraus.my.id/api/ping", { cache: "no-store" }),
    fetch("https://www.kraus.my.id/api/deployments", { cache: "no-store" }), // <— replace with your second API
  ]);

  const pingData = await pingRes.json();
  const data2 = await secondRes.json();

  // --- Optional: your Neon row estimate -----------------------------------
  const count = await refreshLogRowEstimateForToday();

  // --- Log the combined result --------------------------------------------
  await logit(
    "jonathan",
    { level: "info", message: "Fetched two APIs" },
    {
      pingData,
      data2,
      count,
    },
    {
    ctx
    },
  );

  // --- Render both API results --------------------------------------------
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-bold mb-4">Result</h1>

      <pre className="bg-black/40 p-4 rounded text-green-300 text-sm overflow-auto">
        {JSON.stringify(
          {
            count,
            pingData,
            data2,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}
