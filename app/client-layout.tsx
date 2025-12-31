"use client";


import ProfileSection from "./ProfileSection";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-3 space-y-6">
            <ProfileSection />

            {/* NAV */}
            <nav className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 space-y-2">
              <a href="/" className="block p-4 rounded-xl bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition-all">
                🏠 Home
              </a>
              <a href="/notes" className="block p-4 rounded-xl bg-purple-500 text-white font-semibold shadow-md hover:bg-purple-600 transition-all">
                📝 Notes
              </a>
              <a href="/forecast" className="block p-4 rounded-xl bg-indigo-500 text-white font-semibold shadow-md hover:bg-indigo-600 transition-all">
                📁 Forecast
              </a>
              <a href="/logs" className="block p-4 rounded-xl bg-gray-500 text-white font-semibold shadow-md hover:bg-gray-600 transition-all">
                📊 Logs
              </a>
              <a href="/weather-maps" className="block p-4 rounded-xl bg-emerald-500 text-white font-semibold shadow-md hover:bg-emerald-600 transition-all">
                🌤️ Weather
              </a>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <main className="lg:col-span-9">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/60 min-h-[600px]">
              {children}
            </div>
          </main>

        </div>
      </div>

  );
}
