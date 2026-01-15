"use client";

import { authClient } from "@/lib/auth-client";

export default function ClientProfileCard() {
  const { data: session } = authClient.useSession();

  return (
    <div
      className="fixed top-4 left-4 z-[60] w-56 rounded-xl
      bg-gradient-to-br from-indigo-700/70 to-purple-900/70
      backdrop-blur-xl shadow-xl border border-white/10
      animate-[float_6s_ease-in-out_infinite]"
    >
      <div className="p-4 flex items-center gap-3">
        <div
          className="h-12 w-12 rounded-full bg-gradient-to-br
          from-purple-300 to-indigo-400 shadow-md"
        />

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">
            {session?.user?.name ?? "Jonathan"}
          </span>
          <span className="text-xs text-blue-200">
            {session?.user?.email ?? ""}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 text-xs text-blue-200">
        🛰️ Mission Status: Online
      </div>
    </div>
  );
}
