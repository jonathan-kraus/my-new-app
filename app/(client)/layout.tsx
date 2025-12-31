// app/(client)/layout.tsx - FULL AUTH STATES
"use client";
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function ProfileSection() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleLogin = () => {
    signIn("github");
  };

  if (status === "loading") {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 text-center">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl text-gray-500">👤</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Not Logged In</h2>
        <p className="text-gray-600 text-sm mb-6">Sign in with GitHub to continue</p>
        <button
          onClick={handleLogin}
          className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.185a3.015 3.015 0 004.515 1.125c1.125-1.38 2.91-1.755 4.455-1.335 1.35.405 2.73 1.38 2.73 2.91 0 2.19-.015 4.05-.015 4.605.015.435.315.945.825 1.125 1.02.57 2.505.82 4.032 1.125 0 1.515-.015 2.835-.015 3.225 0 .315.21.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign in with GitHub
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 sticky top-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {session.user?.name?.[0] || 'J'}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {session.user?.name || 'User'}
        </h2>
        <p className="text-gray-600 text-sm mb-6">{session.user?.email}</p>
        <p className="text-xs text-green-600 font-semibold mb-4 bg-green-100 px-3 py-1 rounded-full inline-block">
          Logged In ✅
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

// Layout unchanged below...
export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
