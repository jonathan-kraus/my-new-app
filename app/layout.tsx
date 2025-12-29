// app/layout.tsx
import ServerSidebar from "@/app/components/ServerSidebar";
import { ToasterClient } from "@/app/components/ToasterClient";
import { Analytics } from "@vercel/analytics/next";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <ServerSidebar />
        <Analytics />
        <main className="flex-1 p-8 overflow-auto">
          {children}
          <ToasterClient />
        </main>
      </body>
    </html>
  );
}
