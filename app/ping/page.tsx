// app/ping/page.tsx

import { refreshLogRowEstimateForToday } from "@/lib/db/refreshLogRowEstimateForToday";
import { buildUniversalContext } from "@/lib/log/build-universal-context";
import { NextRequest } from "next/server";
import { logj } from "@/lib/log/logj";

export default async function AxiomTestPage(req: NextRequest) {
  const ctx = {
    requestId: crypto.randomUUID(),
    page: "ping",
    userId: "JK",
    zulu: new Date().toISOString(),
    local: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
  };
  let jei = 0;
  const built = await buildUniversalContext(req as any, "PING");
  await logj({
    domain: "jonathan",
    level: "info",
    message: `** PING ** `,
    file: "app/ping/page.tsx",
    line: 20,
    payload: {
      some: "payload",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  // --- Fetch two APIs in parallel -----------------------------------------
  const [pingRes, secondRes] = await Promise.all([
    fetch("https://www.kraus.my.id/api/ping", { cache: "no-store" }),
    fetch("https://www.kraus.my.id/api/deployments", { cache: "no-store" }), // <— replace with your second API
  ]);

  const pingData = await pingRes.json();
  // --- Fetch row estimate for today ----------------------------------------
  const count = await refreshLogRowEstimateForToday();

  // --- Log the combined result --------------------------------------------
  await logj({
    domain: "jonathan",
    level: "info",
    message: `"Fetched two APIs"`,
    file: "app/ping/page.tsx",
    line: 20,
    payload: {
      some: "payload",
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  // --- Render both API results --------------------------------------------
  type Deployment = {
    id: number;
    sha: string;
    ref: string;
    environment: string;
    created_at: string;
    creator: string;
    status: string;
    log_url: string;
  };

  const data2: Deployment[] = await secondRes.json();

  // --- Render both API results --------------------------------------------
  return (
    <div>
      count: {count}
      <h2>Ping API Result:</h2>
      <pre>{JSON.stringify(pingData, null, 2)}</pre>
      <h2>Second API Result:</h2>
      {data2.map((d) => (
        <div key={d.id}>
          <p>Created At: {d.created_at}</p>
          <p>SHA: {d.sha}</p>
          <p>Status: {d.status}</p>
        </div>
      ))}
    </div>
  );
}
