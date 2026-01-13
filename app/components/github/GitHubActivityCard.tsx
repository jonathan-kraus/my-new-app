"use client";

import { GitHubActivityEvent } from "@/lib/types";

export function GitHubActivityCard({ event }: { event: GitHubActivityEvent }) {
  const {
    name,
    repo,
    status,
    conclusion,
    event: eventType,
    actor,
    commitMessage,
    commitSha,
    url,
    updatedAt,
  } = event;

  const fmt = (d: string | Date) =>
    new Date(d).toLocaleString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });

  const statusIcon = (() => {
    if (status === "in_progress") return "⟳";
    if (conclusion === "success") return "✓";
    if (conclusion === "failure") return "✗";
    return "•";
  })();

  const statusColor = (() => {
    if (status === "in_progress") return "text-blue-400";
    if (conclusion === "success") return "text-green-400";
    if (conclusion === "failure") return "text-red-400";
    return "text-gray-400";
  })();

  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{name}</h3>
        <span className={`text-xl ${statusColor}`}>{statusIcon}</span>
      </div>

      {/* Repo */}
      <p className="text-sm opacity-80">{repo}</p>

      {/* Timestamp */}
      <p className="text-sm opacity-80">{fmt(updatedAt)}</p>

      {/* Commit message */}
      {commitMessage && (
        <p className="text-sm mt-1 line-clamp-2 opacity-90">
          <span className="opacity-60">Commit:</span> {commitMessage}
        </p>
      )}

      {/* Footer row */}
      <div className="flex justify-between text-xs opacity-70 mt-2">
        <span>{eventType}</span>
        <span>{actor}</span>
      </div>

      {/* Link */}
      {url && (
        <a
          href={url}
          target="_blank"
          className="text-blue-400 text-sm underline mt-2 inline-block"
        >
          View on GitHub →
        </a>
      )}
    </div>
  );
}
