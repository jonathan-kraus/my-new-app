"use server";
// app\components\SideNavNextEvent.tsx

import { getAstronomySnapshot } from "@/lib/astronomy/getAstronomySnapshot";
import { buildAstronomyEvents } from "@/lib/ephemeris/buildAstronomyEvents";
import SideNavClient from "./SideNavClient";

export default async function SideNavNextEvent() {
  const { today, tomorrow } = await getAstronomySnapshot("KOP");

  // If the cron hasn't populated data yet
  if (!today || !tomorrow) {
    return <SideNavClient nextEventLabel="—" nextEventTime={null} />;
  }

  const events = buildAstronomyEvents(today, tomorrow);
  const next = events[0];

  return (
    <SideNavClient
      nextEventLabel={next?.label ?? "—"}
      nextEventTime={next?.time ?? null}
    />
  );
}
