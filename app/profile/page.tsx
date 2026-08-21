/*
 * @FilePath: \my-new-app\app\profile\page.tsx
 * @LastEditTime: 2026-08-21 00:31:15
 */
import { auth, signIn, signOut } from "@/auth";
import { logj } from "@/lib/log/logj";
import { staticUniversalContext } from "@/lib/log/buildj";
import { formatDistanceToNow } from "date-fns";
import { ProfileCard } from "@/app/components/ProfileCard";
export default async function ProfilePage() {
  const built = staticUniversalContext("Jonathan");
  let jei = 0;
  await logj({
    domain: "Jonathan",
    level: "info",
    message: "Profile Page loaded",
    file: "app/profile/page.tsx",
    line: 12,
    payload: { some: "Profile Page loaded" },
    meta: { built: { ...built, eventIndex: ++jei } },
  });
  const session = await auth();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>

      {!session && (
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
      )}

      {session && (
        <>
          <p>Signed in as {session.user?.email}</p>
          <p>User ID: {session.user?.id}</p>
          Expires{" "}
          {formatDistanceToNow(new Date(session.expires), { addSuffix: true })}
          <br />
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
          <ProfileCard />
        </>
      )}
    </div>
  );
}
