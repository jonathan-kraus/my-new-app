"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function Sidebar() {
  const pathname = usePathname();

  const items = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Logs", href: "/logs" },
    { name: "Notes", href: "/notes" },
    { name: "Astronomy", href: "/astronomy" },
    { name: "Ping", href: "/api/ping" },
  ];

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-blue-600 to-blue-700 text-white p-4 shadow-lg">
      <nav className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "block px-4 py-2 rounded-md transition-all",
                active
                  ? "bg-white text-blue-700 font-semibold shadow"
                  : "hover:bg-blue-500/40",
              )}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
