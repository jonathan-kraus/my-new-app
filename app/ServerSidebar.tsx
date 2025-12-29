// app/ServerSidebar.tsx
"use client"; // ✅ Client Component for hover effects

import Link from "next/link";
import Image from "next/image";

export default function ServerSidebar() {
	return (
		<aside
			style={{
				width: "290px",
				background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
				color: "white",
				height: "100vh",
				display: "flex",
				flexDirection: "column" as const,
				boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
				borderRight: "1px solid rgba(255,255,255,0.1)",
			}}
		>
			{/* Header */}
			<div style={{ padding: "2rem 1.5rem 1rem" }}>
				<h1
					style={{
						fontSize: "1.875rem",
						fontWeight: "900" as const,
						backgroundImage: "linear-gradient(90deg, white 0%, #93c5fd 100%)",
						WebkitBackgroundClip: "text" as const,
						WebkitTextFillColor: "transparent" as const,
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
			<div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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
						<p style={{ fontWeight: "600" as const, margin: "0 0 0.25rem 0", fontSize: "0.95rem" }}>
							Jonathan Kraus
						</p>
						<p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>jonat@example.com</p>
					</div>
				</div>
			</div>

			{/* Navigation */}
			<nav
				style={{
					flex: 1,
					padding: "1.5rem 1rem",
					display: "flex",
					flexDirection: "column" as const,
					gap: "0.75rem",
				}}
			>
				<div
					style={{
						padding: "0.5rem 0",
						color: "rgba(255,255,255,0.6)",
						fontSize: "0.75rem",
						fontWeight: "600" as const,
						textTransform: "uppercase" as const,
						letterSpacing: "0.05em",
					}}
				>
					Apps
				</div>

				<Link href="/" className="nav-active">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🏠</span>
					<span>Dashboard</span>
				</Link>

				<Link href="/forecast" className="nav-link">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🌤️</span>
					<span>Forecast</span>
				</Link>

				<Link href="/notes" className="nav-link">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>📝</span>
					<span>Notes</span>
				</Link>

				<Link href="/maps" className="nav-link">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🗺️</span>
					<span>Weather Maps</span>
				</Link>
			</nav>

			{/* Footer */}
			<div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
				<p
					style={{
						fontSize: "0.75rem",
						color: "rgba(255,255,255,0.6)",
						textAlign: "center" as const,
						margin: 0,
					}}
				>
					Powered by Neon & Next.js
				</p>
			</div>
		</aside>
	);
}
