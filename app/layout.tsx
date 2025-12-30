// app/layout.tsx - FLEX FIXED (from screenshot)
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				style={{
					margin: 0,
					minHeight: "100vh",
					background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #dbeafe 100%)",
					fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						height: "100vh",
						width: "100vw", // ✅ FIXES GOOFY LAYOUT
					}}
				>
					<ServerSidebar style={{ flexShrink: 0 }} /> {/* ✅ NO GROW */}
					<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
						{" "}
						{/* ✅ FLEX 1 */}
						{children}
					</div>
				</div>
			</body>
		</html>
	);
}
