// app/components/ServerSidebar.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function ServerSidebar() {
  const session = await getServerSession(authOptions);

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-2xl min-h-screen p-6 flex flex-col border-r border-blue-400/50">
      {/* Logo/Header */}
      <div className="mb-12 pb-8 border-b border-blue-400/30">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
          Weather Hub
        </h1>
        <p className="text-blue-200 text-sm font-medium">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Auth Section */}
      <div className="mb-10 pb-8 border-b border-blue-400/30">
        {session?.user ? (
          <Link
            href="/profile"
            className="group flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-sm transition-all duration-200 border border-white/20"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 ring-2 ring-white/30 group-hover:ring-white/50 overflow-hidden">
              <img
                src={session.user.image || "/default-avatar.png"}
                alt={session.user.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{session.user.name}</p>
              <p className="text-xs text-blue-200 truncate">
                {session.user.email}
              </p>
            </div>
            <svg
              className="w-4 h-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        ) : (
          <a
            href="/api/auth/signin/github"
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-2xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50 hover:scale-[1.02]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.035-.303-.535-1.523.117-3.176 0 0 1.005-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.152 2.873.118 3.176.770.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>Sign in GitHub</span>
          </a>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <Link
          href="/"
          className="flex items-center space-x-4 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-sm font-medium transition-all duration-200 border border-white/20 hover:border-white/40 hover:scale-[1.02]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span>Dashboard</span>
        </Link>

        <Link
          href="/forecast"
          className="flex items-center space-x-4 px-4 py-3 hover:bg-white/20 rounded-2xl backdrop-blur-sm font-medium transition-all duration-200 border border-transparent hover:border-white/40 hover:scale-[1.02]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.27 2.7c.74.28 1.47.28 2.21 0L21 8M12 15v4m0 0l-3.36-3.36M12 19l3.36-3.36M3 3h18v8H3V3z"
            />
          </svg>
          <span>Forecast</span>
        </Link>

        <Link
          href="/notes"
          className="flex items-center space-x-4 px-4 py-3 hover:bg-white/20 rounded-2xl backdrop-blur-sm font-medium transition-all duration-200 border border-transparent hover:border-white/40 hover:scale-[1.02]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span>Notes</span>
        </Link>

        <Link
          href="/maps"
          className="flex items-center space-x-4 px-4 py-3 hover:bg-white/20 rounded-2xl backdrop-blur-sm font-medium transition-all duration-200 border border-transparent hover:border-white/40 hover:scale-[1.02]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span>Weather Maps</span>
        </Link>
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-8 border-t border-blue-400/30">
        <p className="text-xs text-blue-200 text-center opacity-75">
          Powered by Neon & Next.js
        </p>
      </div>
    </aside>
  );
}
