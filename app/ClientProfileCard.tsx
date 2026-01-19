"use client";

import { authClient } from "@/lib/auth-client";

export default function ClientProfileCard() {
  const { data: session } = authClient.useSession();

  const isLoggedIn = !!session?.user;

  return (
    <div className="w-full rounded-xl bg-gradient-to-br from-indigo-700/70 to-purple-900/70 backdrop-blur-xl shadow-xl border border-white/10 animate-[float_6s_ease-in-out_infinite]">
      <div className="p-4 flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full bg-gradient-to-br
          from-purple-300 to-indigo-400 shadow-md"
        />

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {session?.user?.name ?? "Guest"}
          </span>
          <span className="text-xs text-blue-200">
            {session?.user?.email ?? "Not signed in"}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 text-xs text-blue-200">
        {isLoggedIn
          ? "🛰️ Mission Status: Online"
          : "🛰️ Mission Status: Offline"}
      </div>

      <div className="px-4 pb-4">
        {isLoggedIn ? (
          <button
            onClick={() => authClient.signOut()}
            className="w-full px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors"
          >
            🚪 Log Out
          </button>
        ) : (
          <button
            onClick={() => authClient.signIn.social({ provider: "github" })}
            className="w-full px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
          >
            🔐 Sign In
          </button>
        )}
      </div>
    </div>
  );
}
