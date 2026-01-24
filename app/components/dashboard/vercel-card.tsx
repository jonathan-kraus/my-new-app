"use client";

import { useEffect, useState } from "react";
import { getVercelData } from "@/lib/vercel";

export default function VercelCard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getVercelData().then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="card">Loading Vercel data…</div>;

  const { usage, deployments, project } = data;

  return (
    <div className="card p-4 space-y-4">
      <h2 className="text-xl font-semibold">Vercel Overview</h2>

      <div>
        <h3 className="font-medium">Usage</h3>
        <p>Bandwidth: {usage.bandwidth} MB</p>
        <p>Serverless Invocations: {usage.serverlessExecutionCount}</p>
        <p>Edge Invocations: {usage.edgeExecutionCount}</p>
        <p>Builds: {usage.builds}</p>
      </div>

      <div>
        <h3 className="font-medium">Latest Deployments</h3>
        {deployments.slice(0, 3).map((d: any) => (
          <div key={d.uid} className="text-sm">
            <p>{d.meta.githubCommitMessage ?? "No commit message"}</p>
            <p>Status: {d.state}</p>
            <p>URL: {d.url}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-medium">Project</h3>
        <p>Name: {project.name}</p>
        <p>Framework: {project.framework}</p>
      </div>
    </div>
  );
}
