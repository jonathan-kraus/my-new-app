// app/components/sidebar/UserPanel.tsx
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";

export default async function UserPanel() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;

  if (!user) {
    // Not logged in → show GitHub button
    return (
      <div className="mb-4 rounded-lg bg-blue-500/40 p-3 text-sm text-white">
        <p className="mb-2">Not signed in</p>
        <Link
          href="/api/auth/github" // or your Better Auth GitHub route
          className="inline-flex items-center rounded bg-black px-3 py-1 text-xs font-medium"
        >
          Sign in with GitHub
        </Link>
      </div>
    );
  }

  // Logged in → show profile info
  return (
    <div className="mb-4 rounded-lg bg-blue-500/40 p-3 text-xs text-white">
      <p className="font-semibold text-sm">{user.name ?? user.email}</p>
      <p className="opacity-80">{user.email}</p>
      <p className="mt-1 opacity-70 text-[11px]">User ID: {user.id}</p>
      <p className="mt-1 opacity-70 text-[11px]">
        Signed in session (Better Auth)
      </p>
    </div>
  );
}
