import { GitHubActivityEvent } from "@/lib/types";

export function GitHubActivityCard({ event }: { event: GitHubActivityEvent }) {
  return (
    <div className="p-4 border rounded-md space-y-1">
      <div className="flex justify-between">
        <span className="font-semibold">{event.name}</span>
        <span className="text-sm text-gray-500">{event.status}</span>
      </div>

      <div className="text-sm text-gray-600">
        {event.repo}
      </div>

      <div className="text-xs text-gray-500">
        Created: {new Date(event.createdAt).toLocaleString()}
      </div>

      <div className="text-xs text-gray-500">
        Updated: {new Date(event.updatedAt).toLocaleString()}
      </div>

      <a
        href={`https://github.com/${event.repo}/actions/runs/${event.id}`}
        className="text-blue-600 text-sm"
      >
        View on GitHub
      </a>
    </div>
  );
}

