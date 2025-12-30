// app/layout.tsx - SERVER ONLY (DEPLOYMENT SAFE)
import ServerSidebar from "./ServerSidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body
				style={
					{
						/* your gradient */
					}
				}
			>
				<div style={{ display: "flex", height: "100vh" }}>
					<ServerSidebar />
					<div style={{ flex: 1 }}>
						{" "}
						{/* NO SessionProvider! */}
						{children}
					</div>
				</div>
			</body>
		</html>
	);
}
