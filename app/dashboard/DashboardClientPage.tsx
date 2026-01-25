"use client";

import GitHubActivityFeed from "@/app/components/github/GitHubActivityFeed";
import CurrentWeatherCard from "@/app/components/dashboard/current-weather-card";

export async function DashboardClientPage({ data }: { data: any }) {
  // Default location for weather (you can make this dynamic later)
  const defaultLocation = {
    id: "KOP",
    key: "kop",
    name: "King of Prussia, PA",
    latitude: 40.0956,
    longitude: -75.3516,
    timezone: "America/New_York",
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
        <CurrentWeatherCard location={defaultLocation} />

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
