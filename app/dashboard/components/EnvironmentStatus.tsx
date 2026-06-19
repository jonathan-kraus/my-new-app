"use client";

import { useEffect, useState } from "react";

type EnvResponse = {
  vercel: {
    project: any;
    latestDeployment: any;
  };
  neon: {
    id: string;
    name: string;
    orgId: string;
    region: string;
    platform: string;
    pgVersion: number;
    autoscaling: {
      min: number;
      max: number;
      suspendTimeout: number;
    };
    networking: {
      proxyHost: string;
      blockPublicConnections: boolean;
      allowedIPs: string[];
    };
    storage: {
      branchLogicalSizeLimit: number;
      branchLogicalSizeLimitBytes: number;
      syntheticStorageSize: number;
      quotaResetAt: string;
    };
    maintenance: {
      weekdays: number[];
      start: string;
      end: string;
    };
    replication: {
      logicalReplication: boolean;
    };
    timestamps: {
      createdAt: string;
      updatedAt: string;
      computeLastActiveAt: string;
    };
    postgresVersion: string; // from Prisma
  };
  github: {
    latestCommit: any;
    latestWorkflow: any;
  };
  timestamp: string;
};


export function EnvironmentStatus() {
  const [data, setData] = useState<EnvResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/environment");
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading environment status…</div>;
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500">Failed to load environment data.</div>
    );
  }

  const { vercel, neon, github, timestamp } = data;

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Environment Status</h1>
      <p className="text-sm text-gray-500">
        Last updated: {new Date(timestamp).toLocaleString()}
      </p>

      {/* VERCEL */}
      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Vercel</h2>
        <div className="space-y-1">
          <p>
            <strong>Project:</strong> {vercel.project?.name}
          </p>
          <p>
            <strong>TeamId:</strong> {vercel.project?.TeamId}
          </p>
          <p>
            <strong>Latest Deployment:</strong> {vercel.latestDeployment?.url}
          </p>
          <p>
            <strong>Status:</strong> {vercel.latestDeployment?.state}
          </p>
          <p>
            <strong>Commit:</strong>{" "}
            {vercel.latestDeployment?.meta?.githubCommitMessage}
          </p>
        </div>
      </section>

{/* NEON */}
<section className="border rounded-lg p-4">
  <h2 className="text-xl font-semibold mb-2">Neon</h2>
  <div className="space-y-1">
    <p><strong>Project ID:</strong> {neon.id}</p>
    <p><strong>Name:</strong> {neon.name}</p>
    <p><strong>Org ID:</strong> {neon.orgId}</p>
    <p><strong>Region:</strong> {neon.region}</p>
    <p><strong>Platform:</strong> {neon.platform}</p>
    <p><strong>Postgres Version:</strong> {neon.postgresVersion}</p>

    <h3 className="font-semibold mt-3">Autoscaling</h3>
    <p><strong>Min CU:</strong> {neon.autoscaling.min}</p>
    <p><strong>Max CU:</strong> {neon.autoscaling.max}</p>
    <p><strong>Suspend Timeout:</strong> {neon.autoscaling.suspendTimeout}s</p>

    <h3 className="font-semibold mt-3">Networking</h3>
    <p><strong>Proxy Host:</strong> {neon.networking.proxyHost}</p>
    <p><strong>Block Public Connections:</strong> {String(neon.networking.blockPublicConnections)}</p>
    <p><strong>Allowed IPs:</strong> {neon.networking.allowedIPs.join(", ") || "None"}</p>

    <h3 className="font-semibold mt-3">Storage</h3>
    <p><strong>Branch Size Limit:</strong> {neon.storage.branchLogicalSizeLimit} MB</p>
    <p><strong>Branch Size Limit Bytes:</strong> {neon.storage.branchLogicalSizeLimitBytes}</p>
    <p><strong>Synthetic Storage:</strong> {neon.storage.syntheticStorageSize}</p>
    <p><strong>Quota Resets:</strong> {neon.storage.quotaResetAt}</p>

    <h3 className="font-semibold mt-3">Maintenance</h3>
    <p><strong>Weekdays:</strong> {neon.maintenance.weekdays.join(", ")}</p>
    <p><strong>Start:</strong> {neon.maintenance.start}</p>
    <p><strong>End:</strong> {neon.maintenance.end}</p>

    <h3 className="font-semibold mt-3">Replication</h3>
    <p><strong>Logical Replication:</strong> {String(neon.replication.logicalReplication)}</p>

    <h3 className="font-semibold mt-3">Timestamps</h3>
    <p><strong>Created:</strong> {neon.timestamps.createdAt}</p>
    <p><strong>Updated:</strong> {neon.timestamps.updatedAt}</p>
    <p><strong>Compute Last Active:</strong> {neon.timestamps.computeLastActiveAt}</p>
  </div>
</section>


      {/* GITHUB */}
      <section className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">GitHub</h2>
        <div className="space-y-1">
          <p>
            <strong>Latest Commit:</strong>{" "}
            {github.latestCommit?.commit?.message}
          </p>
          <p>
            <strong>SHA:</strong>{" "}
            <a
              href={github.latestCommit?.url}
              target="_blank"
              className="text-blue-500 underline"
            >
              {github.latestCommit?.sha}
            </a>
          </p>
          <p>
            <strong>Author:</strong> {github.latestCommit?.commit?.author?.name}
          </p>
          <p>
            <strong>Workflow:</strong> {github.latestWorkflow?.name}
          </p>
          <p>
            <strong>Job Name:</strong> {github.latestWorkflow?.jobName}
          </p>
          <p>
            <strong>Workflow Status:</strong>{" "}
            {github.latestWorkflow?.conclusion}
          </p>
        </div>
      </section>
    </div>
  );
}
