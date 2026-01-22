import { auth, signIn, signOut } from "@/auth";

export default async function ProfilePage() {
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
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in with GitHub
          </button>
        </form>
      )}

      {session && (
        <div className="space-y-4">
<div className="space-y-2">
  <p><strong>Name:</strong> {session.user?.name}</p>
  <p><strong>User ID:</strong> {session.user?.id}</p>
  <p><strong>Email:</strong> {session.user?.email}</p>
  <p><strong>Session Expires:</strong> {session.expires}</p>
</div>


          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
