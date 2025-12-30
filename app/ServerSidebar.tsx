// app/ServerSidebar.tsx -
'use client';  // ✅ NOW CLIENT COMPONENT

import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { appLog } from "@/lib/logger";
appLog({ level: "info", message: "SideNav", page: "init" });
export default async function ServerSidebar() {
  const session = await getServerSession(authOptions);

  return (
    <div style={{ width: '290px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* SERVER: Header + Profile */}
      <div style={{ padding: '2rem 1.5rem 1rem', background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)', color: 'white', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 900, backgroundImage: 'linear-gradient(90deg, white, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
          Weather Hub
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>

        {/* Server Profile */}
        <div style={{ padding: '1.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {session?.user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👤
              </div>
              <div>
                <p style={{ fontWeight: 600, margin: 0 }}>{session.user.name}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>{session.user.email}</p>
              </div>
            </div>
          ) : (
            <a href="/api/auth/signin/github" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', textDecoration: 'none' }}>
              ⚡️ Sign in
            </a>
          )}
        </div>
      </div>

      {/* CLIENT: Navigation + Logout */}
    </div>
  );
}
