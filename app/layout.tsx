import Sidebar from '@/app/components/ServerSidebar';
import { ToasterClient } from '@/app/components/ToasterClient';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-[220px]">{children}</main>
        <ToasterClient />
      </body>
    </html>
  );
}
