// app/ClientNav.tsx - 'use client'
"use client";
import { usePathname } from "next/navigation";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ClientNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white shadow-lg z-50">
      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            padding: "0.5rem 0",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          Apps
        </div>

        <Link href="/" className="nav-active">
          🏠 Dashboard
        </Link>
        <Link href="/forecast" className="nav-link">
          🌤️ Forecast
        </Link>
        <Link href="/notes" className="nav-link">
          📝 Notes
        </Link>
        <Link href="/logs" className="nav-link">
          📝 Logs
        </Link>
        <Link
          href="/astronomy"
          onClick={() => {
            window.dispatchEvent(new Event("launch-sequence"));
          }}
          className={`block px-4 py-2 rounded-md transition-colors ${
            pathname === "/astronomy"
              ? "bg-blue-700 text-white font-semibold"
              : "hover:bg-blue-800 text-blue-100"
          }`}
        >
          🚀 Astronomy
        </Link>
        <Link
          href="/forecast"
          onClick={() => {
            window.dispatchEvent(new Event("launch-sequence"));
          }}
          className={`block px-4 py-2 rounded-md transition-colors ${
            pathname === "/forecast"
              ? "bg-blue-700 text-white font-semibold"
              : "hover:bg-blue-800 text-blue-100"
          }`}
        >
          ☀️ Forecast
        </Link>

        <Link href="/weather-maps" className="nav-link">
          🗺️ Weather Maps
        </Link>
      </nav>

      {/* Logout */}
      {session && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button onClick={() => authClient.signOut()} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
