/*
 * @FilePath: \my-new-app\app\ping\page.tsx
 * @LastEditTime: 2026-08-05 16:35:02
 */
// app/ping/page.tsx
import { headers } from "next/headers";

export default async function PingPage() {
  const [pingRes, secondRes] = await Promise.all([
    fetch("https://www.kraus.my.id/api/ping", { cache: "no-store" }),
    fetch("https://www.kraus.my.id/api/deployments", { cache: "no-store" }),
  ]);

  const pingData = await pingRes.json();
  const deployments = await secondRes.json();

  return (
    <div>
      <h2>Ping API Result:</h2>
      <pre>{JSON.stringify(pingData, null, 2)}</pre>

      <h2>Second API Result:</h2>
      {deployments.map((d: any) => (
        <div key={d.id}>
          <p>Created At: {d.created_at}</p>
          <p>SHA: {d.sha}</p>
          <p>Status: {d.status}</p>
        </div>
      ))}
    </div>
  );
}
