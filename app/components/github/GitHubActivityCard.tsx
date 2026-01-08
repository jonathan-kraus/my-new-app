import { GitHubActivityEvent } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export function GitHubActivityCard({ event }: { event: GitHubActivityEvent }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">
            CI #{event.runNumber}
          </span>

          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              event.conclusion === "success"
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {event.conclusion}
          </span>
        </div>

        <span className="text-xs text-zinc-500">
          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
        </span>
      </div>

      <div className="mt-2 text-sm text-zinc-300">
        <span className="font-medium">{event.commitMessage}</span>
      </div>

      <div className="mt-1 text-xs text-zinc-500">
        {event.actor} pushed to{" "}
        <span className="text-zinc-300">{event.branch}</span>
      </div>

      <a
        href={event.url}
        target="_blank"
        className="mt-3 inline-block text-xs text-blue-400 hover:underline"
      >
        View workflow run →
      </a>
    </div>
  );
}
