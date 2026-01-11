"use client"
// components/Sidebar.tsx
import { usePathname } from "next/navigation";
import { SidebarItem } from "./SidebarItem";

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col py-6">
      <nav className="flex flex-col gap-1 px-3">
        <SidebarItem href="/" label="Dashboard" icon="🏠" active={isActive("/")} />
        <SidebarItem href="/astronomy" label="Astronomy" icon="🌅" active={isActive("/astronomy")} />
        <SidebarItem href="/notes" label="Notes" icon="📝" active={isActive("/notes")} />
        <SidebarItem href="/logs" label="Logs" icon="📜" active={isActive("/logs")} />
        <SidebarItem href="/api/ping" label="Ping" icon="📜" active={isActive("/logs")} />
      </nav>
    </aside>
  );
}
