// app/(client)/page.tsx - PAGE-LEVEL SessionProvider
'use client';

import { SessionProvider } from "next-auth/react";
import ClientProviders from "@/app/ClientProviders";

export default function Home() {
  return (
    <SessionProvider>
      <ClientProviders>
        <h1>Weather Hub Home</h1>
      </ClientProviders>
    </SessionProvider>
  );
}
