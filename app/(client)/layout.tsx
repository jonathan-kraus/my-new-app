// app/(client)/layout.tsx - V4.24.13 PERFECT
"use client";
import dynamic from "next/dynamic"; // ✅ ADD THIS
import { SessionProvider } from "next-auth/react";
import ClientNav from "../ClientNav";
import { ToasterClient } from "../components/ToasterClient";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			{" "}
			{/* ✅ V4.24.13 = NO PROPS */}
			<ClientNav />
			<main
				style={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					background: "rgba(255,255,255,0.9)",
					backdropFilter: "blur(10px)",
				}}
			>
				<div
					style={{
						flex: 1,
						overflowY: "auto",
						padding: "2rem",
						maxWidth: "1200px",
						margin: "0 auto",
						width: "100%",
					}}
				>
					{children}
				</div>
				<ToasterClient />
			</main>
		</SessionProvider>
	);
}
