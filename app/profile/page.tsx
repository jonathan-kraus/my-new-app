import { auth } from "@/auth";

export default async function ProfilePage() {
  const session = await auth();

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">Profile</h1>

      {!session && <p className="opacity-70">You are not signed in.</p>}

      {session && (
        <div className="space-y-2">
          <p>
            <strong>User ID:</strong> {session.user?.id}
          </p>
          <p>
            <strong>Email:</strong> {session.user?.email}
          </p>
          <p>
            <strong>Session Expires:</strong> {session.expires}
          </p>
        </div>
      )}
    </div>
  );
}
