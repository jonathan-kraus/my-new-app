// app\components\sidenav.tsx
"use client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export default function ServerSidebar() {
	const { data: session } = authClient.useSession();

	return (
		<aside
			style={{
				width: "290px",
				background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)",
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
			<div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
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
							<p style={{ fontWeight: "600", margin: "0 0 0.25rem 0", fontSize: "0.95rem" }}>
								{session.user.name || "User"}
							</p>
							<p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.8 }}>{session.user.email}</p>
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

				<Link href="/" className="nav-active">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🏠</span>
					<span>Dashboard</span>
				</Link>

				<Link href="/astronomy" className="nav-link">
					<span style={{ fontSize: "1.5rem", marginRight: "1rem" }}>🌤️</span>
					<span>Astronomy</span>
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

			{/* ✅ LOGOUT BUTTON */}
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
				<div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
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
