"use client";

import { authClient } from "@/lib/auth-client";

type User = {
  id: string;
  email: string;
  name: string | null;
} | null;

export default function UserPanelClient({ user }: { user: User }) {
  if (!user) {
    return (
      <div className="mb-4 rounded-lg bg-blue-500/40 p-3 text-xs text-white">
        <p className="mb-2">Not signed in</p>

        <button
          onClick={() => authClient.signIn.social({ provider: "github" })}
          className="inline-flex items-center rounded bg-black px-3 py-1 text-[11px] font-medium"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg bg-blue-500/40 p-3 text-xs text-white">
      <p className="font-semibold text-sm">{user.name ?? user.email}</p>
      <p className="opacity-80">{user.email}</p>
      <p className="mt-1 opacity-70 text-[11px]">User ID: {user.id}</p>
    </div>
  );
}
