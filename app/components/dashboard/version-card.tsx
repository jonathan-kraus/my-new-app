"use client";
// app\components\dashboard\version-card.tsx
import { useVersionSWR } from "@/hooks/useVersionSWR";
import { logj } from "@/lib/log/client";
import { staticUniversalContext } from "@/lib/log/buildj";
import { VercelCard } from "@/components/dashboard/vercel-card"

const built = await staticUniversalContext("dashboard");
let jei = 0;

logj({
  domain: "dashboard",
  level: "info",
  message: "VersionCard loaded",
  file: "app\components\dashboard\version-card.tsx",
  line: 9,
  payload: { some: "Version Card loaded" },
  meta: { built: { ...built, eventIndex: ++jei } },
});

export default function VersionCard() {
  const { data, loading, error } = useVersionSWR("all");

  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return <VercelCard data={data} />;
}