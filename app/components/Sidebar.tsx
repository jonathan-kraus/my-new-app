import { auth } from '@/auth';

export default async function Sidebar() {
  const session = await auth.api.getSession();

  return (
    <aside className="w-64 p-4 border-r min-h-screen flex flex-col gap-4">
      <h2 className="text-xl font-bold">My App</h2>

      {!session?.user && (
        <form
          action={async () => {
            'use server';
            await auth.api.signInWithProvider('github');
          }}
        >
          <button type="submit" className="px-4 py-2 bg-black text-white rounded">
            Sign in with GitHub
          </button>
        </form>
      )}

      {session?.user && (
        <>
          <div className="text-sm text-gray-600">
            Signed in as <strong>{session.user.email}</strong>
          </div>

          <form
            action={async () => {
              'use server';
              await auth.api.signOut();
            }}
          >
            <button type="submit" className="px-4 py-2 bg-gray-200 rounded">
              Logout
            </button>
          </form>
        </>
      )}
    </aside>
  );
}
