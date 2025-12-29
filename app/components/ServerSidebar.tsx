// app/components/ServerSidebar.tsx - COMPLETE VERSION
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import Image from "next/image";

export default async function ServerSidebar() {
  const session = await getServerSession(authOptions);

  return (
    <aside className="w-72 bg-gradient-to-b from-blue-600 via-blue-700 to-indigo-900 text-white shadow-2xl min-h-screen flex flex-col z-40 border-r border-blue-400/50 backdrop-blur-xl">
      {/* Header */}
      <div className="p-8 pb-6 border-b border-blue-500/30">
        <h1 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-transparent bg-clip-text text-transparent mb-2 drop-shadow-lg">
          Weather Hub
        </h1>
        <p className="text-blue-200 text-xs font-medium tracking-wide opacity-90">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* User Section */}
      <div className="p-6 border-b border-blue-500/30">
        {session?.user ? (
          <div className="group flex items-center space-x-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl transition-all duration-300 border border-white/20 hover:border-white/40">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-blue-500/30 ring-2 ring-white/40 group-hover:ring-white/60 overflow-hidden shadow-lg">
              <Image
                src={session.user.image || "/default-avatar.png"}
                alt={session.user.name || "User profile"}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-sm">
                {session.user.name || "User"}
              </p>
              <p className="text-blue-100 text-xs truncate opacity-90">
                {session.user.email || "No email"}
              </p>
            </div>
          </div>
        ) : (
          <a
            href="/api/auth/signin/github"
            className="group flex items-center justify-center space-x-3 px-6 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl font-bold text-white transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-[1.02] shadow-xl hover:shadow-2xl"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.035-.303-.535-1.523.117-3.176
