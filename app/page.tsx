// app/page.tsx
import getServerSession from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerSidebar() {
	const session = await getServerSession(authOptions);

	if (session?.user) {
		return (
			<div>
				<h1>Welcome {session.user.name}!</h1>
				<a href="/api/auth/signin/github">Sign out</a>
			</div>
		);
	}

	return (
		<div>
			<h1>My New App</h1>
			<a href="/api/auth/signin/github">
				<button>Sign in with GitHub</button>
			</a>
		</div>
	);
}
