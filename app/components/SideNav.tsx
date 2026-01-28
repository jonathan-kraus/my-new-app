"use server";
// app/components/SideNav.tsx

import { getEphemerisSnapshot } from "@/lib/ephemeris/getEphemerisSnapshot";
import { SideNavClient } from "./SideNavClient";
import { logit } from "@/lib/log/logit";
export default async function SideNav() {
  await logit(
    "Jonathan",
    {
      level: "info",
      message: "SideNav started",
    },
    { second1: 1, second2: "2" },
  );
  // Fetch astronomy snapshot on the server
  const snapshot = await getEphemerisSnapshot("KOP");
  const event = snapshot.nextEvent;

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/ping", label: "Ping", icon: "🛠️" },
    { href: "/api/sendTestEmail", label: "Ping", icon: "🛠️" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return <SideNavClient event={event} navItems={navItems} />;
}
