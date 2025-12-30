// app/(client)/page.tsx - SESSION HERE
"use client";

import { SessionProvider } from "next-auth/react";
import ClientNav from "../ClientNav";

export default function Home() {
	return (
		<SessionProvider>
			<ClientNav />
			<h1>Weather Hub Home</h1>
		</SessionProvider>
	);
}
