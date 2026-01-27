"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLiveCountdown } from "@/hooks/useLiveCountdown";

export function SideNavClient({
  event,
  navItems,
}: {
  event: {
    name: string;
    timestamp: string;
  };
  navItems: { href: string; label: string; icon: string }[];
}) {
  const pathname = usePathname();
  const [now, setNow] = useState(new Date());

  // Live countdown update
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = useLiveCountdown(new Date(event.timestamp));

  return (
    <aside className="w-64 h-screen flex flex-col bg-gradient-to-b from-blue-600 to-blue-900 text-white shadow-xl">
      <nav className="flex-1 p-4 space-y-2">
        {/* Header with countdown */}
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60 mb-2">
          <span>Apps</span>
          <span className="text-[10px] lowercase text-white/70">
            {event.name}: {countdown}
          </span>
        </div>

        {/* Navigation items */}
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
