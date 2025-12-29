import ServerSidebar from "./ServerSidebar";
import { ToasterClient } from "./components/ToasterClient";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Weather Hub</title>
      </head>
      <body style={{
        margin: 0,
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
      }}>
        <div style={{ display: 'flex', height: '100vh' }}>
          <ServerSidebar />
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
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
