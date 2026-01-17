"use client";
// app\ClientNav.tsx
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function ClientNav() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const link = (href: string, label: string, icon: string) => (
  <Link
    href={href}
    className={`block px-4 py-2 rounded-md transition-colors ${
      pathname === href
        ? "bg-blue-700 text-white font-semibold"
        : "hover:bg-blue-800 text-blue-100"
    }`}
  >
    {icon} {label}
  </Link>
);


  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white shadow-lg z-50">
      <nav className="flex flex-col gap-2 p-4">
        <div className="text-xs uppercase tracking-wide text-white/60 mb-2">
          Apps
        </div>

        {link("/", "Home", "🏠")}
        {link("/dashboard", "Dashboard", "🏠")}
        {link("/forecast", "Forecast", "🌤️")}
        {link("/notes", "Notes", "📝")}
        {link("/logs", "Logs", "📄")}
        {link("/astronomy", "Astronomy", "🚀")}
        {link("/weather-maps", "Weather Maps", "🗺️")}

        <div className="text-xs uppercase tracking-wide text-white/60 mt-6 mb-2">
          Admin
        </div>

        {link("/admin/runtime", "Runtime Config", "⚙️")}
      </nav>

      {session && (
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => authClient.signOut()}
            className="logout-btn w-full text-left"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
