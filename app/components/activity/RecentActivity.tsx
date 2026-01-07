"use client";

import useSWR from "swr";
import { Github, Triangle, CheckCircle, XCircle, Loader2 } from "lucide-react";

const fetcher = (url: string) => fetch(url, { credentials: "include" }).then((res) => res.json());

export function RecentActivity() {
  const { data: gh } = useSWR("/api/activity/github", fetcher);
  const { data: vc } = useSWR("/api/activity/vercel", fetcher);

  if (!gh || !vc) return <div>Loading activity…</div>;

  const items = [
    ...gh.map((d: any) => ({ type: "github", ...d })),
    ...vc.map((d: any) => ({ type: "vercel", ...d })),
  ].sort(
    (a, b) =>
      new Date(b.created_at || b.createdAt).getTime() -
      new Date(a.created_at || a.createdAt).getTime(),
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Activity</h2>

      <ul className="space-y-3">
        {items.map((item: any) => (
          <li key={item.id} className="rounded border p-3 bg-white/5">
            <div className="flex items-center gap-2">
              {item.type === "github" ? (
                <Github className="w-4 h-4" />
              ) : (
                <Triangle className="w-4 h-4" />
              )}

              <span className="font-medium">{item.ref || item.url}</span>

              <span className="ml-auto">
                {item.state === "READY" || item.status === "success" ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : item.state === "ERROR" || item.status === "failure" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                )}
              </span>
            </div>

            <div className="text-sm text-gray-400">
              {new Date(item.created_at || item.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
