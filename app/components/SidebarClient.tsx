// app/components/SidebarClient.tsx  (CLIENT)
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function SidebarClient() {
  const pathname = usePathname();

  const link = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={clsx(
        "block rounded px-3 py-2 text-sm",
        pathname === href
          ? "bg-blue-500/60 font-semibold"
          : "hover:bg-blue-500/40"
      )}
    >
      {label}
    </Link>
  );

  return (
    <nav className="mt-2 flex flex-col gap-1 px-4">
      {link("/", "Dashboard")}
      {link("/logs", "Logs")}
      {link("/forecast", "Forecast")}
      {link("/notes", "Notes")}
      {link("/astronomy", "Astronomy")}
      {link("/ping", "Ping")}
    </nav>
  );
}
