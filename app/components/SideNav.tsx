"use client";

import { useEffect, useState } from "react";
import SideNavClient from "./SideNavClient";

type EphemerisSnapshot = {
  nextEvent: {
    name: string;
    dateObj: string; // JSON always returns a string
  } | null;
};

export default function SideNav() {
  const [snapshot, setSnapshot] = useState<EphemerisSnapshot | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/ephemeris?loc=KOP");
        const data: EphemerisSnapshot = await res.json();
        setSnapshot(data);
      } catch (err) {
        console.error("Failed to load ephemeris snapshot:", err);
        setSnapshot(null);
      }
    }

    load();
  }, []);

  if (!snapshot?.nextEvent) {
    return <SideNavClient nextEventLabel="—" nextEventTime={null} />;
  }

  return (
    <SideNavClient
      nextEventLabel={snapshot.nextEvent.name}
      nextEventTime={
        snapshot.nextEvent.dateObj
          ? new Date(snapshot.nextEvent.dateObj)
          : null
      }
    />
  );
}
