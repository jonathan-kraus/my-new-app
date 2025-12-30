// app/layout.tsx - ONE SessionProvider + ONE ClientNav
export const dynamic = 'force-dynamic';
import ServerSidebar from "./ServerSidebar";
import ClientNav from "./ClientNav";
import { SessionProvider } from "next-auth/react";
import { ToasterClient } from "./components/ToasterClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ /* your gradient */ }}>
        <SessionProvider>
          <div style={{ display: 'flex', height: '100vh' }}>
            <ServerSidebar />     {/* NO ClientNav here */}
            <ClientNav />          {/* ONE TIME ONLY */}
            <main style={{ flex: 1, padding: '2rem' }}>
              {children}           {/* pages ONLY */}
              <ToasterClient />
            </main>
          </div>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
