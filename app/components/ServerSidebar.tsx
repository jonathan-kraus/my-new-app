// app/components/ServerSidebar.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link"; // ✅ Add this import

export default async function ServerSidebar() {
  const session = await getServerSession(authOptions);

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-900 text-white shadow-2xl min-h-screen flex flex-col z-40 border-r border-blue-400/50 backdrop-blur-xl">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-blue-500/30">
        <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-transparent bg-clip-text text-transparent mb-2 drop-shadow-lg">
          Weather Hub
        </h1>
        <p className="text-blue-200 text-xs font-medium tracking-wide opacity-90">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* User - Keep <a> for external auth */}
      <div className="p-6 border-b border-blue-500/30">
        {session?.user ? (
          <div className="group flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-white/40">
            {/* Profile is display only, no Link needed */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-blue-500/30 ring-2 ring-white/40 group-hover:ring-white/60 overflow-hidden shadow-lg">
              <img
                src={session.user.image || "/default-avatar.png"}
                alt={session.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm">
                {session.user.name}
              </p>
              <p className="text-blue-100 text-xs truncate opacity-90">
                {session.user.email}
              </p>
            </div>
          </div>
        ) : (
          <a
            href="/api/auth/signin/github"
            className="group flex items-center justify-center space-x-3 px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold text-white transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              {/* GitHub SVG */}
            </svg>
            <span>Sign in GitHub</span>
          </a>
        )}
      </div>

      {/* Nav - Use Link for internal pages */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        <div className="flex items-center space-x-3 px-4 py-2 text-blue-200 text-xs font-semibold uppercase tracking-wider opacity-75 mb-4">
          Apps
        </div>

        <Link
          href="/"
          className="nav-link-base nav-link-active flex items-center space-x-4"
        >
          <svg
            className="w-6 h-6 flex-shrink-0"
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
          className="nav-link-base nav-link flex items-center space-x-4"
        >
          <svg
            className="w-6 h-6 flex-shrink-0"
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
          className="nav-link-base nav-link flex items-center space-x-4"
        >
          <svg
            className="w-6 h-6 flex-shrink-0"
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
      </nav>
    </aside>
  );
}
