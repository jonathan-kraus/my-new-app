// app/components/Sidebar.tsx  (SERVER)
import UserPanel from "@/components/UserPanel";
import SidebarClient from "@/components/SidebarClient";

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-blue-600 text-white">
      <div className="p-4">
        <UserPanel /> {/* server-only auth + headers OK */}
      </div>
      <SidebarClient /> {/* client nav with usePathname */}
    </aside>
  );
}
