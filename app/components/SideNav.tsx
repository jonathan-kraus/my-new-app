"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  //const { data: session, status } = useSession();

  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/github", label: "GitHub", icon: "🐙" },
    { href: "/debug/github", label: "GitHub", icon: "🐙" },
  ];

  const isActive = (href: string) => pathname === href;

  const baseLinkStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "0.75rem 1rem",
    borderRadius: "10px",
    fontWeight: 500,
    transition: "all 0.2s ease",
  };

  const activeStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.18)",
    boxShadow: "0 0 12px rgba(255,255,255,0.35)",
    transform: "translateX(4px)",
  };

  return (
    <aside
      style={{
        width: "290px",
        background:
          "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "2rem 1.5rem 1rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: "900",
            backgroundImage: "linear-gradient(90deg, white 0%, #93c5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 0.5rem 0",
          }}
        >
          Weather Hub
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.8)",
            margin: 0,
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "1.5rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            padding: "0.5rem 0",
            color: "rgba(255,255,255,0.6)",
            fontSize: "0.75rem",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Apps
        </div>

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              ...baseLinkStyle,
              ...(isActive(item.href) ? activeStyle : {}),
            }}
          >
            <span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
