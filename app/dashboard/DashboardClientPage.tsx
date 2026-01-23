"use client";

import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";
import GitHubActivityFeed from "@/app/components/github/GitHubActivityFeed";

export async function DashboardClientPage({ data }: { data: any }) {
  // -----------------------------

  return (
    <div className="space-y-10 w-full">
      {/* GitHub Activity Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-6">GitHub Activity</h2>
        <GitHubActivityFeed />
      </section>

      {/* Other dashboard sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PlaceholderCard title="Weather" />
        <PlaceholderCard title="Vercel Deployments" />
        <PlaceholderCard title="Recent Logs" />
        <PlaceholderCard title="System Health" />
        <PlaceholderCard title="Custom Metrics" />
      </section>
    </div>
  );
}

// -----------------------------
// Simple placeholder card
// -----------------------------
function PlaceholderCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border bg-black/20 p-4 text-white shadow-lg backdrop-blur">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="opacity-70">Coming soon…</p>
    </div>
  );
}
