// app/layout.tsx
import "./globals.css";
import ClientLayout from '@/app/ClientLayout';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body className="bg-blue-950 text-white min-h-screen">
        <div style={{ display: 'flex' }}>



            {/* Content area is shifted to the right */}
            <main style={{ marginLeft: '220px', padding: '20px', flexGrow: 1 }}>
                  <ClientLayout>
                    {children}
                  </ClientLayout>
            </main>

        </div>
      </body>
    </html>
  );
}
