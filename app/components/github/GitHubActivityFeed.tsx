"use client";

import { useEffect, useState } from "react";
import { GitHubActivityCard } from "./GitHubActivityCard";
import { GitHubActivityEvent } from "@/lib/types";

export default function GitHubActivityFeed() {
  const [activities, setActivities] = useState<GitHubActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<"repositories" | "user" | "workflows">(
    "repositories",
  );
  const [username, setUsername] = useState("");
  const [repos, setRepos] = useState("owner1/repo1,owner2/repo2"); // Default repos

  useEffect(() => {
    fetchActivity();
  }, [type, username, repos]);

  const fetchActivity = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        type,
        limit: "15",
      });

      if (type === "user" && username) {
        params.append("username", username);
      } else if (type === "repositories" && repos) {
        params.append("repos", repos);
      }

      const response = await fetch(`/api/github/activity?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform the data to match the expected format for GitHubActivityCard
      const transformedActivities: GitHubActivityEvent[] = data.data.map(
        (item: any, index: number) => ({
          id: item.sha || `${item.repo}-${index}`,
          name: item.name || `${item.owner}/${item.repo}`,
          repo: `${item.owner}/${item.repo}`,
          status: item.status || "completed",
          conclusion: item.conclusion || "success",
          event: item.type,
          actor: item.author,
          commitMessage: item.message,
          commitSha: item.sha?.substring(0, 7),
          url: item.url,
          createdAt: item.date,
          updatedAt: item.date,
          source: "github" as const,
        }),
      );

      setActivities(transformedActivities);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-black/20 p-4 animate-pulse"
          >
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-3 bg-gray-600 rounded mb-1"></div>
            <div className="h-3 bg-gray-600 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <p className="text-red-400">Error loading GitHub activity: {error}</p>
        <button
          onClick={fetchActivity}
          className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-black/20 rounded-lg p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setType("repositories")}
            className={`px-3 py-1 rounded ${
              type === "repositories"
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            Repositories
          </button>
          <button
            onClick={() => setType("user")}
            className={`px-3 py-1 rounded ${
              type === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            User Activity
          </button>
          <button
            onClick={() => setType("workflows")}
            className={`px-3 py-1 rounded ${
              type === "workflows"
                ? "bg-blue-500 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            Workflows
          </button>
        </div>

        {type === "user" && (
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="GitHub username"
            className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded text-white placeholder-gray-400"
          />
        )}

        {type === "repositories" && (
          <input
            type="text"
            value={repos}
            onChange={(e) => setRepos(e.target.value)}
            placeholder="owner1/repo1,owner2/repo2"
            className="w-full px-3 py-2 bg-black/30 border border-gray-600 rounded text-white placeholder-gray-400"
          />
        )}

        <button
          onClick={fetchActivity}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>

      {/* Activity Feed */}
      {activities.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No recent activity found
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <GitHubActivityCard
              key={`${activity.repo}-${activity.commitSha || index}`}
              event={activity}
            />
          ))}
        </div>
      )}
    </div>
  );
}
