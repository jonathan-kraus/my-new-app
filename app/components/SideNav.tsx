"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/debug/github", label: "Debug GitHub", icon: "🛠️" },

    // ⭐ NEW: Profile page link
    { href: "/profile", label: "Profile", icon: "👤" },
  ];

  return (
    <aside className="w-64 h-screen flex flex-col bg-gradient-to-b from-blue-600 to-blue-900 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2">
        <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
          Apps
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
