/*
 * @FilePath: \my-new-app\app\profile\page.tsx
 * @LastEditTime: 2026-08-22 00:02:45
 */
import { auth, signIn, signOut } from "@/auth";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { formatDistanceToNow } from "date-fns";
import { ProfileCard } from "../components/ProfileCard";
export default async function ProfilePage() {
  const built = staticUniversalContext("Jonathan");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "Profile page loaded",
    file: "app/profile/page.tsx",
    line: 13,
    payload: {
      AUTH_URL: process.env.AUTH_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
    meta: { built: { ...built, eventIndex: ++jei } },
  });

  const session = await auth();

  if (!session) {
    return (
      <div className="p-8 space-y-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p>You are not signed in.</p>

        <form
          action={async () => {
            "use server";
            await signIn("github");
          }}
        >
          <button className="px-4 py-2 bg-blue-600 text-white rounded">
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }

  const expires2 = formatDistanceToNow(new Date(session.expires), {
    addSuffix: true,
  });

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>

      <ProfileCard
        name={session.user?.name}
        email={session.user?.email}
        id={session.user?.id}
        expires={expires2}
        image={session.user?.image}
      />

      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button className="px-4 py-2 bg-red-600 text-white rounded">
          Sign out
        </button>
      </form>
    </div>
  );
}
