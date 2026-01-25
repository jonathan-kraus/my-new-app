"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUnifiedAstronomyCountdown } from "@/hooks/useUnifiedAstronomyCountdown";

export default function SideNav() {
  const pathname = usePathname();

  const [astro, setAstro] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/astronomy")
      .then((res) => res.json())
      .then((data) => setAstro(data))
      .catch(() => setAstro(null));
  }, []);

  const { label: nextLabel, countdown } = useUnifiedAstronomyCountdown(astro);

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/ping", label: "Ping", icon: "🛠️" },
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-gradient-to-b from-blue-600 to-blue-900 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60 mb-2">
          <span>Apps</span>
          {nextLabel && countdown && (
            <span className="text-[10px] lowercase text-white/70">
              {nextLabel}: {countdown}
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all
                ${active ? "bg-white/20 shadow-md translate-x-1" : "hover:bg-white/10"}
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
