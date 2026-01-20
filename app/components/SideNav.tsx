"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ServerSidebar() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/astronomy", label: "Astronomy", icon: "🚀" },
    { href: "/forecast", label: "Forecast", icon: "🌤️" },
    { href: "/logs", label: "Logs", icon: "📘" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/activity/github", label: "GitHub", icon: "🐙" },
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

      {/* User */}
      <div
        style={{
          padding: "1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {session?.user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem",
              background: "rgba(255,255,255,0.15)",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
              }}
            >
              👤
            </div>
            <div>
              <p
                style={{
                  fontWeight: "600",
                  margin: "0 0 0.25rem 0",
                  fontSize: "0.95rem",
                }}
              >
                {session.user.name || "User"}
              </p>
              <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>
                {session.user.email}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => authClient.signIn.social({ provider: "github" })}
            className="w-full px-3 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
          >
            🔐 Sign In
          </button>
        )}
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

      {/* Logout */}
      {session?.user && (
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "auto",
          }}
        >
          <button
            onClick={() => authClient.signOut()}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "0.875rem 1.25rem",
              background: "rgba(239,68,68,0.2)",
              color: "white",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "12px",
              fontWeight: "600",
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.3)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.2)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      )}

      {/* Footer */}
      {!session?.user && (
        <div
          style={{
            padding: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
              margin: 0,
            }}
          >
            Powered by Neon & Next.js
          </p>
        </div>
      )}
    </aside>
  );
}
