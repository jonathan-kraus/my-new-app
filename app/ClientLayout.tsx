// app/ClientLayout.tsx - CLIENT-ONLY SessionProvider
'use client';

import { SessionProvider } from "next-auth/react";

import { ToasterClient } from "./components/ToasterClient";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
        minWidth: 0,
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto' as const,
          padding: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%'
        }}>
          {children}
        </div>
        <ToasterClient />
      </main>
    </SessionProvider>
  );
}
