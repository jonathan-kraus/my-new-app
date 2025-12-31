// app/ClientNav.tsx - 'use client'
'use client';
export const dynamic = "force-dynamic";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ClientNav() {
  const { data: session } = authClient.useSession();

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%)' }}>
      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ padding: '0.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          Apps
        </div>

        <Link href="/" className="nav-active">🏠 Dashboard</Link>
        <Link href="/forecast" className="nav-link">🌤️ Forecast</Link>
        <Link href="/notes" className="nav-link">📝 Notes</Link>
        <Link href="/weather-maps" className="nav-link">🗺️ Weather Maps</Link>
      </nav>

      {/* Logout */}
      {session && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => authClient.signOut()} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
