"use client";
/*
 * @FilePath: \my-new-app\app\components\SideNavClient.tsx
 * @LastEditTime: 2026-09-04 08:49:01
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { NextEventCard } from "@/app/components/astronomy/NextEventCard";
import { useSideNavActivationCounter } from "@/app/hooks/useSideNavActivationCounter";
import { EmailSideNavLink } from "@/app/components/sidenav/EmailLink";
import { staticUniversalContext } from "@/lib/log/buildj";
import { usePathname } from "next/navigation";
import { assertNonEmptyArray } from "@/lib/db/safe";
import { logj } from "@/lib/log/logj";
type SideNavClientProps = {
  nextEventLabel: string;
  nextEventTime: Date | null;
};

export default function SideNavClient({
  nextEventLabel,
  nextEventTime,
}: SideNavClientProps) {
  const activations = useSideNavActivationCounter();
  const pathname = usePathname();
  const [formattedVersion, setFormattedVersion] = useState<string | null>(null);

  useEffect(() => {
    async function loadVersion() {
      try {
        const v = await import("../../version.json");
        const [major, minor, patch] = v.version.split(".") as [
          string,
          string,
          string,
        ];

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
    { href: "/dashboard", label: "Dashboard", icon: "📊", prefetch: false },
    {
      href: "/dashboard/astronomy",
      label: "Astronomy",
      icon: "🚀",
      prefetch: false,
    },
    {
      href: "/dashboard/environment",
      label: "Environment",
      icon: "🌐",
      prefetch: false,
    },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/profile", label: "Profile", icon: "👤" },
    { href: "/logview", label: "Logview", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/ping?run=11", label: "Ping", icon: "🛠️" },
    { href: "/green-c", label: "MBTA", icon: "🚋" },
    { href: "/travel/next", label: "Travel", icon: "✈️" },
    {
      href: "/fa/dashboard",
      label: "Flight Dashboard",
      icon: "✈️",
      prefetch: false,
    },
    { href: "/admin/runtime", label: "Runtime", icon: "🛠️" },
    { href: "/config/create", label: "Config/create", icon: "🛠️" },
    { href: "/config/read", label: "Config/read", icon: "🛠️" },
    { href: "/admin/db", label: "Tables", icon: "🛢️" },
    {
      href: "/database-explorer",
      label: "Database Explorer",
      icon: "🛢️",
      prefetch: false,
    },
  ];

  let jei = 0;

  useEffect(() => {
    if (!formattedVersion) return;
    const built = staticUniversalContext("side-nav");
    logj({
      domain: "SideNavClient",
      level: "info",
      message: `🧭 in SideNav ${pathname}`,
      file: "app/components/SideNavClient.tsx",
      line: 100,
      payload: {
        version: formattedVersion,
        activations,
      },
      meta: { built: { ...built, eventIndex: ++jei } },
    });
    console.log("SideNavClient loaded with version:", formattedVersion);
  }, [formattedVersion, activations, navItems]);

  return (
    <aside className="w-64 h-screen flex flex-col bg-slate-950 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-linear-to-b from-blue-600 via-blue-700 to-transparent">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : // : pathname === item.href || pathname.startsWith(item.href + "/");
                pathname === item.href || pathname.startsWith("FQ");

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={item.prefetch ?? true}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "bg-white/20 font-semibold border-l-2 border-white"
                  : "hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}

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
