/*
 * @FilePath: \my-new-app\app\components\ProfileCard.tsx
 * @LastEditTime: 2026-08-21 00:17:15
 */
"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function ProfileCard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="p-4 text-white/70 text-sm">Loading profile…</div>;
  }

  if (!session) {
    return (
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => signIn("github")}
          className="w-full px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
        >
          🔐 Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-white/10 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl">
        👤
      </div>
      <div>
        <p className="font-semibold">{session.user.name}</p>
        <p className="text-sm opacity-70">{session.user.email}</p>
      </div>
    </div>
  );
}
