// app/layout.tsx - TYPE FIXED
import ServerSidebar from "./ServerSidebar";
import { ReactNode } from "react"; // ✅ ADD TYPE

export default function RootLayout({
	children,
}: {
	children: ReactNode; // ✅ TYPE CHILDREN
}) {
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
						width: "100vw",
					}}
				>
					<div
						style={{
							flexShrink: 0,
							width: "280px",
						}}
					>
						<ServerSidebar />
					</div>
					<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
				</div>
			</body>
		</html>
	);
}
