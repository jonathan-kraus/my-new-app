"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function Sidebar() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <aside className="flex h-screen w-64 flex-col bg-blue-600 text-white">
      {/* Header */}
      <div className="border-b border-blue-500 p-4 text-xl font-semibold">
        App Monitor
      </div>

      {/* User Section */}
      <div className="border-b border-blue-500 p-4">
        {isPending ? (
          <p className="text-sm opacity-75">Loading…</p>
        ) : session ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {session.user.email}
            </p>
            <button
              onClick={() => authClient.signOut()}
              className="w-full rounded bg-blue-700 px-3 py-1 text-sm hover:bg-blue-800"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => authClient.signIn.social({ provider: "github" })}
            className="w-full rounded bg-blue-700 px-3 py-2 text-sm hover:bg-blue-800"
          >
            Sign in with GitHub
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 p-4">
        <Link href="/" className="nav-link">
          🏠 Dashboard
        </Link>
        <Link href="/forecast" className="nav-link">
          🌤️ Forecast
        </Link>
        <Link href="/notes" className="nav-link">
          📝 Notes
        </Link>
        <Link href="/weather-maps" className="nav-link">
          🗺️ Weather Maps
        </Link>
      </nav>
    </aside>
  );
}
