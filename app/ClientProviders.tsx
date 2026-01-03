// app/ClientProviders.tsx - CONDITIONAL SessionProvider
"use client";

import ClientNav from "./ClientNav";
import { ToasterClient } from "./components/ToasterClient";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ClientNav />
      <main style={{ flex: 1, padding: "2rem" }}>
        {children}
        <ToasterClient />
      </main>
    </>
  );
}
