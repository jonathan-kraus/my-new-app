// app/components/SideNav.tsx
"use server";

import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import SideNavClient from "./SideNavClient";

export default async function SideNav() {
  const snapshot = await getEphemerisSnapshot("KOP");

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
