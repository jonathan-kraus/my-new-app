/*
 * @FilePath: \my-new-app\app\ClientProviders.tsx
 * @LastEditTime: 2026-11-12 11:11:37
 */
// app/ClientProviders.tsx - CONDITIONAL SessionProvider
"use client";

import { ToasterClient } from "./components/ToasterClient";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={{ flex: 1, padding: "2rem" }}>
      {children}
      <ToasterClient />
    </main>
  );
}
