// app/components/SideNav.tsx
"use server";

import { buildEphemerisSnapshot } from "@/lib/ephemeris/buildEphemerisSnapshot";
import SideNavClient from "./SideNavClient";

export default async function SideNav() {
  const snapshot = await buildEphemerisSnapshot("KOP");

  if (!snapshot?.nextEvent) {
    return <SideNavClient nextEventLabel="—" nextEventTime={null} />;
  }

  return (
    <SideNavClient
      nextEventLabel={snapshot.nextEvent.name}
      nextEventTime={snapshot.nextEvent.dateObj}
    />
  );
}
