/*
 * @FilePath: \my-new-app\app\dashboard\components\EnvironmentStatus.tsx
 * @LastEditTime: 2026-06-18 09:36:51
 */
"use client";

import { useEffect, useState } from "react";

type EnvResponse = {
  vercel: {
    project: any;
    latestDeployment: any;
  };
  neon: {
    primaryEndpoint: any;
    project: any;
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
            <strong>Framework:</strong> {vercel.project?.framework}
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
          <p>
            <strong>Compute Endpoint:</strong> {neon.primaryEndpoint?.name}
          </p>
          <p>
            <strong>Attached Branch:</strong>{" "}
            {neon.primaryEndpoint?.branch?.name}
          </p>
          <p>
            <strong>Status:</strong> {neon.primaryEndpoint?.status}
          </p>
          <p>
            <strong>Region:</strong> {neon.primaryEndpoint?.region_id}
          </p>
          <p>
            <strong>Project:</strong> {neon.project?.project?.name}
          </p>
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
            <strong>Author:</strong> {github.latestCommit?.commit?.author?.name}
          </p>
          <p>
            <strong>Workflow:</strong> {github.latestWorkflow?.name}
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
