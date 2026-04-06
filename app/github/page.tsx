// app/github/page.tsx
import { GitHubActivityCard } from "@/app/components/github/GitHubActivityCard";
import { GitHubActivityEvent } from "@/lib/types";
import { staticUniversalContext } from "@/lib/log/buildj";
import { logj } from "@/lib/log/logj";

export const dynamic = "force-dynamic";
console.log("🌟 Rendering GitHub activity page");
async function fetchGitHubEvents(): Promise<GitHubActivityEvent[]> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/activity/github`, {
		cache: "no-store",
	});

	if (!res.ok) return [];
	const data = await res.json();
	return data.activity ?? [];
}

export default async function GitHubPage() {
	const events = await fetchGitHubEvents();
	const built = staticUniversalContext("GitHubPage");
	// new log below
	await logj({
    domain: "github",
    level: "info",
    message: `fetchGitHubEvents returned ${events.length} events`,
    file: "app/github/page.tsx",
    line: 23,
    payload: {
      eventCount: events.length,
    },
    meta: {
          built,
        },
      });

	// new log above
	return (
		<div className="p-6 space-y-6">
			<h1 className="text-2xl font-bold text-white">GitHub Activity</h1>

			{events.length === 0 && <p className="text-gray-400"> No recent GitHub events found. </p>}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{events.map((event, i) => (
					<GitHubActivityCard key={i} event={event} />
				))}
			</div>
		</div>
	);
}
