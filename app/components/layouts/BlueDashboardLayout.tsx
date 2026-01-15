// components/layouts/BlueDashboardLayout.tsx
import { Sidebar } from "@/components/Sidebar";

export default function BlueDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        {/*  <Sidebar />  */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
