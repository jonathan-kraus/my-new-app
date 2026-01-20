// app/github/page.tsx
import { GitHubActivityCard } from "@/app/components/github/GitHubActivityCard";
import { GitHubActivityEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

async function fetchGitHubEvents(): Promise<GitHubActivityEvent[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/activity/github`,
    {
      cache: "no-store",
    },
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

export default async function GitHubPage() {
  const events = await fetchGitHubEvents();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">GitHub Activity</h1>

      {events.length === 0 && (
        <p className="text-gray-400">No recent GitHub events found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, i) => (
          <GitHubActivityCard key={i} event={event} />
        ))}
      </div>
    </div>
  );
}
