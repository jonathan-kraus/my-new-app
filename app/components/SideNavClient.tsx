"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NextEventCard } from "@/app/components/astronomy/NextEventCard";
import { useSideNavActivationCounter } from "@/app/hooks/useSideNavActivationCounter";
import { EmailSideNavLink } from "@/app/components/sidenav/EmailLink";

type SideNavClientProps = {
  nextEventLabel: string;
  nextEventTime: Date | null;
};

export default function SideNavClient({
  nextEventLabel,
  nextEventTime,
}: SideNavClientProps) {
  const activations = useSideNavActivationCounter();

  // --- NEW: state for formatted version ---
  const [formattedVersion, setFormattedVersion] = useState<string | null>(null);

  // --- Load version.json on client only ---
  useEffect(() => {
    async function loadVersion() {
      try {
        const v = await import("../../version.json");
        const [major, minor, patch] = v.version.split(".");

        const formatted = [
          major.padStart(2, "0"),
          minor.padStart(2, "0"),
          patch.padStart(2, "0"),
        ].join(".");

        setFormattedVersion(formatted);
      } catch (err) {
        console.error("Failed to load version.json", err);
      }
    }

    loadVersion();
  }, []);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/ping", label: "Ping", icon: "🛠️" },
    { href: "/travel/next", label: "Travel", icon: "✈️" },
    { href: "/fa/dashboard", label: "Flight Dashboard", icon: "✈️" },
    { href: "/admin/runtime", label: "Runtime", icon: "🛠️" },
    { href: "/config/create", label: "Config/create", icon: "🛠️" },
    { href: "/config/read", label: "Config/read", icon: "🛠️" },
    { href: "/admin/db", label: "Tables", icon: "🛢️" },
    { href: "/database-explorer", label: "Database Explorer", icon: "🛢️" },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-slate-950 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-gradient-to-b from-blue-600 via-blue-700 to-transparent">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="mt-6">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M4 4h16v16H4z" />
              <path d="M4 4l8 8 8-8" />
            </svg>
            <EmailSideNavLink />
          </div>

          <NextEventCard
            nextEvent={nextEventLabel}
            nextEventTime={nextEventTime}
          />
        </div>

        <div className="text-xs opacity-60 mt-4">
          SideNav activations: {activations}
        </div>

        <div className="text-xs opacity-75 text-yellow-300 mt-1">
          Version: {formattedVersion ?? "…"}
        </div>
      </nav>
    </aside>
  );
}
