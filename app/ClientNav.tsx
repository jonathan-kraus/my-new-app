"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import ClientProfileCard from "@/app/ClientProfileCard";

export default function ClientNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [launching, setLaunching] = useState(false);

  const link = (href: string, label: string, icon: string) => (
    <Link
      href={href}
      className={`block px-4 py-2 rounded-md transition-colors ${
        pathname === href
          ? "bg-blue-700 text-white font-semibold"
          : "hover:bg-blue-800 text-blue-100"
      }`}
    >
      {icon} {label}
    </Link>
  );

  // 🚀 Astronomy Launch Link
  const astronomyLink = (
    <button
      onClick={() => {
        if (launching) return;
        setLaunching(true);

        // Trigger navigation after animation
        setTimeout(() => {
          router.push("/astronomy");
        }, 700);
      }}
      className={`block px-4 py-2 rounded-md transition-all relative overflow-hidden
        ${
          pathname === "/astronomy"
            ? "bg-blue-700 text-white font-semibold"
            : "hover:bg-blue-800 text-blue-100"
        }`}
    >
      <span
        className={`inline-block transition-transform ${
          launching ? "animate-rocket-launch" : ""
        }`}
      >
        🚀
      </span>{" "}
      Astronomy
    </button>
  );

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white shadow-lg z-50">
      {/* Profile */}
      <nav className="flex flex-col h-full p-4 gap-2">
        <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
          Apps
        </div>

        {link("/", "Home", "🏠")}
        {link("/dashboard", "Dashboard", "🏠")}
        {link("/forecast", "Forecast", "🌤️")}
        {link("/notes", "Notes", "📝")}
        {link("/logs", "Logs", "📄")}
        {link("/ping", "Ping", "📡")}

        {astronomyLink}

        {link("/weather-maps", "Weather Maps", "🗺️")}

        <div className="text-xs uppercase tracking-wide text-white/60 mt-6 mb-2">
          Admin
        </div>

        {link("/admin/runtime", "Runtime Config", "⚙️")}

        <div className="mt-auto pt-4 border-t border-white/10">
          <ClientProfileCard />
        </div>
      </nav>
      {session && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => authClient.signOut()}
            className="logout-btn w-full text-left"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
