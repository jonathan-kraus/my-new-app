"use client";

import Link from "next/link";
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

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/ping", label: "Ping", icon: "🛠️" },
    { href: "/admin/runtime", label: "Runtime", icon: "🛠️" },
    { href: "/debug/timestamps", label: "Timestamps", icon: "🛠️" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-gradient-to-b from-blue-600 to-blue-900 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2">
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
              {" "}
              <path d="M4 4h16v16H4z" /> <path d="M4 4l8 8 8-8" />{" "}
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
      </nav>
    </aside>
  );
}
