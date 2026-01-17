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



            
            <main className="ml-64 p-6">
                  <ClientLayout>
                    {children}
                  </ClientLayout>
            </main>

        </div>
      </body>
    </html>
  );
}
