"use client";

import { SolarCard } from "@/app/astronomy/SolarCard";
import { LunarCard } from "@/app/astronomy/LunarCard";
import { UnifiedNextAstronomicalEventCard } from "@/app/astronomy/UnifiedNextAstronomicalEventCard";
import { CombinedSolarLunarTimeline } from "@/app/astronomy/CombinedSolarLunarTimeline";

import { parseLocalTimestamp, parseLocalTimestampTomorrow } from "@/lib/time";
import { GitHubActivityCard } from "../components/github/GitHubActivityCard";

export async function DashboardClientPage({ data }: { data: any }) {
  // -----------------------------
  // Fetch GitHub activity
  const githubRes = await fetch("https://www.kraus.my.id/api/activity/github", {
    cache: "no-store",
  });
  const githubData = await githubRes.json();
  const recentActivity = githubData.activity ?? [];
  // -----------------------------

  // -----------------------------
  // SOLAR (parsed snapshots)
  // -----------------------------
  const solarToday = {
    sunrise: parseLocalTimestamp(data.today.sunrise),
    sunset: parseLocalTimestamp(data.today.sunset),
  };

  const solarTomorrow = {
    sunrise: parseLocalTimestampTomorrow(data.tomorrow.sunrise),
    sunset: parseLocalTimestampTomorrow(data.tomorrow.sunset),
  };

  // -----------------------------
  // LUNAR (parsed snapshots)
  // -----------------------------
  const lunarToday = {
    moonrise: parseLocalTimestamp(data.today.moonrise),
    moonset: parseLocalTimestamp(data.today.moonset),
    moonPhase: data.today.moonPhase,
  };

  const lunarTomorrow = {
    moonrise: parseLocalTimestampTomorrow(data.tomorrow.moonrise),
    moonset: parseLocalTimestampTomorrow(data.tomorrow.moonset),
  };

  return (
    <div className="space-y-10 w-full">
      {/* Full-width unified next event */}
      <UnifiedNextAstronomicalEventCard
        solarToday={solarToday}
        solarTomorrow={solarTomorrow}
        lunarToday={lunarToday}
        lunarTomorrow={lunarTomorrow}
      />

      {/* Full-width combined timeline */}
      <CombinedSolarLunarTimeline
        solarToday={data.today} // raw snapshots (timeline expects full shape)
        solarTomorrow={data.tomorrow}
        lunarToday={data.today}
        lunarTomorrow={data.tomorrow}
      />

      {/* Two-column astronomy cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolarCard today={solarToday} tomorrow={solarTomorrow} />
        <LunarCard today={lunarToday} tomorrow={lunarTomorrow} />
      </section>

      {/* Placeholder section */}
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
