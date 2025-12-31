// app/(client)/layout.tsx - WORKING LOGOUT
"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

function ProfileSection() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    router.push("/");
  };

  if (status === "loading") {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 sticky top-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {session?.user?.name?.[0] || 'J'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {session?.user?.name || 'Jonathan'}
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          {session?.user?.email || 'jonat@gmail.com'}
        </p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileSection />

            {/* NAV */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 space-y-2">
              <a href="/" className="block p-4 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-all">🏠 Home</a>
              <a href="/notes" className="block p-4 rounded-xl bg-purple-500 text-white font-semibold shadow-md hover:bg-purple-600 transition-all">📝 Notes</a>
              <a href="/files" className="block p-4 rounded-xl bg-indigo-500 text-white font-semibold shadow-md hover:bg-indigo-600 transition-all">📁 Files</a>
              <a href="/weather-maps" className="block p-4 rounded-xl bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600 transition-all">🌤️ Weather</a>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 min-h-[600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
