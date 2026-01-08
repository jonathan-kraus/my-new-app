"use client";

import useSWR from "swr";
import { Github, Triangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export function RecentActivity() {
  const { data: gh } = useSWR("/api/activity/github", fetcher);
  const { data: vc } = useSWR("/api/activity/vercel", fetcher);

  if (!gh || !vc) return <div>Loading activity…</div>;

  // Normalize GitHub workflow events into a clean shape
  const githubItems = gh.map((d: any) => ({
    type: "github",
    id: d.id,
    workflowName: d.workflowName,
    runNumber: d.runNumber,
    conclusion: d.conclusion,
    branch: d.branch,
    commitMessage: d.commitMessage,
    actor: d.actor,
    url: d.url,
    timestamp: d.timestamp,
  }));

  // Normalize Vercel events (unchanged)
  const vercelItems = vc.map((d: any) => ({
    type: "vercel",
    id: d.id,
    state: d.state,
    url: d.url,
    createdAt: d.createdAt,
  }));

  const items = [...githubItems, ...vercelItems].sort(
    (a, b) =>
      new Date(b.timestamp || b.createdAt).getTime() -
      new Date(a.timestamp || a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Activity</h2>

      <ul className="space-y-3">
        {items.map((item: any) => (
          <li key={item.id} className="rounded border p-3 bg-white/5">
            {/* Header Row */}
            <div className="flex items-center gap-2">
              {item.type === "github" ? (
                <Github className="w-4 h-4" />
              ) : (
                <Triangle className="w-4 h-4" />
              )}

              {/* GitHub workflow event */}
              {item.type === "github" && (
                <span className="font-medium">
                  {item.workflowName} #{item.runNumber}
                </span>
              )}

              {/* Vercel event */}
              {item.type === "vercel" && (
                <span className="font-medium">{item.url}</span>
              )}

              <span className="ml-auto">
                {item.type === "github" ? (
                  item.conclusion === "success" ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : item.conclusion === "failure" ? (
                    <XCircle className="w-4 h-4 text-red-500" />
                  ) : (
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  )
                ) : item.state === "READY" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : item.state === "ERROR" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                )}
              </span>
            </div>

            {/* GitHub workflow details */}
            {item.type === "github" && (
              <>
                <div className="mt-1 text-sm text-zinc-300">
                  {item.commitMessage}
                </div>

                <div className="text-xs text-zinc-500">
                  {item.actor} pushed to{" "}
                  <span className="text-zinc-300">{item.branch}</span>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  className="mt-2 inline-block text-xs text-blue-400 hover:underline"
                >
                  View workflow →
                </a>
              </>
            )}

            {/* Timestamp */}
            <div className="text-xs text-gray-400 mt-2">
              {formatDistanceToNow(new Date(item.timestamp || item.createdAt), {
                addSuffix: true,
              })}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
