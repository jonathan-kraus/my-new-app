/*
 * @FilePath: \my-new-app\app\ping\page.tsx
 * @LastEditTime: 2026-08-10 20:44:31
 */
// app/ping/page.tsx
import { headers } from "next/headers";

export default async function PingPage({
  searchParams,
}: {
  searchParams: Promise<{ run?: string }>;
}) {
  const { run } = await searchParams;

  if (run !== "1") {
    return <p>Ping is idle. Visit /ping?run=1 to run it manually.</p>;
  }

  const pingRes = await fetch("https://www.kraus.my.id/api/ping?run=Jonathan", {
    cache: "no-store",
  });

  const pingData = await pingRes.json();
  // const deployments = await secondRes.json();

  return (
    <div>
      <h2>Ping API Result:</h2>
      <pre>{JSON.stringify(pingData, null, 2)}</pre>

      {/* <h2>Second API Result:</h2>
      {deployments.map((d: any) => (
        <div key={d.id}>
          <p>Created At: {d.created_at}</p>
          <p>SHA: {d.sha}</p>
          <p>Status: {d.status}</p>
        </div> */}
      {/* ))} */}
    </div>
  );
}
