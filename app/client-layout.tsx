"use client";

import { SessionProvider } from "next-auth/react";
import ProfileSection from "./ProfileSection"; // move it to its own file

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3 space-y-6">
            <ProfileSection />

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 space-y-2">
              {/* nav links */}
            </div>
          </aside>

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
